"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { FormField } from "@/components/FormField";
import type { ToneStatus, TrainingViewModel } from "@/lib/training";
import { getTrainingViewModel, submitTraining } from "@/lib/training";

export default function TrainPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ToneStatus | null>(null);
  const [justTrained, setJustTrained] = useState(false);
  const [url, setUrl] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch tone status on mount
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/tone/status");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login?redirect=/train");
            return;
          }
          throw new Error("Failed to fetch status");
        }
        const data = await res.json();
        setStatus(data);
      } catch {
        setServerError("Failed to load training status");
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");
    setServerError("");

    if (!status) return;

    setIsSubmitting(true);

    const result = await submitTraining({
      status,
      url,
      trainApi: async (trainUrl: string) => {
        try {
          const res = await fetch("/api/tone/train-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: trainUrl }),
          });

          const data = await res.json();

          if (!res.ok) {
            // Map status codes to user-friendly messages
            if (res.status === 408) {
              return { ok: false, error: "Request timed out. Please try again or use a different URL." };
            }
            if (res.status === 422) {
              return { ok: false, error: data.error || "Unable to fetch content from this URL. Please check the URL or try pasting samples instead." };
            }
            if (res.status === 409) {
              return { ok: false, error: "You have already completed training." };
            }
            return { ok: false, error: data.error || "Training failed. Please try again." };
          }

          return { ok: true, trainedAt: data.trainedAt };
        } catch {
          return { ok: false, error: "Network error. Please check your connection and try again." };
        }
      },
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setFieldError(result.fieldErrors.url);
      setStatus(result.nextStatus);
      return;
    }

    setStatus(result.nextStatus);
    setJustTrained(result.justTrained);
  };

  if (loading) {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Train Your Tone</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Loading training status...
          </p>
        </div>
        <LoadingState />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Train Your Tone</h1>
        </div>
        <ErrorState message={serverError || "Failed to load training status"} />
      </div>
    );
  }

  const vm: TrainingViewModel = getTrainingViewModel({ status, justTrained });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Train Your Tone</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Provide a sample URL so we can learn your writing style
        </p>
      </div>

      {vm.bannerText && (
        <div className={`p-4 rounded-lg border ${vm.phase === "justTrained" ? "bg-[var(--success-soft)] border-green-500/20" : "bg-[var(--accent-soft)] border-[var(--border)]"}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{vm.phase === "justTrained" ? "✓" : "ℹ️"}</span>
            <p className="text-sm font-medium">{vm.bannerText}</p>
          </div>
        </div>
      )}

      {serverError && (
        <ErrorState
          message={serverError}
          onRetry={() => {
            setServerError("");
            handleSubmit(new Event("submit") as any);
          }}
        />
      )}

      {vm.showTrainingControls && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          <FormField label="Blog or Article URL" error={fieldError}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={vm.inputsDisabled || isSubmitting}
              placeholder="https://yourblog.com/article"
              className="w-full px-3 py-2 text-sm rounded-md bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-all duration-150 disabled:opacity-50"
            />
          </FormField>

          <button
            type="submit"
            disabled={vm.inputsDisabled || isSubmitting}
            className="w-full py-2 text-sm font-medium rounded-md bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition-all duration-150"
          >
            {isSubmitting ? "Training..." : "Train from URL"}
          </button>
        </form>
      )}

      {vm.showPasteSamplesCta && (
        <div className="text-center space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            Don&apos;t have a URL? Paste your writing samples instead.
          </p>
          <Link
            href={vm.pasteSamplesHref || "/train/samples"}
            className="inline-block px-4 py-2 text-sm font-medium rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-card)] transition-all duration-150"
          >
            Paste Writing Samples
          </Link>
        </div>
      )}

      {vm.showGenerateCta && (
        <div className="text-center">
          <Link
            href={vm.generateHref || "/generate"}
            className="inline-block px-6 py-3 text-sm font-medium rounded-md bg-[var(--accent)] text-white hover:opacity-90 transition-all duration-150"
          >
            Start Generating Content
          </Link>
        </div>
      )}
    </div>
  );
}
