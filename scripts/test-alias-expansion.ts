/**
 * Kiểm tra nhanh expandSelfReference() và bước dịch nó feed vào.
 *
 * Port của app/services/test_alias_expansion.py bên bản Python
 * (`python -m app.services.test_alias_expansion`).
 *
 * Vì sao script này tồn tại: "viện" và "trường" trong câu hỏi của người dùng
 * gần như luôn ám chỉ chính BK Fintech, nhưng chúng là danh từ chung — cả
 * embedding lẫn model dịch đều không suy ra được điều đó. opus-mt-vi-en dịch
 * "viện" thành "hospital", nên câu hỏi về viện đi tìm tài liệu về bệnh viện.
 * expandSelfReference() gắn thêm tên đầy đủ của viện vào câu hỏi trước khi
 * dịch, cho model đủ ngữ cảnh để không đoán sai. Script in ra cả hai bản dịch
 * cạnh nhau để thấy alias có thực sự cứu được câu dịch hay không.
 *
 * Import thẳng từ src/lib/chatbot/ chứ không chép lại logic — mục đích là
 * kiểm tra đúng code đang chạy production, một bản sao riêng sẽ trôi khỏi
 * bản gốc mà không ai biết.
 *
 * Chạy: pnpm test:alias
 * (bước dịch tải model transformers.js lần đầu — xem translator.ts)
 */
import { expandSelfReference } from "../src/lib/chatbot/retriever";
import { toEnglish } from "../src/lib/chatbot/translator";
import { TRANSLATE_ENABLED } from "../src/lib/chatbot/config";

// Giữ nguyên 5 câu của bản Python. Hai câu đầu là cặp đối chứng (có alias /
// đã nêu đích danh), hai câu giữa phủ "trường" và "viện trưởng", câu cuối
// không chứa alias nào nên phải trả về null.
const QUESTIONS = [
  "giới thiệu về viện",
  "giới thiệu về BK fintech",
  "trường có những khóa học nào",
  "Viện trưởng là ai",
  "khóa học AI blockchain cho người mới bắt đầu",
];

function hasHospital(text: string): boolean {
  return text.toLowerCase().includes("hospital");
}

async function main() {
  for (const question of QUESTIONS) {
    const expanded = expandSelfReference(question);

    console.log(`Q:        ${question}`);
    console.log(`expanded: ${expanded ?? "null"}`);

    if (!TRANSLATE_ENABLED) {
      console.log("(translator tắt — bỏ qua bước dịch)");
      console.log();
      continue;
    }

    const originalEn = await toEnglish(question);
    const expandedEn = await toEnglish(expanded ?? question);

    console.log(`dịch (gốc):        ${originalEn}`);
    console.log(`dịch (đã mở rộng): ${expandedEn}`);

    if (hasHospital(originalEn) && !hasHospital(expandedEn)) {
      console.log(
        '  -> alias đã sửa lỗi dịch "viện" → "hospital" trong câu hỏi này'
      );
    }

    console.log();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
