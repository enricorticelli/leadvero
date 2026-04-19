"use client";
import clsx from "clsx";
import { Check } from "lucide-react";

interface StepperProps {
  steps: { title: string; subtitle?: string }[];
  current: number;
  onGoTo?: (index: number) => void;
}

export function Stepper({ steps, current, onGoTo }: StepperProps) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((step, i) => {
        const state: "done" | "current" | "upcoming" =
          i < current ? "done" : i === current ? "current" : "upcoming";
        const clickable = onGoTo && i < current;
        return (
          <li key={step.title} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={clickable ? () => onGoTo(i) : undefined}
              disabled={!clickable}
              className={clsx(
                "flex w-full min-w-0 items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors",
                clickable && "hover:bg-surface-muted cursor-pointer",
                !clickable && "cursor-default",
              )}
            >
              <span
                className={clsx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  state === "done" && "bg-brand-600 text-white",
                  state === "current" && "bg-brand-100 text-brand-700 ring-2 ring-brand-500",
                  state === "upcoming" && "bg-surface-sunken text-ink-400",
                )}
              >
                {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={clsx(
                    "truncate text-xs font-semibold",
                    state === "upcoming" ? "text-ink-400" : "text-ink-900",
                  )}
                >
                  {step.title}
                </p>
                {step.subtitle && (
                  <p className="hidden truncate text-[11px] text-ink-500 md:block">
                    {step.subtitle}
                  </p>
                )}
              </div>
            </button>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={clsx(
                  "hidden h-px flex-1 shrink sm:block",
                  i < current ? "bg-brand-500" : "bg-ink-300/40",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
