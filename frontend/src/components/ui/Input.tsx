"use client";
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-sans uppercase tracking-widest text-parchment-400">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          "bg-ink-800 border border-ink-600 rounded-sm px-3 py-2.5",
          "text-parchment-100 placeholder:text-ink-600",
          "focus:outline-none focus:border-gold-600 focus:ring-1 focus:ring-gold-600/40",
          "transition-colors font-sans text-sm",
          error && "border-red-700",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-sans uppercase tracking-widest text-parchment-400">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={clsx(
          "bg-ink-800 border border-ink-600 rounded-sm px-3 py-2.5 resize-none",
          "text-parchment-100 placeholder:text-ink-600",
          "focus:outline-none focus:border-gold-600 focus:ring-1 focus:ring-gold-600/40",
          "transition-colors font-sans text-sm",
          error && "border-red-700",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
