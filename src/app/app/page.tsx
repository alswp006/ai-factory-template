export default function AppPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Protected Route Placeholder</h1>
        <p className="text-[var(--text-secondary)]">
          This page will be guarded by authentication in the future.
        </p>
      </div>
    </div>
  );
}
