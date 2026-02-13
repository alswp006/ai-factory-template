import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/ui/nav";

export const metadata: Metadata = {
  title: "App",
  description: "Built with AI Factory",
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
