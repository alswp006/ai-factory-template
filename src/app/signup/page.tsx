import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default async function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Get started for free</p>
        </div>

        <SignupForm />

        <p className="text-center text-xs text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent)]">Login</Link>
        </p>
      </div>
    </div>
  );
}
