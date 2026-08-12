/**
 * Kiểm tra chat history có chạy đúng logic không, ở cả BA tầng nó đi qua:
 *
 *   A. Lưu trữ  — chatHistory.ts: append/trim/thứ tự/model ghim/xóa session.
 *   B. Prompt   — llm.ts buildMessages(): lượt cũ vào message list ra sao.
 *   C. Truy hồi — retriever.search({history}): history đi vào bước rewrite.
 *
 * Ba tầng này hỏng theo ba kiểu khác nhau và không tầng nào bắt lỗi hộ tầng
 * nào, nên gộp chung một script: history ghi sai thứ tự thì cả B lẫn C cùng sai
 * mà không tầng nào báo, còn C bị vô hiệu hóa (history không được truyền vào)
 * thì A và B vẫn xanh.
 *
 * Phần C chạy nguyên bộ 15 câu CORE của qa-cases NHƯ MỘT HỘI THOẠI LIÊN TỤC
 * qua đúng Mongo thật, lặp lại đúng trình tự route /api/chat làm: đọc history →
 * search(q, {history}) → ghi lại user + assistant. Đây mới là chỗ đo được thứ
 * qa-test.ts không đo: qa-test truyền history rỗng cho mọi câu nên với nó
 * history không tồn tại.
 *
 * Import thẳng code production, không chép lại logic — một bài test tự chấm
 * theo bản sao của nó thì đang đo một sản phẩm khác với sản phẩm đang chạy.
 *
 * Chạy: pnpm test:history          (dùng LLM thật cho phần C)
 *       CHATBOT_MOCK=1 pnpm test:history   (không tốn quota Gemini; retrieval
 *                                           và Mongo vẫn thật)
 *
 * Ghi/xóa trên collection chat_sessions thật, bằng session id ngẫu nhiên có
 * tiền tố "test-history-" và dọn sạch ở cuối. An toàn: collection này vốn là
 * dữ liệu tạm, TTL 1 giờ, không feature nào đọc session của người khác.
 */
import { randomUUID } from "crypto";
import {
  appendMessage,
  deleteSession,
  getHistory,
  getHistoryAndModel,
  setSessionModel,
  type ChatMessage,
} from "../src/lib/chatbot/chatHistory";
import { buildCallShape, buildMessages } from "../src/lib/chatbot/llm";
import { Retriever, type RetrievalChunk } from "../src/lib/chatbot/retriever";
import { HISTORY_MAX_MESSAGES, MOCK } from "../src/lib/chatbot/config";
import { CORE } from "./qa-cases";

let failures = 0;

function check(ok: boolean, label: string, detail = "") {
  if (!ok) failures++;
  console.log(`  ${ok ? "OK" : "XX"}  ${label}${detail ? ` — ${detail}` : ""}`);
}

const sid = (tag: string) => `test-history-${tag}-${randomUUID()}`;
const shape = (h: ChatMessage[]) =>
  h.map((m) => `${m.role[0]}:${m.content.slice(0, 14)}`).join(" ");

// --- A. Tầng lưu trữ -------------------------------------------------------

