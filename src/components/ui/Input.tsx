import clsx from "clsx";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

const FIELD_BASE =
  "w-full rounded-xl bg-surface px-3.5 py-2.5 text-sm text-ink-900 ring-1 ring-ink-300/70 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-surface-muted";

interface FieldWrapProps {
  label?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, children, className }: FieldWrapProps) {
  return (
    <label className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="text-xs font-medium text-ink-700">{label}</span>
      )}
      {children}
      {hint && <span className="text-[11px] text-ink-400">{hint}</span>}
    </label>
  );
}

export function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(FIELD_BASE, className)} {...rest} />;
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(FIELD_BASE, "pr-8", className)} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={clsx(FIELD_BASE, "resize-y", className)} {...rest} />
  );
}
