"use client";
import clsx from "clsx";
import type { ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

export function Tooltip({
  content,
  children,
  className,
  side = "top",
}: TooltipProps) {
  return (
    <div className={clsx("group/tt relative", className)}>
      {children}
      <div
        role="tooltip"
        className={clsx(
          "pointer-events-none absolute left-1/2 z-20 w-56 -translate-x-1/2 rounded-lg bg-ink-900 px-3 py-2 text-xs font-medium leading-snug text-white opacity-0 shadow-card-hover transition-opacity duration-150 group-hover/tt:opacity-100",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        {content}
      </div>
    </div>
  );
}
