"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

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

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-yellow-50  text-yellow-700 border-yellow-200",
  running:  "bg-blue-50    text-blue-700   border-blue-200",
  done:     "bg-green-50   text-green-700  border-green-200",
  failed:   "bg-red-50     text-red-600    border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "In attesa",
  running: "In esecuzione",
  done:    "Completata",
  failed:  "Errore",
};

function hasActive(jobs: Job[]) {
  return jobs.some((j) => j.status === "pending" || j.status === "running");
}

export default function SearchesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/searches");
    if (res.ok) setJobs((await res.json()) as Job[]);
  }, []);

  // poll ogni 2s se ci sono job attivi
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
        <h1 className="text-xl font-semibold">Ricerche</h1>
        <Link
          href="/"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nuova ricerca
        </Link>
      </div>

      {jobs.length === 0 && (
        <p className="text-sm text-neutral-400">
          Nessuna ricerca ancora.{" "}
          <Link href="/" className="text-blue-600 hover:underline">
            Lancia la prima.
          </Link>
        </p>
      )}

      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center gap-4 rounded border px-4 py-3"
          >
            {/* status badge */}
            <span
              className={`shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[job.status]}`}
            >
              {STATUS_LABEL[job.status]}
            </span>

            {/* description */}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">
                {[job.niche, job.city, job.country]
                  .filter(Boolean)
                  .join(" · ") || "Ricerca generica"}{" "}
                <span className="font-normal text-neutral-400">
                  ({job.targetPlatform})
                </span>
              </p>
              <p className="text-xs text-neutral-400">
                {formatDistanceToNow(new Date(job.createdAt), {
                  addSuffix: true,
                  locale: it,
                })}
                {job.status === "running" && (
                  <span className="ml-2 text-blue-600">
                    · {job.scannedCount}/{job.discoveredCount} siti
                  </span>
                )}
                {job.status === "done" && (
                  <span className="ml-2 text-green-700">
                    · {job.scoredCount} lead scorati
                  </span>
                )}
              </p>
            </div>

            {/* progress bar (solo per running) */}
            {job.status === "running" && job.discoveredCount > 0 && (
              <div className="hidden w-24 sm:block">
                <div className="h-1.5 w-full rounded bg-neutral-100">
                  <div
                    className="h-1.5 rounded bg-blue-500 transition-all"
                    style={{
                      width: `${Math.round((job.scannedCount / job.discoveredCount) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* actions */}
            <div className="flex shrink-0 gap-3 text-xs">
              {(job.status === "pending" || job.status === "running") && (
                <Link
                  href={`/searches/${job.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Progresso
                </Link>
              )}
              {job.status === "done" && job.scoredCount > 0 && (
                <Link
                  href="/leads"
                  className="text-green-700 hover:underline font-medium"
                >
                  Vedi lead →
                </Link>
              )}
              {job.status === "failed" && (
                <Link
                  href={`/searches/${job.id}`}
                  className="text-red-500 hover:underline"
                >
                  Dettaglio errore
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
