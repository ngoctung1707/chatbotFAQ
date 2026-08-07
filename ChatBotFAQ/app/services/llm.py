"""Build the grounded prompt and stream the model's answer (Gemini or Gemma,
both served through the same google-genai client).

The retrieved passages are passed as a numbered list so the model can cite by
number, and the answering rules go in the system instruction rather than being
repeated per turn — that keeps the per-question part of the request small.

`raw` is what reaches the model, not `content`: the breadcrumb prefix on
`content` exists to steer the *embedding*, and feeding it to the model would
just be noise it might quote back.
"""

import os
import sys
import time
from pathlib import Path

from google import genai
from google.genai import types

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

MODEL = os.environ.get("CHATBOT_MODEL", "gemini-3.1-flash-lite")
MAX_OUTPUT_TOKENS = 2048

# Thinking budgets are a Gemini-only feature (Gemma has no "thinking" mode), so
# this is only read/applied when MODEL is a Gemini model — see build_config().
# Kept for whoever switches back: on gemini-3.5-flash-lite the same question
# took 2.0s at MINIMAL and 148.8s at LOW, for answers that differed only in
# word choice, so MINIMAL was the right default there too.
THINKING_LEVEL = os.environ.get("CHATBOT_THINKING", "MINIMAL").upper()

# Give up rather than leave the browser watching an open stream that will never
# produce a token. Free-tier latency is wildly uneven — the same question was
# measured at 2.0s and at 148.8s — and from the user's side a slow call and a
# dead one look the same, so the only difference that matters is whether they
# are told.
TIMEOUT_MS = int(os.environ.get("CHATBOT_TIMEOUT_MS", "10000"))

# Free-tier requests per minute is per project *per model* and varies by model
# — check the current quota for MODEL on the AI Studio/API quota page and set
# CHATBOT_RPM to match. Nothing enforces it here — it is quoted so the 429
# message tells the user a number that matches their plan, and so the
# evaluation script has one place to read it from.
FREE_TIER_RPM = int(os.environ.get("CHATBOT_RPM", "15"))

# How many bullets the answer may use. Kept small on purpose: the failure mode
# of a grounded assistant is padding a thin retrieval into a full-looking answer.
MAX_POINTS = int(os.environ.get("CHATBOT_MAX_POINTS", "5"))

# The exact string the model must return when the passages do not answer the
# question. Fixed and short so it can be detected downstream, and so there is no
# room to soften a refusal into a guess.
NO_ANSWER = (
    "Tôi chưa rõ câu hỏi của bạn, bạn có thể đặt ra câu hỏi chi tiết hơn được không ạ?"
)
NOT_UPDATED = "Xin lỗi, tôi chưa được cập nhật thông tin mới nhất. Bạn có thể tham khảo các nguồn chính thức hoặc liên hệ trực tiếp với BKFintech để biết thông tin chi tiết."

SYSTEM_PROMPT = f"""\
Bạn là trợ lý BKFintech (Viện Công nghệ và Kinh tế số, ĐH Bách khoa Hà Nội). \
Chỉ dùng thông tin trong <data>. Không dùng kiến thức ngoài, không tra cứu \
ngoài, không suy luận thêm những gì văn bản không nói.
Văn phong:
- Xưng "mình", gọi người dùng là "bạn";
- Nói như trò chuyện. Mở đầu ngắn ("Dạ,") được; câu dẫn thủ tục \
("Dựa trên thông tin được cung cấp…", "Theo tài liệu…") không.
- Không chấm than, không nịnh, không xin lỗi dài dòng.
- <data> không đủ trả lời câu hỏi → trả lời đúng một câu, không gì khác: \
"{NOT_UPDATED}"
- nếu như bạn không hiểu câu hỏi của user hoặc phạm vi của câu hỏi quá rộng, hãy trả lời đúng một câu: "{NO_ANSWER}"
- <data> đúng đối tượng hỏi (khóa học, chương trình...) nhưng THIẾU chi tiết \
câu hỏi cần (chi phí, thời lượng, ngày khai giảng, năm thành lập...) → trả lời "{NOT_UPDATED}" \
kèm số nguồn xác nhận đối tượng. KHÔNG dùng câu "{NO_ANSWER}" cho trường hợp này.
- Trả lời thẳng vào vấn đề, không dẫn kiểu "Dựa vào văn bản/Theo thông tin cung cấp".
- Tối đa {MAX_POINTS} gạch đầu dòng; câu đơn giản thì 1 ý là đủ.
- Không bịa ngày tháng, số liệu, tên người, giá tiền ngoài <data>.
- Trả lời đúng ngôn ngữ câu hỏi; nguồn khác ngôn ngữ thì dịch phần cần dùng, \
không đổi ngôn ngữ trả lời, không xin lỗi vì điều đó.
Văn phong:
Xưng "mình", gọi người dùng là "bạn";
Nói như trò chuyện. Mở đầu ngắn ("Dạ,") được; câu dẫn thủ tục \
("Dựa trên thông tin được cung cấp…", "Theo tài liệu…") không.
Không chấm than, không nịnh, không xin lỗi dài dòng.
- Nguồn mâu thuẫn nhau → nêu cả hai, chỉ rõ khác biệt, không tự chọn một bên.
- Lượt hỏi-đáp trước chỉ dùng khi câu hỏi hiện tại phụ thuộc ngữ cảnh (đại từ, \
hỏi tiếp điều vừa nhắc). Chủ đề mới, độc lập → bỏ qua lượt trước.\
"""


