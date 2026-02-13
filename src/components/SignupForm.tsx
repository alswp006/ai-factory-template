"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateEmail, validatePassword } from "@/lib/validation";

export default function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) {
      const err = validateEmail(value);
      setEmailError(err ?? "");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      const err = validatePassword(value);
      setPasswordError(err ?? "");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate before submit
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (emailErr || passwordErr) {
      setEmailError(emailErr ?? "");
      setPasswordError(passwordErr ?? "");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Signup failed");
        return;
      }

      // Redirect to /train for new users
      router.push("/train");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      {error && (
        <div className="text-xs px-3 py-2 rounded-md bg-[var(--danger-soft)] text-[var(--danger)]">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-all duration-150"
          placeholder="Your name"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className={`w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border text-[var(--text)] focus:outline-none transition-all duration-150 ${
            emailError ? "border-[var(--danger)]" : "border-[var(--border)] focus:border-[var(--accent)]"
          }`}
          placeholder="you@example.com"
        />
        {emailError && (
          <p className="text-xs text-[var(--danger)] mt-1">{emailError}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          className={`w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border text-[var(--text)] focus:outline-none transition-all duration-150 ${
            passwordError ? "border-[var(--danger)]" : "border-[var(--border)] focus:border-[var(--accent)]"
          }`}
          placeholder="At least 8 characters"
        />
        {passwordError && (
          <p className="text-xs text-[var(--danger)] mt-1">{passwordError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !!emailError || !!passwordError}
        className="w-full py-2 text-sm font-medium rounded-md bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition-all duration-150 cursor-pointer"
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}
