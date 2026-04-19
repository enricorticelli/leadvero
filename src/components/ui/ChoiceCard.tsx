"use client";
import clsx from "clsx";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ChoiceCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function ChoiceCard({
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
  disabled,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={clsx(
        "group relative flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
        selected
          ? "border-brand-500 bg-brand-50 shadow-card"
          : "border-ink-300/40 bg-surface hover:border-brand-300 hover:bg-surface-muted",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {Icon && (
        <div
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            selected
              ? "bg-brand-600 text-white"
              : "bg-surface-muted text-ink-500 group-hover:bg-brand-100 group-hover:text-brand-600",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink-900">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-ink-500">{description}</p>
        )}
      </div>
      {selected && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