def format_sources(chunks: list[dict]) -> str:
    blocks = []
    for i, chunk in enumerate(chunks, start=1):
        title = (chunk.get("title") or "").strip()
        published = chunk.get("published_at")
        header = f"[{i}] {title}" if title else f"[{i}]"
        if published:
            header += f" ({published})"
        blocks.append(f"{header}\n{chunk['url']}\n{chunk['raw']}")
    return "\n\n".join(blocks)


def build_user_message(question: str, chunks: list[dict]) -> str:
    """Question first, then the passages inside an explicit <data> boundary.

    The delimiter is doing real work: it marks exactly where quotable material
    starts and stops, so "only what is inside <data>" is a rule the model can
    actually check itself against, rather than a vague instruction about
    "the sources".
    """
    if not chunks:
        # Nothing retrieved is itself an empty <data> block, so the NO_ANSWER
        # rule applies on its own without a second code path here.
        return f"Câu hỏi: {question}\n\n<data>\n</data>"
    return f"Câu hỏi: {question}\n\n" "<data>\n" f"{format_sources(chunks)}\n" "</data>"


def build_contents(question: str, chunks: list[dict], history: list[dict]) -> list:
    """Prior turns plus the current question, as the multi-turn list the SDK
    expects — not one string with the history flattened into it, which would
    leave the model unable to tell where a past answer ends and the live
    question's <data> block begins.

    `history` stores roles as "user"/"assistant" (see chat_history.py); Gemini
    calls the model's own turns "model", so that rename happens only here, at
    the boundary, rather than leaking the Gemini-specific name into storage.
    """
    turns = [
        types.Content(
            role="model" if msg["role"] == "assistant" else "user",
            parts=[types.Part(text=msg["content"])],
        )
        for msg in history
    ]
    turns.append(
        types.Content(
            role="user",
            parts=[types.Part(text=build_user_message(question, chunks))],
        )
    )
    return turns


def build_config() -> types.GenerateContentConfig:
    kwargs = dict(
        system_instruction=SYSTEM_PROMPT,
        max_output_tokens=MAX_OUTPUT_TOKENS,
    )
    # Gemma rejects thinking_config outright — it's a Gemini-only field, so it
    # is only attached when MODEL is actually a Gemini model.
    if MODEL.startswith("gemini"):
        kwargs["thinking_config"] = types.ThinkingConfig(thinking_level=THINKING_LEVEL)
    return types.GenerateContentConfig(**kwargs)


def build_request(
    question: str, chunks: list[dict], history: list[dict] = None
) -> dict:
    """What gets sent to the API, as a plain dict for preview_prompt.py.

    Kept separate from `build_config()` so the prompt can be inspected without
    constructing SDK objects or holding an API key.
    """
    config = {"max_output_tokens": MAX_OUTPUT_TOKENS}
    if MODEL.startswith("gemini"):
        config["thinking_level"] = THINKING_LEVEL
    return {
        "model": MODEL,
        "system": SYSTEM_PROMPT,
        "contents": build_contents(question, chunks, history or []),
        "config": config,
    }


class MockAnswerer:
    """Stand-in for `Answerer` that never calls the API.

    Retrieval still runs for real; instead of an answer, the passages the model
    *would* have been given are printed verbatim. That makes the window the
    grounding actually reaches the model — `raw`, not `content` — readable in
    the browser. Set CHATBOT_MOCK=1 to select it.

    Matches the retriever's default top_k so the mock shows exactly what the
    model would have been given, not a sample of it.
    """

    SHOW = 7

    def stream(self, question: str, chunks: list[dict]):
        shown = chunks[: self.SHOW]
        yield (
            f"[CHẾ ĐỘ MOCK — không gọi LLM] Nội dung {len(shown)} đoạn gần "
            f"nhất với câu hỏi, trên tổng {len(chunks)} đoạn truy hồi được:\n"
        )
        for i, chunk in enumerate(shown, start=1):
            title = (chunk.get("title") or "").strip() or "(không có tiêu đề)"
            # Line by line rather than word by word: five full chunks streamed a
            # word at a time would take half a minute to finish drawing.
            for line in (
                f"\n{'─' * 60}\n"
                f"[{i}] score {chunk['score']:.4f} · {chunk.get('collection')} · {chunk['chunk_id']}\n"
                f"{title}\n{chunk['url']}\n\n{chunk['raw']}\n"
            ).splitlines(keepends=True):
                time.sleep(0.01)
                yield line


class AnswerTimeout(TimeoutError):
    pass


class Answerer:
    def __init__(self, client: genai.Client = None):
        # Resolves GEMINI_API_KEY, then GOOGLE_API_KEY, from the environment.
        # The HTTP timeout is the only one that can interrupt a call that has
        # not sent a single byte yet — a wall-clock check in the loop below
        # never runs, because the generator is still blocked inside the SDK.
        self.client = client or genai.Client(
            http_options=types.HttpOptions(timeout=TIMEOUT_MS)
        )

    def stream(self, question: str, chunks: list[dict], history: list[dict] = None):
        """Yield answer text as it is generated, or give up at the deadline.

        Streaming rather than a single response: a grounded answer over seven
        passages takes long enough that a chat window would otherwise sit blank.

        Two guards, because they catch different failures. The HTTP timeout
        handles a request that never starts; the deadline below handles one that
        starts and then trickles — measured on the free tier, the same question
        answered in 2s once and 148s another time, and the slow case looks
        identical to a hang from the browser.
        """
        deadline = time.monotonic() + TIMEOUT_MS / 1000
        for part in self.client.models.generate_content_stream(
            model=MODEL,
            contents=build_contents(question, chunks, history or []),
            config=build_config(),
        ):
            if part.text:
                yield part.text
            if time.monotonic() > deadline:
                raise AnswerTimeout(
                    f"Model không trả lời xong trong {TIMEOUT_MS / 1000:.0f} giây."
                )
