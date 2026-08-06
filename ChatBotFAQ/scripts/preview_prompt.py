"""Show the retrieved chunks and the exact prompt for a question — no API call.

Runs retrieval for real and prints the request body that `Answerer.stream()`
would send, so the grounding can be reviewed before spending a token on it.

Usage:
    python scripts/preview_prompt.py "bkfintech là gì?"
    python scripts/preview_prompt.py "Ai là Viện trưởng?" --top-k 5 --full
"""
import argparse
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.llm import build_request
from app.services.retriever import Retriever


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("question")
    parser.add_argument("--top-k", type=int, default=10)
    parser.add_argument("--full", action="store_true",
                        help="Print each chunk in full instead of a preview")
    parser.add_argument("--json", action="store_true",
                        help="Print the raw request body as JSON")
    args = parser.parse_args()

    retriever = Retriever()
    chunks = retriever.search(args.question, top_k=args.top_k)
    request = build_request(args.question, chunks)

    if args.json:
        print(json.dumps(request, ensure_ascii=False, indent=2))
        return

    print("=" * 78)
    print(f"QUESTION : {args.question}")
    print(f"RETRIEVED: {len(chunks)} chunks (top_k={args.top_k})")
    print("=" * 78)
    for i, chunk in enumerate(chunks, start=1):
        print(f"\n[{i}] score={chunk['score']:.4f}  {chunk['collection']}  {chunk['chunk_id']}")
        print(f"    {chunk['url']}")
        text = chunk["raw"] if args.full else chunk["raw"][:200] + "…"
        print(f"    {text}")

    print("\n" + "=" * 78)
    print("REQUEST THAT WOULD BE SENT")
    print("=" * 78)
    print(f"model  : {request['model']}")
    print(f"config : {request['config']}")
    print("\n--- system_instruction ---")
    print(request["system"])
    print("\n--- contents ---")
    user = request["contents"]
    print(user if args.full else user[:1500] + "\n… (use --full for everything)")

    words = len(user.split()) + len(request["system"].split())
    print("\n" + "=" * 78)
    print(f"Prompt size: ~{words} words (~{int(words * 1.4)} tokens, rough estimate)")


if __name__ == "__main__":
    main()
