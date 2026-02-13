import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Welcome back</p>
        </div>

        <LoginForm />

        <p className="text-center text-xs text-[var(--text-muted)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[var(--accent)]">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
