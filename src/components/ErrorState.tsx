interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong", onRetry }: ErrorStateProps) {
  return (
    <div className="p-6 rounded-lg bg-[var(--danger-soft)] border border-red-500/20">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-xl">⚠️</span>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-red-600">Error</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{message}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-all duration-150"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
