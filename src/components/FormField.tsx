import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--text)]">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[var(--text-muted)] bg-[var(--danger-soft)] px-3 py-2 rounded-md border border-[var(--border)]">
          {error}
        </p>
      )}
    </div>
  );
}
