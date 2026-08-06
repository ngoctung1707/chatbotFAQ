"""Build the grounded prompt and stream Gemini's answer.

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

MODEL = os.environ.get("CHATBOT_MODEL", "gemini-3.5-flash-lite")
MAX_OUTPUT_TOKENS = 2048

# Answering from supplied passages is extraction, not open reasoning, and the
# measurements say so: on gemini-3.5-flash-lite the same question took 2.0s at
# MINIMAL and 148.8s at LOW, for answers that differed only in word choice —
# same three bullets, same facts, same citations. Nothing here needs a model to
# deliberate; the passages are already in front of it.
THINKING_LEVEL = os.environ.get("CHATBOT_THINKING", "MINIMAL").upper()

# Give up rather than leave the browser watching an open stream that will never
# produce a token. Free-tier latency is wildly uneven — the same question was
# measured at 2.0s and at 148.8s — and from the user's side a slow call and a
# dead one look the same, so the only difference that matters is whether they
# are told.
TIMEOUT_MS = int(os.environ.get("CHATBOT_TIMEOUT_MS", "10000"))

# Free-tier requests per minute, which is per project *per model*: 15 on
# gemini-3.5-flash-lite, 5 on gemini-3.6-flash. Nothing enforces it here — it is
# quoted so the 429 message tells the user a number that matches their plan, and
# so the evaluation script has one place to read it from.
FREE_TIER_RPM = int(os.environ.get("CHATBOT_RPM", "15"))

# How many bullets the answer may use. Kept small on purpose: the failure mode
# of a grounded assistant is padding a thin retrieval into a full-looking answer.
MAX_POINTS = int(os.environ.get("CHATBOT_MAX_POINTS", "5"))

# The exact string the model must return when the passages do not answer the
# question. Fixed and short so it can be detected downstream, and so there is no
# room to soften a refusal into a guess.
NO_ANSWER = "Tôi chưa rõ câu hỏi của bạn, bạn có thể đặt ra câu hỏi chi tiết hơn được không ạ?"

SYSTEM_PROMPT = f"""\
Bạn là trợ lý của BKFintech — Viện Công nghệ và Kinh tế số, Đại học Bách khoa Hà Nội.

Chỉ dùng thông tin nằm trong khối <data> của tin nhắn người dùng. Không dùng kiến \
thức có sẵn của bạn, không tra cứu bên ngoài, không suy luận thêm ngoài những gì \
văn bản nói.

- Nếu <data> không chứa thông tin trả lời được câu hỏi, trả lời đúng một câu \
này và không gì khác: "{NO_ANSWER}"
  Không giải thích thêm, không đề xuất câu hỏi khác.
- Trả lời thẳng vào vấn đề. Tuyệt đối không viết câu dẫn kiểu "Dựa vào văn bản \
bạn cung cấp", "Theo thông tin được cung cấp".
- Tối đa {MAX_POINTS} gạch đầu dòng, mỗi ý một dòng. Câu hỏi đơn giản thì một ý \
là đủ — không kéo dài cho đủ số.
- Cuối mỗi ý ghi số nguồn đã dùng, dạng [1] hoặc [2][5].
- Không đoán ngày tháng, số liệu, tên người hay giá tiền không có trong <data>.
- Trả lời bằng đúng ngôn ngữ của câu hỏi. Nguồn có thể khác ngôn ngữ với câu hỏi \
— dịch phần cần dùng, không đổi ngôn ngữ trả lời và không xin lỗi về việc đó.
- Nếu các nguồn mâu thuẫn nhau, nêu cả hai và chỉ ra chỗ khác biệt thay vì tự \
chọn một bên.\
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
    return (
        f"Câu hỏi: {question}\n\n"
        "<data>\n"
        f"{format_sources(chunks)}\n"
        "</data>"
    )


def build_config() -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        max_output_tokens=MAX_OUTPUT_TOKENS,
        thinking_config=types.ThinkingConfig(thinking_level=THINKING_LEVEL),
    )


def build_request(question: str, chunks: list[dict]) -> dict:
    """What gets sent to the API, as a plain dict for preview_prompt.py.

    Kept separate from `build_config()` so the prompt can be inspected without
    constructing SDK objects or holding an API key.
    """
    return {
        "model": MODEL,
        "system": SYSTEM_PROMPT,
        "contents": build_user_message(question, chunks),
        "config": {
            "max_output_tokens": MAX_OUTPUT_TOKENS,
            "thinking_level": THINKING_LEVEL,
        },
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

    def stream(self, question: str, chunks: list[dict]):
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
            contents=build_user_message(question, chunks),
            config=build_config(),
        ):
            if part.text:
                yield part.text
            if time.monotonic() > deadline:
                raise AnswerTimeout(
                    f"Model không trả lời xong trong {TIMEOUT_MS / 1000:.0f} giây."
                )
