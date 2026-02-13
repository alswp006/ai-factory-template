"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useClientSession, logout } from "@/lib/auth";

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useClientSession();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-bold no-underline hover:no-underline text-[var(--text)]">
            🏠 App
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-[var(--text-secondary)] no-underline hover:text-[var(--text)] transition-all duration-150">
              Home
            </Link>
            <Link href="/train" className="text-xs text-[var(--text-secondary)] no-underline hover:text-[var(--text)] transition-all duration-150">
              Train
            </Link>
            <Link href="/generate" className="text-xs text-[var(--text-secondary)] no-underline hover:text-[var(--text)] transition-all duration-150">
              Generate
            </Link>
            <Link href="/history" className="text-xs text-[var(--text-secondary)] no-underline hover:text-[var(--text)] transition-all duration-150">
              History
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {session.status === "authenticated" && session.data ? (
            <>
              <span className="text-xs text-[var(--text-muted)]">Logged in</span>
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-all duration-150 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-[var(--text-muted)]">Logged out</span>
              <Link
                href="/login"
                className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] no-underline hover:bg-[var(--bg-card)] transition-all duration-150"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-xs px-3 py-1.5 rounded-md bg-[var(--accent)] text-white no-underline hover:opacity-90 transition-all duration-150"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Nav;
