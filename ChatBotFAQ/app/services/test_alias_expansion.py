"""Quick check for expand_self_reference() and the translation it feeds into.

Run from project root:
    python -m app.services.test_alias_expansion
"""
from app.services.retriever import expand_self_reference
from app.services.translator import ENABLED as TRANSLATE_ENABLED, QueryTranslator

CASES = [
    "giới thiệu về viện",
    "giới thiệu về BK fintech",
    "trường có những khóa học nào",
    "Viện trưởng là ai",
    "khóa học AI blockchain cho người mới bắt đầu",
]

if __name__ == "__main__":
    translator = QueryTranslator() if TRANSLATE_ENABLED else None

    for question in CASES:
        expanded = expand_self_reference(question)
        print(f"\nQ:        {question}")
        print(f"expanded: {expanded!r}")

        if translator:
            english_plain = translator.to_english(question)
            english_from_expanded = translator.to_english(expanded or question)
            print(f"dịch (gốc):      {english_plain}")
            print(f"dịch (đã mở rộng): {english_from_expanded}")
            if "hospital" in english_plain.lower() and "hospital" not in english_from_expanded.lower():
                print("  -> alias đã sửa lỗi dịch 'viện' thành 'hospital'")
        else:
            print("(translator tắt — bỏ qua bước dịch)")
