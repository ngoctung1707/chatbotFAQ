"""Score the chatbot with DeepEval, under a hard cap on API requests.

Three metrics run. All three are *referenceless* — they need no hand-written
golden answer, only the question, the answer, and the passages retrieved:

    Answer Relevancy      does the answer address the question that was asked?
    Faithfulness          is every claim in the answer supported by the
                          retrieved passages, or did the model invent it?
    Contextual Relevancy  how much of what was retrieved was actually on topic?

The first two judge the generator, the third judges the retriever, which is
what separates "the answer is wrong" from "the right passage never arrived".
Contextual Precision and Recall are deliberately absent: both require
`expected_output` on every test case.

## Two budgets, because there are two spenders

DeepEval ships no judge of its own — every metric is scored by whatever model
is handed to it. So an evaluation run spends requests in two distinct places:

    answering   the chatbot generating the answer being judged   (1 per case)
    judging     DeepEval decomposing and scoring it              (~8 per case)

If both use the same API key they share one budget and `--budget` caps the lot.
Set JUDGE_API_KEY to a *different* key and the two are metered separately, so
the chatbot's quota is spent only on answering — which is usually the point of
capping it at all.

Either way the cap is enforced inside the model wrapper, on every call that
actually leaves the machine. When the next call would exceed it the run stops
at a case boundary and reports what was already measured. Metrics run
synchronously so the count stays exact.

Retrieval is free: local FAISS, no requests.

Usage:
    python scripts/evaluate_chatbot.py --dry-run          # no API calls at all
    python scripts/evaluate_chatbot.py                    # shared 50-request cap
    JUDGE_API_KEY=... python scripts/evaluate_chatbot.py  # chatbot key spends 50
"""
import argparse
import json
import os
import sys
import time
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from deepeval.metrics import (
    AnswerRelevancyMetric,
    ContextualRelevancyMetric,
    FaithfulnessMetric,
)
from deepeval.models import GeminiModel
from deepeval.test_case import LLMTestCase

from app.services.llm import FREE_TIER_RPM, MODEL, Answerer
from app.services.retriever import Retriever

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
QUESTIONS_PATH = DATA_DIR / "eval_questions.json"
RESULTS_PATH = DATA_DIR / "eval_results.json"

DEFAULT_BUDGET = 100
THRESHOLD = 0.7

# Checked against each budget before a question is attempted. Deliberately
# generous: stopping mid-question leaves a half-scored row, which is worse than
# one fewer row.
ANSWER_REQUESTS_PER_CASE = 1
JUDGE_REQUESTS_PER_CASE = 9


class BudgetExhausted(RuntimeError):
    pass


class RateLimiter:
    """Spaces requests out so the free tier's per-minute quota is never hit.

    The Gemini free tier caps *requests per minute* — 15 on gemini-3.5-flash-lite,
    5 on gemini-3.6-flash — not requests per run, and exceeding it returns 429
    rather than queuing. The quota is per project *per model*, so a judge on a
    different model has its own allowance; only when judge and chatbot share a
    model do they share this limiter.

    Pacing beats retrying: DeepEval retries a 429 internally, and those retries
    are real HTTP requests that the budget counter never sees — so a run that
    hits the limit spends more quota than it reports.
    """

    def __init__(self, per_minute: int):
        self.interval = 60.0 / per_minute if per_minute > 0 else 0.0
        self.last = 0.0

    def wait(self):
        if not self.interval:
            return
        gap = time.monotonic() - self.last
        if gap < self.interval:
            time.sleep(self.interval - gap)
        self.last = time.monotonic()


class Budget:
    """A request allowance with a name, so the error says which one ran out."""

    def __init__(self, name: str, limit: int | None):
        self.name = name
        self.limit = limit          # None means unmetered
        self.used = 0

    def spend(self, note: str = ""):
        if self.limit is not None and self.used >= self.limit:
            where = f" (blocked at: {note})" if note else ""
            raise BudgetExhausted(f"{self.name} budget of {self.limit} is spent{where}")
        self.used += 1

    def has_room_for(self, n: int) -> bool:
        return self.limit is None or self.limit - self.used >= n

    def __str__(self):
        return f"{self.used}/{self.limit}" if self.limit is not None else f"{self.used}/∞"


class BudgetedGemini(GeminiModel):
    """GeminiModel that refuses to spend past its budget.

    Subclassing rather than wrapping: DeepEval reaches into the model object
    from several places, and anything that is not a GeminiModel gets
    special-cased somewhere along the way.
    """

    def __init__(self, budget: Budget, limiter: RateLimiter, **kwargs):
        super().__init__(**kwargs)
        self.budget = budget
        self.limiter = limiter

    def generate(self, prompt, schema=None):
        self.budget.spend("metric")
        self.limiter.wait()
        return super().generate(prompt, schema)

    async def a_generate(self, prompt, schema=None):
        self.budget.spend("metric")
        self.limiter.wait()
        return await super().a_generate(prompt, schema)


def load_questions(limit: int = None) -> list[dict]:
    with open(QUESTIONS_PATH, encoding="utf-8") as f:
        questions = json.load(f)
    return questions[:limit] if limit else questions


def print_row(i: int, item: dict, scores: dict, answer_text: str):
    marks = "   ".join(
        f"{name} {value:.2f}{'' if value >= THRESHOLD else ' FAIL'}"
        for name, value in scores.items()
    )
    print(f"\n[{i}] {item['question']}   ({item['category']})")
    print(f"    {marks}")
    print(f"    -> {answer_text[:110].replace(chr(10), ' ')}…")


