import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/ui/nav";

export const metadata: Metadata = {
  title: "AI 블로그 작성 도우미",
  description: "사용자 말투를 학습해 맛집/테크/일상 등 다양한 주제의 블로그 글을 AI가 자동 생성하는 개인용 웹앱",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
