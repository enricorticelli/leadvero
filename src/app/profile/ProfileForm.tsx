"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";

interface Props {
  mustChange: boolean;
  isFirstLogin: boolean;
}

export function ProfileForm({ mustChange, isFirstLogin }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next !== confirm) {
      setError("Le password non corrispondono");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Errore imprevisto");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      setLoading(false);
      if (mustChange) {
        router.push("/");
        router.refresh();
      } else {
        setTimeout(() => setSuccess(false), 2500);
      }
    } catch {
      setError("Errore di rete");
      setLoading(false);
    }
  }

  return (
    <Card padding="md">
      <h3 className="text-base font-semibold text-ink-900">Cambia password</h3>
      {mustChange && (
        <div className="mt-3 rounded-lg bg-tile-yellow-bg px-3 py-2 text-sm text-tile-yellow-icon">
          {isFirstLogin
            ? "Benvenuto! Imposta una nuova password prima di continuare."
            : "Devi cambiare la password prima di continuare."}
        </div>
      )}
      <form onSubmit={submit} className="mt-4 space-y-4">
        <Field label="Password attuale">
          <Input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            disabled={loading}
          />
        </Field>
        <Field label="Nuova password" hint="Almeno 6 caratteri.">
          <Input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            disabled={loading}
          />
        </Field>
        <Field label="Conferma nuova password">
          <Input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
          />
        </Field>
        {error && (
          <div className="rounded-lg bg-tile-pink-bg px-3 py-2 text-sm text-tile-pink-icon">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-tile-green-bg px-3 py-2 text-sm text-tile-green-icon">
            Password aggiornata.
          </div>
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading || !current || !next || !confirm}
          >
            {loading ? "Aggiornamento…" : "Aggiorna password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
