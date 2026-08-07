import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BKFintech Chatbot",
  description: "FAQ chatbot for BKFintech (Next.js + Vercel AI SDK)",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
