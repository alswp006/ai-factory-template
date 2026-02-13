export function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-[var(--bg-card)] animate-pulse rounded-md" />
      <div className="h-4 bg-[var(--bg-card)] animate-pulse rounded-md w-3/4" />
      <div className="h-4 bg-[var(--bg-card)] animate-pulse rounded-md w-1/2" />
      <div className="h-32 bg-[var(--bg-card)] animate-pulse rounded-md" />
    </div>
  );
}
