"use client";
import clsx from "clsx";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export type ConfirmTone = "default" | "danger";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const TONE_ICON: Record<ConfirmTone, {
  Icon: typeof AlertTriangle;
  bg: string;
  text: string;
}> = {
  default: { Icon: HelpCircle,    bg: "bg-brand-50",      text: "text-brand-600"     },
  danger:  { Icon: AlertTriangle, bg: "bg-tile-pink-bg",  text: "text-tile-pink-icon" },
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const { Icon, bg, text } = TONE_ICON[tone];

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      size="sm"
      hideClose
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy ? "Attendi…" : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            bg,
          )}
        >
          <Icon className={clsx("h-5 w-5", text)} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          {message && (
            <div className="mt-1 whitespace-pre-line text-sm text-ink-500">
              {message}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
