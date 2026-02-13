"use client";

import type { Metadata } from "next";
import "./globals.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

// Note: metadata export removed due to use client directive
// Title: AI 블로그 작성 도우미
// Description: 사용자 말투를 학습해 맛집/테크/일상 등 다양한 주제의 블로그 글을 AI가 자동 생성하는 개인용 웹앱

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <nav className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-bold no-underline hover:no-underline text-[var(--text)]">
                블로그 도우미
              </Link>
              <div className="flex items-center gap-1">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Home
                  </Button>
                </Link>
                <Link href="/train">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Train
                  </Button>
                </Link>
                <Link href="/generate">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Generate
                  </Button>
                </Link>
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="text-xs">
                    History
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-xs text-[var(--text-muted)]">{user.email}</span>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[var(--danger)]"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="default" size="sm" className="text-xs">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
