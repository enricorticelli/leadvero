import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  padding?: "sm" | "md" | "lg";
}

const PADDING = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  title,
  subtitle,
  actions,
  padding = "md",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-surface shadow-card ring-1 ring-ink-300/20",
        PADDING[padding],
        className,
      )}
      {...rest}
    >
      {(title || subtitle || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-ink-900">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
