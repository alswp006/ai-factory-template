import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  heading: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function EmptyState({
  icon = "📭",
  heading,
  description,
  ctaText = "Get Started",
  ctaHref = "/"
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
      <span className="text-5xl opacity-50">{icon}</span>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--text)]">{heading}</h3>
        {description && (
          <p className="text-sm text-[var(--text-secondary)] max-w-md">{description}</p>
        )}
      </div>
      <Link
        href={ctaHref}
        className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--accent)] text-white no-underline hover:opacity-90 transition-all duration-150"
      >
        {ctaText}
      </Link>
    </div>
  );
}
