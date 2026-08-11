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

/** Book a request against a model. Called *before* the request goes out, not
 * after it comes back: two questions arriving together would otherwise both
 * read an empty budget and both fire, which is exactly the burst the limit
 * exists to stop. The token figure is an estimate; reconcile() corrects it. */
export function record(model: string, tokens: number): void {
  const now = Date.now();
  const state = stateFor(model, now);
  state.calls.push({ ts: now, tokens: Math.max(0, Math.round(tokens)) });
  state.dayCalls += 1;
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
