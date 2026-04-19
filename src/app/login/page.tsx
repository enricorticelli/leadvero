"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        mustChangePassword?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Errore imprevisto");
        setLoading(false);
        return;
      }
      router.push(data.mustChangePassword ? "/profile?first=1" : "/");
      router.refresh();
    } catch {
      setError("Errore di rete");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-card">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-ink-900">Leadvero</p>
            <p className="text-sm text-ink-500">Accedi per continuare</p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl bg-surface p-6 shadow-card"
        >
          <Field label="Username">
            <Input
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </Field>
          {error && (
            <div className="rounded-lg bg-tile-pink-bg px-3 py-2 text-sm text-tile-pink-icon">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full justify-center"
          >
            {loading ? "Accesso…" : "Accedi"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          Primo accesso? Usa <span className="font-mono">admin</span> /{" "}
          <span className="font-mono">admin</span>
        </p>
      </div>
    </div>
  );
}