def summarise(results: list[dict]):
    for name in results[0]["scores"]:
        values = [r["scores"][name] for r in results]
        passed = sum(1 for v in values if v >= THRESHOLD)
        print(f"  {name:20s} mean {sum(values) / len(values):.3f}   "
              f"passed {passed}/{len(values)} at threshold {THRESHOLD}")

    by_category = {}
    for record in results:
        by_category.setdefault(record["category"], []).append(
            sum(record["scores"].values()) / len(record["scores"])
        )
    print("\n  by category:")
    for category, values in sorted(by_category.items()):
        print(f"    {category:16s} {sum(values) / len(values):.3f}  ({len(values)})")


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--budget", type=int, default=DEFAULT_BUDGET,
                        help=f"Cap on the chatbot key (default: {DEFAULT_BUDGET})")
    parser.add_argument("--judge-budget", type=int,
                        help="Cap on a separate judge key. Omit for no cap.")
    parser.add_argument("--limit", type=int, help="Only the first N questions")
    parser.add_argument("--top-k", type=int, default=10)
    parser.add_argument("--judge-model", default="gemini-3.6-flash")
    parser.add_argument("--rpm", type=int, default=FREE_TIER_RPM,
                        help=f"Requests per minute to stay under "
                             f"(free tier: {FREE_TIER_RPM} on the answering model)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show retrieval and the plan without calling the API")
    args = parser.parse_args()

    chatbot_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    judge_key = os.environ.get("JUDGE_API_KEY") or chatbot_key
    if not chatbot_key and not args.dry_run:
        raise SystemExit("Set GEMINI_API_KEY (or GOOGLE_API_KEY) first.")

    shared = judge_key == chatbot_key
    answer_budget = Budget("chatbot", args.budget)
    judge_budget = answer_budget if shared else Budget("judge", args.judge_budget)

    questions = load_questions(args.limit)
    retriever = Retriever()

    per_case = (ANSWER_REQUESTS_PER_CASE + JUDGE_REQUESTS_PER_CASE) if shared \
        else ANSWER_REQUESTS_PER_CASE
    affordable = args.budget // per_case

    print("=" * 78)
    print(f"Answering model : {MODEL}")
    print(f"Judging model   : {args.judge_model}")
    if shared:
        print(f"Budget          : {args.budget} requests, SHARED by answering and "
              f"judging  (~{affordable} questions)")
        print("                  set JUDGE_API_KEY to a second key to meter them apart")
    else:
        print(f"Chatbot budget  : {args.budget} requests, answering only "
              f"(~{affordable} questions)")
        print(f"Judge budget    : {args.judge_budget or 'uncapped'} (separate key)")
    print(f"Questions       : {len(questions)} available")
    print("=" * 78)

    if args.dry_run:
        for i, item in enumerate(questions, start=1):
            hits = retriever.search(item["question"], top_k=args.top_k)
            top = f"{hits[0]['score']:.4f} {hits[0]['chunk_id']}" if hits else "NOTHING RETRIEVED"
            print(f"[{i:2d}] {item['question'][:50]:52s} {len(hits):2d} chunks  {top}")
        print("\nDry run — no API requests were made.")
        return

    limiter = RateLimiter(args.rpm)
    judge = BudgetedGemini(budget=judge_budget, limiter=limiter,
                           model=args.judge_model, api_key=judge_key)
    answerer = Answerer()
    metrics = [
        AnswerRelevancyMetric(threshold=THRESHOLD, model=judge, async_mode=False),
        FaithfulnessMetric(threshold=THRESHOLD, model=judge, async_mode=False),
        ContextualRelevancyMetric(threshold=THRESHOLD, model=judge, async_mode=False),
    ]

    results, stopped = [], None
    for i, item in enumerate(questions, start=1):
        if not answer_budget.has_room_for(ANSWER_REQUESTS_PER_CASE) or \
                not judge_budget.has_room_for(JUDGE_REQUESTS_PER_CASE):
            stopped = (f"stopped before question {i}: chatbot {answer_budget}, "
                       f"judge {judge_budget} — not enough left for a whole question")
            break

        chunks = retriever.search(item["question"], top_k=args.top_k)
        try:
            answer_budget.spend("answer generation")
            limiter.wait()
            answer_text = "".join(answerer.stream(item["question"], chunks))

            test_case = LLMTestCase(
                input=item["question"],
                actual_output=answer_text,
                retrieval_context=[c["raw"] for c in chunks],
            )
            scores, reasons = {}, {}
            for metric in metrics:
                metric.measure(test_case)
                label = metric.__class__.__name__.replace("Metric", "")
                scores[label], reasons[label] = metric.score, metric.reason
        except BudgetExhausted as exc:
            stopped = str(exc)
            break
        except Exception as exc:
            # One bad question must not throw away every question already
            # scored — the requests spent on them are not refundable.
            print(f"\n[{i}] {item['question']}\n    SKIPPED: {type(exc).__name__}: "
                  f"{str(exc)[:160]}")
            continue

        print_row(i, item, scores, answer_text)
        results.append({
            "question": item["question"],
            "category": item["category"],
            "answer": answer_text,
            "retrieved": [
                {"chunk_id": c["chunk_id"], "score": round(c["score"], 4), "url": c["url"]}
                for c in chunks
            ],
            "scores": scores,
            "reasons": reasons,
        })

    print("\n" + "=" * 78)
    print(f"Scored {len(results)} of {len(questions)} questions")
    print(f"Requests — chatbot {answer_budget}" +
          ("" if shared else f", judge {judge_budget}"))
    if stopped:
        print(f"  {stopped}")

    if results:
        summarise(results)
        with open(RESULTS_PATH, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\nFull results with reasons: {RESULTS_PATH}")


if __name__ == "__main__":
    main()
