import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome</h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-md">
          Get started by signing up or logging in.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/signup"
          className="px-6 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm no-underline hover:opacity-90 transition-all duration-150"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm no-underline hover:bg-[var(--bg-card)] transition-all duration-150"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
