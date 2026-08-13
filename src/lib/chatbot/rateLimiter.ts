/**
 * In-memory usage counters per model, used to pick which model to call *before*
 * asking it — rather than discovering the limit by getting a 429 back.
 *
 * Reacting to 429 alone costs the user a full round-trip of latency for a
 * request that was never going to be served, on every question once a model is
 * saturated. Counting locally means the saturated model is simply not first in
 * line any more, and nobody waits for the rejection.
 *
 * The counters are a *guess*, not a ledger: token counts are estimated from
 * character length, and Google's own counters live somewhere else and started
 * at a different instant. Everything here is built around that being true —
 * BUDGET_HEADROOM leaves a margin for the drift, reconcile() narrows it after
 * the fact, and rankModels() never removes a model from the list on the
 * strength of a local number alone. See the README for the multi-instance
 * limitation: this state is per warm process, so N instances each think they
 * own the whole quota.
 */
import { BUDGET_HEADROOM, MODEL_POOL, type ModelLimits } from "./config";

export interface Usage {
  model: string;
  /** Requests in the last 60s. */
  rpmUsed: number;
  /** Tokens (estimated, then reconciled) in the last 60s. */
  tpmUsed: number;
  /** Requests so far in the current Pacific day. */
  rpdUsed: number;
  /** Worst of the three ratios, including the request being weighed. >= 1 means
   * no budget left by local reckoning. */
  load: number;
  /** ms left on a cooldown set by a 429, 0 if not cooling down. */
  cooldownMs: number;
}

interface Call {
  ts: number;
  tokens: number;
}

interface ModelState {
  /** One entry per request in the trailing minute; carries both counters
   * because RPM and TPM share the same window and the same prune pass. */
  calls: Call[];
  /** Pacific day key ("YYYY-MM-DD") the daily counter below belongs to. */
  day: string;
  dayCalls: number;
  /** Wall-clock ms; 0 when not cooling down. */
  cooldownUntil: number;
}

// Cached on globalThis for the same reason chatHistory.ts caches its Mongo
// client: Next dev mode re-evaluates modules on hot reload, and a plain
// module-level Map would reset every counter to zero on each edit — which is
// precisely when someone is watching to see whether the counters work.
declare global {
  var _chatbotModelUsage: Map<string, ModelState> | undefined;
}
const states: Map<string, ModelState> =
  global._chatbotModelUsage || (global._chatbotModelUsage = new Map());

const WINDOW_MS = 60_000;

// Google's RPD resets at midnight *Pacific*, not local time. Hanoi is UTC+7 and
// Pacific is UTC-7/-8, so a day boundary taken locally lands up to 15 hours off
// the real one: the counter would clear while the day's quota was still spent,
// and the pool would confidently pick a model that has nothing left.
// en-CA is the shortest way to a "YYYY-MM-DD" key out of Intl; the value is
// only ever compared for equality, never displayed.
const PACIFIC_DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
});

function pacificDay(now: number): string {
  return PACIFIC_DAY.format(now);
}

/** Default cooldown when a 429 arrives without a parseable retryDelay. 60s
 * because the limit most often hit is per-minute, so a full window is the
 * shortest wait that is certain to clear it. */
const DEFAULT_COOLDOWN_MS = 60_000;

function stateFor(model: string, now: number): ModelState {
  let state = states.get(model);
  if (!state) {
    state = { calls: [], day: pacificDay(now), dayCalls: 0, cooldownUntil: 0 };
    states.set(model, state);
  }
  // Pruning on read rather than on a timer: there is no process-wide scheduler
  // to hang one off in a serverless function, and a model nobody asks about
  // does not need its window trimmed.
  const cutoff = now - WINDOW_MS;
  if (state.calls.length && state.calls[0].ts <= cutoff) {
    state.calls = state.calls.filter((c) => c.ts > cutoff);
  }
  const day = pacificDay(now);
  if (state.day !== day) {
    state.day = day;
    state.dayCalls = 0;
  }
  return state;
}

// ─────────────────────── Log mỗi lượt gọi model ───────────────────────

/** Bước nào của pipeline đang tiêu lượt request này. Thuần để đọc log: mỗi câu
 * hỏi tiêu HAI lượt (viết lại + trả lời) trên cùng một bucket RPM, và nếu không
 * phân biệt được thì "rpm 14/15" trông như 14 người dùng trong khi thực tế mới
 * có 7. */