async function testStorage(): Promise<void> {
  console.log("\n=== A. Lưu trữ (chatHistory.ts) ===");
  const id = sid("storage");

  const fresh = await getHistoryAndModel(id);
  check(fresh.history.length === 0, "session mới trả history rỗng");
  check(fresh.model === null, "session mới chưa ghim model");

  // 8 message = 4 cặp, vượt HISTORY_MAX_MESSAGES (6) đúng một cặp. Đánh số để
  // biết CÁI NÀO bị cắt: cắt nhầm đầu kia thì độ dài vẫn đúng 6 mà nội dung là
  // 6 message CŨ nhất — lỗi im lặng tệ nhất ở tầng này, vì bot khi đó luôn nhớ
  // đoạn đầu hội thoại và quên lượt vừa xong.
  for (let i = 1; i <= 4; i++) {
    await appendMessage(id, "user", `câu hỏi ${i}`);
    await appendMessage(id, "assistant", `trả lời ${i}`);
  }
  const trimmed = await getHistory(id);
  check(
    trimmed.length === HISTORY_MAX_MESSAGES,
    `cắt còn đúng HISTORY_MAX_MESSAGES (${HISTORY_MAX_MESSAGES})`,
    `thực tế ${trimmed.length}`
  );
  // 8 message giữ 6 cuối = bỏ trọn cặp CŨ nhất (u1/a1), nên cửa sổ còn lại mở
  // đầu bằng "câu hỏi 2". Đúng cái cần: $slice cắt theo số message chứ không
  // theo cặp, nên nếu một lượt nào đó chỉ ghi được một nửa cặp thì cửa sổ sẽ
  // mở đầu bằng assistant — trường hợp buildCallShape phải lo (xem phần B).
  check(
    trimmed[0].content === "câu hỏi 2",
    "giữ phần ĐUÔI (cặp cũ nhất bị đẩy ra), không phải phần đầu",
    `đầu danh sách = "${trimmed[0]?.content}"`
  );
  check(
    trimmed[trimmed.length - 1].content === "trả lời 4",
    "message mới nhất nằm cuối (thứ tự cũ → mới)"
  );
  check(
    trimmed.every((m, i) => m.role === (i % 2 === 0 ? "user" : "assistant")),
    "role xen kẽ đúng, không bị đảo cặp",
    shape(trimmed)
  );

  await setSessionModel(id, "gemini-3.1-flash-lite");
  const pinned = await getHistoryAndModel(id);
  check(pinned.model === "gemini-3.1-flash-lite", "ghim được model của phiên");
  check(
    pinned.history.length === HISTORY_MAX_MESSAGES,
    "ghim model không đụng tới messages"
  );

  // Ghim model cho một session CHƯA có message nào: đây là thứ tự thật ở
  // route.ts (onModel chạy ở token đầu, trước appendMessage), nên nếu upsert
  // hỏng thì đúng lượt đầu tiên — lượt chọn model — lại là lượt không ghi được.
  const early = sid("early-pin");
  await setSessionModel(early, "gemini-3.5-flash-lite");
  const earlyRead = await getHistoryAndModel(early);
  check(
    earlyRead.model === "gemini-3.5-flash-lite" && earlyRead.history.length === 0,
    "ghim được model trước khi có message nào (upsert)"
  );
  await deleteSession(early);

  await deleteSession(id);
  const gone = await getHistoryAndModel(id);
  check(gone.history.length === 0 && gone.model === null, "xóa sạch session");
  await deleteSession(id);
  check(true, "xóa lần hai không ném lỗi (idempotent)");
}

// --- B. Tầng prompt --------------------------------------------------------

function testPrompt(): void {
  console.log("\n=== B. Prompt (llm.ts buildMessages) ===");
  const history: ChatMessage[] = [
    { role: "user", content: "Khóa Fintech Foundation dạy gì?" },
    { role: "assistant", content: "Khóa học tập trung vào..." },
  ];
  const chunks = [
    {
      index: 0,
      score: 0.9,
      chunk_id: "c1",
      url: "https://example.test/a",
      title: "Khóa học",
      raw: "Học phí 5 triệu đồng.",
    },
  ] as unknown as RetrievalChunk[];

  const msgs = buildMessages("Học phí bao nhiêu?", chunks, history);
  check(msgs.length === history.length + 1, "history + câu hiện tại, không mất lượt nào");
  check(
    msgs[0].role === "user" && msgs[1].role === "assistant",
    "giữ nguyên thứ tự và role của lượt cũ"
  );
  check(msgs[msgs.length - 1].role === "user", "câu hỏi hiện tại là message cuối");
  const last = String(msgs[msgs.length - 1].content);
  check(last.includes("Học phí bao nhiêu?"), "câu hỏi hiện tại có trong message cuối");
  check(
    last.includes("Học phí 5 triệu đồng."),
    "<data> gắn vào lượt HIỆN TẠI, không gắn vào lượt cũ"
  );
  check(
    !String(msgs[0].content).includes("Học phí 5 triệu"),
    "lượt cũ không bị chèn thêm chunk"
  );

  // Nhánh Gemma: không nhận system_instruction nên rules phải chèn vào user
  // turn ĐẦU TIÊN. Có history thì messages[0] vẫn là user, nhưng nếu history
  // mở đầu bằng assistant (session bị cắt giữa chừng) thì messages[0] là
  // assistant — đó là lý do buildCallShape dùng findIndex chứ không dùng [0].
  const withAssistantFirst: ChatMessage[] = [
    { role: "assistant", content: "Xin chào" },
    ...history,
  ];
  const gemma = buildCallShape(
    { id: "gemma-3-27b-it", rpm: 1, tpm: 1, rpd: 1, tier: 0, supportsSystemInstruction: false },
    "Học phí bao nhiêu?",
    chunks,
    withAssistantFirst
  );
  const gemmaMsgs = gemma.messages;
  check(!("system" in gemma), "model không hỗ trợ system → không gửi system");
  check(
    gemmaMsgs[0].role === "assistant",
    "history mở đầu bằng assistant vẫn được giữ nguyên vị trí"
  );
  const firstUser = gemmaMsgs.find((m) => m.role === "user");
  check(
    String(firstUser?.content).length > String(withAssistantFirst[1].content).length,
    "rules chèn vào user turn ĐẦU TIÊN (không phải messages[0])"
  );
}

