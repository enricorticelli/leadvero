"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Job {
  id: string;
  niche: string | null;
  city: string | null;
  targetPlatform: string;
  status: string;
  errorMessage: string | null;
  discoveredCount: number;
  scannedCount: number;
  scoredCount: number;
  maxResults: number;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "In attesa…",
  running: "In esecuzione…",
  done: "Completata",
  failed: "Errore",
};

const STATUS_TONE: Record<string, "yellow" | "brand" | "green" | "pink"> = {
  pending: "yellow",
  running: "brand",
  done:    "green",
  failed:  "pink",
};

export default function SearchStatusPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    let active = true;
    async function poll() {
      while (active) {
        const res = await fetch(`/api/searches/${id}`);
        if (res.ok) {
          const data = (await res.json()) as Job;
          if (active) setJob(data);
          if (data.status === "done") {
            setTimeout(() => router.push("/leads"), 1500);
            return;
          }
          if (data.status === "failed") return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    poll();
    return () => {
      active = false;
    };
  }, [id, router]);

  if (!job) {
    return (
      <Card className="mx-auto max-w-md py-10 text-center text-sm text-ink-500">
        Caricamento…
      </Card>
    );
  }

  const progress =
    job.maxResults > 0
      ? Math.min(100, Math.round((job.scannedCount / job.maxResults) * 100))
      : 0;

  const isRunning = job.status === "running" || job.status === "pending";
  const Icon =
    job.status === "done" ? CheckCircle2 :
    job.status === "failed" ? AlertCircle : Loader2;
  const iconColor =
    job.status === "done" ? "text-tile-green-icon" :
    job.status === "failed" ? "text-tile-pink-icon" : "text-brand-600";

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Card>
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              job.status === "done"   ? "bg-tile-green-bg"  :
              job.status === "failed" ? "bg-tile-pink-bg"   :
              "bg-brand-50"
            }`}
          >
            <Icon
              className={`h-6 w-6 ${iconColor} ${isRunning ? "animate-spin" : ""}`}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-ink-900">
                Ricerca {STATUS_LABELS[job.status] ?? job.status}
              </h2>
              <Badge tone={STATUS_TONE[job.status] ?? "neutral"}>
                {STATUS_LABELS[job.status] ?? job.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {job.niche}
              {job.city && ` · ${job.city}`}
              {` · ${job.targetPlatform}`}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-surface-muted p-3">
            <p className="text-xl font-bold text-ink-900">
              {job.discoveredCount}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
              Scoperti
            </p>
          </div>
          <div className="rounded-xl bg-surface-muted p-3">
            <p className="text-xl font-bold text-ink-900">
              {job.scannedCount}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
              Scansionati
            </p>
          </div>
          <div className="rounded-xl bg-surface-muted p-3">
            <p className="text-xl font-bold text-ink-900">
              {job.scoredCount}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
              Scorati
            </p>
          </div>
        </div>

        {isRunning && (
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-ink-500">
              <span>Avanzamento</span>
              <span className="font-semibold text-ink-700">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {job.status === "failed" && job.errorMessage && (
          <p className="mt-5 rounded-xl bg-tile-pink-bg px-4 py-3 text-sm text-tile-pink-icon">
            {job.errorMessage}
          </p>
        )}

        {job.status === "done" && (
          <p className="mt-5 rounded-xl bg-tile-green-bg px-4 py-3 text-sm text-tile-green-icon">
            Ricerca completata — reindirizzamento ai lead…
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button href="/searches" variant="ghost">
            Torna alle ricerche
          </Button>
        </div>
      </Card>
    </div>
  );
}
