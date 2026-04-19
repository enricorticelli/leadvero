"use client";
import clsx from "clsx";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  badge?: ReactNode;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  variant?: "underline" | "pill";
  className?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = "underline",
  className,
}: TabsProps<T>) {
  if (variant === "pill") {
    return (
      <div
        role="tablist"
        className={clsx(
          "inline-flex gap-1 rounded-xl bg-surface-muted p-1",
          className,
        )}
      >
        {items.map((item) => {
          const active = item.id === value;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onChange(item.id)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "bg-surface text-ink-900 shadow-card"
                  : "text-ink-500 hover:text-ink-700",
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {item.label}
              {item.badge != null && (
                <span
                  className={clsx(
                    "ml-0.5 rounded-full px-1.5 text-[10px] font-bold",
                    active ? "bg-brand-100 text-brand-700" : "bg-ink-300/30 text-ink-500",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={clsx(
        "flex gap-1 overflow-x-auto border-b border-ink-300/40",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(item.id)}
            className={clsx(
              "inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-900",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.label}
            {item.badge != null && (
              <span
                className={clsx(
                  "rounded-full px-1.5 text-[10px] font-bold",
                  active ? "bg-brand-100 text-brand-700" : "bg-ink-300/30 text-ink-500",
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