// --- C. Tầng truy hồi: 15 câu chạy như một hội thoại ------------------------

async function testConversation(): Promise<void> {
  console.log("\n=== C. 15 câu CORE chạy như MỘT hội thoại (Mongo + retrieval thật) ===");
  console.log(`    MOCK=${MOCK}`);

  const { answerStream } = await import("../src/lib/chatbot/llm");
  const retriever = new Retriever();
  const id = sid("convo");
  const ids = (cs: RetrievalChunk[]) => cs.map((c) => c.chunk_id).join(" | ");

  let overCap = 0;
  let changedTopK = 0;
  const changed: string[] = [];

  for (const c of CORE) {
    // Đúng trình tự route.ts: history đọc TRƯỚC, rồi mới search.
    const { history, model: pinnedModel } = await getHistoryAndModel(id);
    if (history.length > HISTORY_MAX_MESSAGES) overCap++;

    const { chunks } = await retriever.search(c.q, { history });
    // Đường cơ sở: chính câu đó, KHÔNG history. Khác nhau nghĩa là history đã
    // đổi kết quả truy hồi — giờ chỉ còn đúng một đường để điều đó xảy ra:
    // bước rewrite nhìn thấy lượt trước và viết ra truy vấn khác. Với 15 câu
    // CORE (đều độc lập, tự nêu chủ đề) thì con số này nên ở mức thấp.
    const { chunks: baseline } = await retriever.search(c.q, { history: [] });
    const same = ids(chunks) === ids(baseline);
    if (!same) {
      changedTopK++;
      changed.push(`[${c.id}] ${c.q}`);
    }

    let reply = "";
    if (chunks.length > 0) {
      const parts: string[] = [];
      for await (const t of answerStream(c.q, chunks, history, { pinnedModel })) {
        parts.push(t);
      }
      reply = parts.join("");
    } else {
      // route.ts KHÔNG ghi history khi retrieval rỗng — lặp lại đúng như vậy,
      // nếu không thì bài test này đo một luồng không tồn tại trong production.
      reply = "";
    }

    console.log(
      `  [${String(c.id).padStart(2)}] hist=${String(history.length).padStart(
        2
      )} ${same ? "==" : "!!"} chunks=${String(chunks.length).padStart(2)}  ${c.q.slice(
        0,
        44
      )}`
    );

    if (chunks.length > 0) {
      await appendMessage(id, "user", c.q);
      await appendMessage(id, "assistant", reply);
    }

    if (!MOCK) await new Promise((r) => setTimeout(r, 4500)); // free tier 15 RPM
  }

  const final = await getHistory(id);
  console.log();
  check(overCap === 0, `history không lượt nào vượt ${HISTORY_MAX_MESSAGES} message`);
  check(
    final.length <= HISTORY_MAX_MESSAGES,
    "history cuối hội thoại vẫn trong giới hạn",
    `${final.length} message`
  );
  check(
    final.length > 0,
    "history có được ghi thật (không phải luôn rỗng)",
    shape(final)
  );
  check(
    final.some((m) => m.role === "user") && final.some((m) => m.role === "assistant"),
    "history chứa cả hai vai"
  );
  console.log(
    `  --  ${changedTopK}/${CORE.length} lượt bị history làm đổi top-K ` +
      `(qua bước rewrite)`
  );
  for (const q of changed) console.log(`      đổi: ${q}`);

  await deleteSession(id);
}