export type CallPurpose = "answer" | "rewrite";

const PURPOSE_LABEL: Record<CallPurpose, string> = {
  answer: "trả lời",
  rewrite: "viết lại",
};

// Cùng quy ước với CHATBOT_LOG_CHUNKS bên route.ts: mặc định BẬT, đặt "0" để
// tắt. Log này in một dòng cho mỗi lượt gọi model, nên nó là thứ đầu tiên người
// ta muốn tắt khi chạy một script đo hàng loạt.
const LOG_CALLS = process.env.CHATBOT_LOG_CALLS !== "0";

/** 12400 -> "12.4k". Giữ dòng log đủ ngắn để mắt bắt được cả ba cặp số cùng
 * lúc — TPM là con số duy nhất ở đây có sáu chữ số. */
function compact(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k < 100 ? k.toFixed(1) : Math.round(k)}k`;
}

/**
 * Một dòng cho một lượt gọi model, in NGAY SAU khi đã book.
 *
 * In sau chứ không phải trước, và đó là chủ đích: các con số phải đã bao gồm
 * chính lượt request này. Một dòng ghi "rpm 14/15" rồi ngay sau đó là 429 thì
 * đọc như một mâu thuẫn, trong khi thực ra nó là lượt thứ 15.
 *
 * Token là ƯỚC LƯỢNG tại thời điểm này — reconcile() thay bằng số thật của
 * provider sau khi stream xong, nên con số tpm ở dòng sau có thể nhỏ hơn dòng
 * trước cho cùng một model. Đó không phải lỗi.
 *
 * `console.log` chứ không phải một logger thật vì cả file này lẫn route.ts đều
 * dùng vậy; đổi thì đổi cả cụm, không đổi lẻ một chỗ.
 */
function logCall(
  model: string,
  purpose: CallPurpose | undefined,
  state: ModelState,
  now: number
): void {
  const limits = MODEL_POOL.find((m) => m.id === model);
  const rpmUsed = state.calls.length;
  const tpmUsed = state.calls.reduce((sum, c) => sum + c.tokens, 0);
  const cooling = Math.max(0, state.cooldownUntil - now);

  // Model không nằm trong pool (id truyền tay từ script test) thì không có trần
  // để so — in số đã dùng thôi, còn hơn là bịa ra mẫu số.
  const quota = limits
    ? `rpm ${rpmUsed}/${limits.rpm} · tpm ${compact(tpmUsed)}/${compact(limits.tpm)} · rpd ${state.dayCalls}/${limits.rpd}`
    : `rpm ${rpmUsed} · tpm ${compact(tpmUsed)} · rpd ${state.dayCalls} (ngoài pool)`;

  // load lặp lại đúng công thức của usageFor() nhưng KHÔNG cộng thêm lượt nào:
  // ở đó nó trả lời "lượt tiếp theo có lọt không", ở đây là "đã tiêu bao nhiêu
  // phần quota". Cộng thêm một lượt nữa sẽ đếm đúp chính lượt vừa book.
  const load = limits
    ? Math.max(
        rpmUsed / (limits.rpm * BUDGET_HEADROOM),
        tpmUsed / (limits.tpm * BUDGET_HEADROOM),
        state.dayCalls / (limits.rpd * BUDGET_HEADROOM)
      )
    : 0;

  console.log(
    `    ⇢ gọi ${model}` +
      (purpose ? ` · ${PURPOSE_LABEL[purpose]}` : "") +
      ` · ${quota}` +
      (limits ? ` · đã tiêu ${(load * 100).toFixed(0)}% ngân sách` : "") +
      (cooling > 0 ? ` · CÒN COOLDOWN ${Math.ceil(cooling / 1000)}s` : "")
  );
}

/** Book a request against a model. Called *before* the request goes out, not
 * after it comes back: two questions arriving together would otherwise both
 * read an empty budget and both fire, which is exactly the burst the limit
 * exists to stop. The token figure is an estimate; reconcile() corrects it.
 *
 * `purpose` chỉ đi vào log, không ảnh hưởng gì tới bộ đếm — xem logCall(). */
export function record(
  model: string,
  tokens: number,
  purpose?: CallPurpose
): void {
  const now = Date.now();
  const state = stateFor(model, now);
  state.calls.push({ ts: now, tokens: Math.max(0, Math.round(tokens)) });
  state.dayCalls += 1;
  if (LOG_CALLS) logCall(model, purpose, state, now);
}

/** Replace the estimate booked by record() with the count the provider
 * reported, once the stream has finished.
 *
 * Corrects the newest entry rather than tracking which entry belonged to which
 * call: only the sum over the window is ever read, so moving the difference
 * onto any live entry gives the same total, and a scheme that threaded a handle
 * back from record() would buy nothing but bookkeeping. */
export function reconcile(model: string, actualTokens: number): void {
  const now = Date.now();
  const state = stateFor(model, now);
  const last = state.calls[state.calls.length - 1];
  if (!last) return;
  last.tokens = Math.max(0, Math.round(actualTokens));
}

/** Park a model until its limit is likely to have cleared, after a 429.
 *
 * This is the one signal here that comes from Google rather than from a local
 * guess, so it outranks the counters: a model in cooldown drops behind every
 * model that is not, whatever its own load says. */
export function markExhausted(model: string, retryAfterMs?: number): void {
  const now = Date.now();
  const state = stateFor(model, now);
  const wait =
    retryAfterMs !== undefined && retryAfterMs > 0
      ? retryAfterMs
      : DEFAULT_COOLDOWN_MS;
  // Never shorten an existing cooldown — a second 429 arriving from a request
  // that was already in flight must not undo a longer wait Google asked for.
  state.cooldownUntil = Math.max(state.cooldownUntil, now + wait);
}

function usageFor(limits: ModelLimits, estTokens: number, now: number): Usage {
  const state = stateFor(limits.id, now);
  const rpmUsed = state.calls.length;
  const tpmUsed = state.calls.reduce((sum, c) => sum + c.tokens, 0);
  const rpdUsed = state.dayCalls;
  // Each ratio includes the request being weighed, so load answers "would this
  // request still fit?" and not "did the last one fit?" — the second question
  // lets the request that crosses the line through every time.
  const load = Math.max(
    (rpmUsed + 1) / (limits.rpm * BUDGET_HEADROOM),
    (tpmUsed + estTokens) / (limits.tpm * BUDGET_HEADROOM),
    (rpdUsed + 1) / (limits.rpd * BUDGET_HEADROOM)
  );
  return {
    model: limits.id,
    rpmUsed,
    tpmUsed,
    rpdUsed,
    load: Math.round(load * 1000) / 1000,
    cooldownMs: Math.max(0, state.cooldownUntil - now),
  };
}

/**
 * Every model in the pool, in the order they should be tried for a request of
 * roughly `estTokens` tokens.
 *
 * Models with budget come first, best tier first — quality order, not
 * round-robin. Spreading load evenly across tiers when nothing is saturated
 * would mean the same question gets a different quality of answer depending on
 * which way a counter fell, and a report of "the bot said something strange"
 * could not be reproduced.
 *
 * Nothing is ever dropped from the list. The counters are an estimate, and an
 * estimate that is wrong in the pessimistic direction would have the assistant
 * refuse to answer while real quota sat unused; being wrong in the other
 * direction only costs one 429 and a step down the list.
 */
export function rankModels(
  estTokens = 0
): { limits: ModelLimits; usage: Usage }[] {
  const now = Date.now();
  const rows = MODEL_POOL.map((limits) => ({
    limits,
    usage: usageFor(limits, estTokens, now),
  }));
  const hasBudget = (r: (typeof rows)[number]) =>
    r.usage.load < 1 && r.usage.cooldownMs === 0;

  return rows.sort((a, b) => {
    const [ab, bb] = [hasBudget(a), hasBudget(b)];
    if (ab !== bb) return ab ? -1 : 1;
    if (ab) {
      // Both usable: quality decides, and load only breaks a tier tie (two
      // models sharing a tier are interchangeable by definition, so the
      // emptier one is the better bet).
      if (a.limits.tier !== b.limits.tier) return a.limits.tier - b.limits.tier;
      return a.usage.load - b.usage.load;
    }
    // Both out of budget: least-overdrawn first, since one of these is going to
    // be asked anyway and it may as well be the one closest to having room.
    return a.usage.load - b.usage.load;
  });
}

/** Current counters for every model, for /api/health. `estTokens` is 0 here on
 * purpose: this reports what has been spent, not what a hypothetical next
 * question would cost. */
export function poolStatus(): Usage[] {
  const now = Date.now();
  return MODEL_POOL.map((limits) => usageFor(limits, 0, now));
}
