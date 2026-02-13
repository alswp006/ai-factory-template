import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      default: "bg-[var(--accent)] text-white hover:opacity-90",
      secondary: "bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-card)]",
      ghost: "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]",
      destructive: "bg-[var(--danger-soft)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white border border-[var(--danger)]",
    };

    const sizes = {
      sm: "text-xs px-2 py-1",
      default: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return <button ref={ref} className={classes} {...props} />;
  }
);

Button.displayName = "Button";

export { Button };
