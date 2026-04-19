"use client";
import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: Size;
  closeOnBackdropClick?: boolean;
  hideClose?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdropClick = true,
  hideClose = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-[fadeIn_120ms_ease-out]"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />
      <div
        className={clsx(
          "relative z-10 w-full rounded-2xl bg-surface shadow-card-hover ring-1 ring-ink-300/40",
          SIZE[size],
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-3 px-6 pb-0 pt-6">
            <div className="min-w-0">
              {title && (
                <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-ink-500">{description}</p>
              )}
            </div>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Chiudi"
                className="-mr-2 -mt-2 rounded-lg p-1.5 text-ink-400 hover:bg-surface-muted hover:text-ink-900"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        {children && <div className="px-6 py-5 text-sm text-ink-700">{children}</div>}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-ink-300/30 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
