import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  output: 'standalone',
  // @xenova/transformers loads native/WASM ONNX runtime binaries at runtime
  // (used by src/lib/chatbot/embedding.ts) — Next's default
  // server bundling doesn't handle that well, so it's kept external instead
  // of bundled. Needed for both `next dev` and the `output: 'standalone'`
  // build to actually find those files at runtime.
  serverExternalPackages: ['@xenova/transformers'],
  // workers/embed-worker.mjs được nạp bằng ĐƯỜNG DẪN lúc chạy (new Worker(...)),
  // không phải bằng import — nên bước dò phụ thuộc của Next không nhìn thấy nó
  // và bản dựng `output: 'standalone'` sẽ thiếu file. Thiếu file thì worker
  // không sinh được, và không sinh được worker nghĩa là không có model: chatbot
  // chết sạch trong khi website vẫn xanh, tức là kiểu hỏng khó lần nhất.
  //
  // PHẦN THỨ HAI — @xenova/transformers VÀ onnxruntime — LÀ MỘT LỖI CÓ SẴN.
  //
  // Đo được: `.next/server/app/api/chat/route.js.nft.json` trace 309 file, và
  // KHÔNG file nào thuộc @xenova/transformers hay onnxruntime-node. Dockerfile
  // thì chỉ COPY `.next/standalone` sang image chạy. Nghĩa là image production
  // chưa bao giờ có thư viện model — preload thất bại và mọi câu hỏi hỏng,
  // trong khi website vẫn xanh.
  //
  // Nguyên nhân: `serverExternalPackages` bảo Next "đừng bundle, cứ require
  // lúc chạy", nhưng bước dò phụ thuộc lại không kéo theo gói đó. Khai tường
  // minh ở đây là cách chắc chắn.
  //
  // CỐ Ý bỏ `dist/` của transformers (44MB, là bản dựng cho TRÌNH DUYỆT —
  // package.json trỏ main vào `src/transformers.js`) và bỏ `.cache/` (560MB
  // model đã tải; trong image thì nó tải lúc chạy, và đó là thứ nên nằm ở
  // volume chứ không nằm trong image).
  outputFileTracingIncludes: {
    '/api/**': [
      './workers/embed-worker.mjs',
      './node_modules/@xenova/transformers/package.json',
      './node_modules/@xenova/transformers/src/**',
      './node_modules/onnxruntime-node/**',
      './node_modules/onnxruntime-common/**',
      './node_modules/@huggingface/jinja/**',
      './node_modules/sharp/**',
      './node_modules/@img/**',
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: CONTENT_SECURITY_POLICY,
          },
        ],
      },
    ]
  },
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(withPayload(nextConfig))
