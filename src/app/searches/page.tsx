"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { Clock, Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useConfirm } from "@/components/ui/ConfirmProvider";

interface Job {
  id: string;
  niche: string | null;
  city: string | null;
  country: string;
  targetPlatform: string;
  status: "pending" | "running" | "done" | "failed";
  discoveredCount: number;
  scannedCount: number;
  scoredCount: number;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

const STATUS_TONE: Record<Job["status"], "yellow" | "brand" | "green" | "pink"> = {
  pending: "yellow",
  running: "brand",
  done:    "green",
  failed:  "pink",
};

const STATUS_LABEL: Record<Job["status"], string> = {
  pending: "In attesa",
  running: "In esecuzione",
  done:    "Completata",
  failed:  "Errore",
};

const STATUS_ICON_BG: Record<
  Job["status"],
  { bg: string; icon: string }
> = {
  pending: { bg: "bg-tile-yellow-bg", icon: "text-tile-yellow-icon" },
  running: { bg: "bg-brand-50",       icon: "text-brand-600" },
  done:    { bg: "bg-tile-green-bg",  icon: "text-tile-green-icon" },
  failed:  { bg: "bg-tile-pink-bg",   icon: "text-tile-pink-icon" },
};

function hasActive(jobs: Job[]) {
  return jobs.some((j) => j.status === "pending" || j.status === "running");
}

function StatusIcon({ status }: { status: Job["status"] }) {
  const { bg, icon } = STATUS_ICON_BG[status];
  const Icon =
    status === "pending" ? Clock :
    status === "running" ? Loader2 :
    status === "done"    ? CheckCircle2 :
    AlertCircle;
  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
      <Icon
        className={`h-5 w-5 ${icon} ${status === "running" ? "animate-spin" : ""}`}
      />
    </div>
  );
}

export default function SearchesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const confirm = useConfirm();

  const load = useCallback(async () => {
    const res = await fetch("/api/searches");
    if (res.ok) setJobs((await res.json()) as Job[]);
  }, []);

  async function handleDelete(job: Job) {
    const label =
      [job.niche, job.city].filter(Boolean).join(" · ") || "questa ricerca";
    const running = job.status === "pending" || job.status === "running";
    const ok = await confirm({
      title: `Eliminare "${label}"?`,
      message: running
        ? "Verranno rimossi anche tutti i lead associati.\nATTENZIONE: la ricerca è ancora in esecuzione."
        : "Verranno rimossi anche tutti i lead associati.",
      confirmLabel: "Elimina",
      tone: "danger",
    });
    if (!ok) return;
    const res = await fetch(`/api/searches/${job.id}`, { method: "DELETE" });
    if (res.ok) {
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
    }
  }

  useEffect(() => {
    load();
    const iv = setInterval(() => {
      if (hasActive(jobs)) load();
    }, 2000);
    return () => clearInterval(iv);
  }, [load, jobs]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-500">Ricerche</p>
          <h2 className="text-2xl font-bold text-ink-900">
            {jobs.length > 0 ? `${jobs.length} job di discovery` : "Nessun job ancora"}
          </h2>
        </div>
        <Button href="/searches/new" iconLeft={<Plus className="h-4 w-4" />}>
          Nuova ricerca
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-ink-500">
            Ancora nessuna ricerca.{" "}
            <Link
              href="/searches/new"
              className="font-medium text-brand-600 hover:underline"
            >
              Lancia la prima →
            </Link>
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {jobs.map((job) => (
            <Card key={job.id} padding="md" className="flex items-center gap-4">
              <StatusIcon status={job.status} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {[job.niche, job.city, job.country]
                      .filter(Boolean)
                      .join(" · ") || "Ricerca generica"}
                  </p>
                  <Badge tone="neutral" className="capitalize">
                    {job.targetPlatform}
                  </Badge>
                </div>
                <p className="text-xs text-ink-400">
                  {formatDistanceToNow(new Date(job.createdAt), {
                    addSuffix: true,
                    locale: it,
                  })}
                  {job.status === "running" && (
                    <span className="ml-2 text-brand-600">
                      · {job.scannedCount}/{job.discoveredCount} siti
                    </span>
                  )}
                  {job.status === "done" && (
                    <span className="ml-2 text-tile-green-icon">
                      · {job.scoredCount} lead scorati
                    </span>
                  )}
                </p>

                {job.status === "running" && job.discoveredCount > 0 && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{
                        width: `${Math.round(
                          (job.scannedCount / job.discoveredCount) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={STATUS_TONE[job.status]}>
                  {STATUS_LABEL[job.status]}
                </Badge>
                {(job.status === "pending" || job.status === "running") && (
                  <Link
                    href={`/searches/${job.id}`}
                    className="text-xs font-medium text-brand-600 hover:underline"
                  >
                    Progresso →
                  </Link>
                )}
                {job.status === "done" && job.scoredCount > 0 && (
                  <Link
                    href="/leads"
                    className="text-xs font-semibold text-tile-green-icon hover:underline"
                  >
                    Vedi lead →
                  </Link>
                )}
                {job.status === "failed" && (
                  <Link
                    href={`/searches/${job.id}`}
                    className="text-xs font-medium text-tile-pink-icon hover:underline"
                  >
                    Dettaglio →
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(job)}
                  aria-label="Elimina ricerca"
                  className="rounded-lg p-1.5 text-ink-400 hover:bg-tile-pink-bg hover:text-tile-pink-icon"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
