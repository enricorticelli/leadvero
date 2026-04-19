import clsx from "clsx";
import type { ReactNode } from "react";

type Tone =
  | "neutral"
  | "brand"
  | "green"
  | "yellow"
  | "pink"
  | "orange"
  | "blue"
  | "violet";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-ink-700",
  brand:   "bg-brand-50      text-brand-700",
  green:   "bg-tile-green-bg  text-tile-green-icon",
  yellow:  "bg-tile-yellow-bg text-tile-yellow-icon",
  pink:    "bg-tile-pink-bg   text-tile-pink-icon",
  orange:  "bg-tile-orange-bg text-tile-orange-icon",
  blue:    "bg-tile-blue-bg   text-tile-blue-icon",
  violet:  "bg-tile-violet-bg text-tile-violet-icon",
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