// --- D. Hội thoại follow-up thật (thứ mà 15 câu CORE không đo được) --------

async function testFollowUp(): Promise<void> {
  console.log("\n=== D. Follow-up thật: history CÓ cứu được câu hỏi mất chủ đề không ===");
  // Phần này từng kiểm tính năng ghép ngữ cảnh (nối câu hỏi trước vào trước câu
  // hiện tại). Tính năng đó đã bị xoá; bài toán thì vẫn y nguyên, chỉ đổi cơ
  // chế giải — giờ là queryRewriter.ts. Nên bài test được trỏ sang cơ chế mới
  // chứ không xoá theo: thứ cần bảo vệ là HÀNH VI ("lượt 2 phải biết lượt 1 nói
  // về cái gì"), không phải cách cài đặt.
  if (MOCK) {
    console.log(
      "  -- BỎ QUA: CHATBOT_MOCK đang bật nên rewriteQuery() không gọi LLM.\n" +
        "     Chạy lại với CHATBOT_MOCK=0 để đo phần này."
    );
    return;
  }
  const retriever = new Retriever();
  const id = sid("followup");

  const turn1 = "BK Fintech có những khóa học ngắn hạn nào?";
  const turn2 = "Học phí bao nhiêu?";

  const c1 = await retriever.search(turn1, { history: [] });
  await appendMessage(id, "user", turn1);
  await appendMessage(id, "assistant", c1.chunks.map((c) => c.title).join("; "));

  const { history } = await getHistoryAndModel(id);
  const withHist = await retriever.search(turn2, { history });
  const without = await retriever.search(turn2, { history: [] });

  console.log(`  lượt 1: ${turn1}`);
  console.log(`  lượt 2: ${turn2}`);
  console.log(`  query CÓ history:    ${withHist.searchQuery}`);
  console.log(`  query KHÔNG history: ${without.searchQuery}`);
  check(history.length === 2, "lượt 1 đã vào history trước khi lượt 2 chạy");
  // Điều kiện cốt lõi: history phải làm ĐỔI truy vấn. Nếu hai chuỗi bằng nhau
  // thì bước rewrite đã không đọc lượt trước, và cả tính năng coi như chết —
  // đúng kiểu hỏng mà nhìn câu trả lời không thấy được.
  check(
    withHist.searchQuery !== without.searchQuery,
    "history làm đổi truy vấn tìm kiếm của lượt 2"
  );
  check(
    withHist.searchQuery.toLowerCase() !== turn2.toLowerCase(),
    "truy vấn lượt 2 không còn là câu hỏi trần mất chủ đề"
  );

  const url = (cs: RetrievalChunk[]) => new Set(cs.map((c) => c.url));
  const gained = [...url(withHist.chunks)].filter((u) => !url(without.chunks).has(u));
  console.log(
    `  top-K không history: ${without.chunks.length} đoạn, ${url(without.chunks).size} url`
  );
  console.log(
    `  top-K có history:    ${withHist.chunks.length} đoạn, ${url(withHist.chunks).size} url`
  );
  for (const u of gained) console.log(`      + ${u}`);
  check(gained.length > 0, "history kéo về được trang mà câu hỏi trần không tìm ra");

  await deleteSession(id);
}

async function main() {
  await testStorage();
  testPrompt();
  await testConversation();
  await testFollowUp();

  console.log(
    failures === 0
      ? "\nTất cả kiểm tra chat history đều đúng."
      : `\n${failures} kiểm tra SAI.`
  );
  // Client Mongo được cache trên global và không có hàm đóng, nên phải thoát
  // tay, nếu không process treo sau khi in xong.
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
