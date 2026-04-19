"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Settings, Key, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "1";

  const [serpApiKey, setSerpApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [desktopMode, setDesktopMode] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: { serpApiKey?: string; desktopMode?: boolean }) => {
        setSerpApiKey(data.serpApiKey ?? "");
        setDesktopMode(data.desktopMode ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serpApiKey }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Errore imprevisto");
        setSaving(false);
        return;
      }
      setSuccess(true);
      setSaving(false);
      if (isSetup) {
        setTimeout(() => router.push("/"), 1000);
      } else {
        setTimeout(() => setSuccess(false), 2500);
      }
    } catch {
      setError("Errore di rete");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <p className="text-sm text-ink-500">Impostazioni</p>
        <h2 className="text-2xl font-bold text-ink-900">Configurazione app</h2>
      </div>

      {isSetup && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          <strong>Benvenuto in Leadvero!</strong> Per iniziare inserisci la tua chiave SerpAPI.
          Puoi ottenerla gratuitamente su{" "}
          <a
            href="https://serpapi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
          >
            serpapi.com <ExternalLink className="h-3 w-3" />
          </a>
          .
        </div>
      )}

      <Card padding="md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Key className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-ink-900">API Keys</h3>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-ink-400">Caricamento…</p>
        ) : (
          <form onSubmit={save} className="mt-4 space-y-4">
            <Field
              label="SerpAPI Key"
              hint="Necessaria per le ricerche. Gratuita fino a 100 ricerche/mese."
            >
              <Input
                type="password"
                autoComplete="off"
                value={serpApiKey}
                onChange={(e) => setSerpApiKey(e.target.value)}
                disabled={saving}
                placeholder="sk-…"
              />
            </Field>

            {!desktopMode && (
              <div className="rounded-lg bg-tile-yellow-bg px-3 py-2 text-sm text-tile-yellow-icon">
                Imposta <code className="font-mono">SERPAPI_KEY</code> nel file{" "}
                <code className="font-mono">.env</code> — questa pagina funziona solo
                nella versione desktop.
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-tile-pink-bg px-3 py-2 text-sm text-tile-pink-icon">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-tile-green-bg px-3 py-2 text-sm text-tile-green-icon">
                {isSetup ? "Configurazione salvata! Reindirizzamento…" : "Salvato."}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving || !desktopMode}
                iconLeft={<Settings className="h-4 w-4" />}
              >
                {saving ? "Salvataggio…" : "Salva impostazioni"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
