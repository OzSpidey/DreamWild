"use client";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  loading = false,
  size = "md",
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-sans font-medium transition-all rounded-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-gold-500 text-ink-900 hover:bg-gold-400 shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]":
            variant === "primary",
          "border border-gold-600 text-gold-400 hover:bg-gold-600/10":
            variant === "secondary",
          "text-parchment-300 hover:text-parchment-100":
            variant === "ghost",
          "bg-red-900/60 text-red-300 hover:bg-red-800/60 border border-red-800":
            variant === "danger",
        },
        { "px-3 py-1.5 text-sm": size === "sm", "px-5 py-2.5 text-sm": size === "md", "px-7 py-3.5 text-base": size === "lg" },
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
