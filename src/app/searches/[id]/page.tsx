"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
    return () => { active = false; };
  }, [id, router]);

  if (!job) {
    return <p className="text-neutral-500 text-sm">Caricamento…</p>;
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Ricerca in corso</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {job.niche && `${job.niche}`}
          {job.city && ` — ${job.city}`}
          {` (${job.targetPlatform})`}
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Stato:</span>{" "}
          <span
            className={
              job.status === "done"
                ? "text-green-600"
                : job.status === "failed"
                  ? "text-red-600"
                  : "text-blue-600"
            }
          >
            {STATUS_LABELS[job.status] ?? job.status}
          </span>
        </p>
        <p>
          <span className="font-medium">Scoperti:</span> {job.discoveredCount} /{" "}
          {job.maxResults}
        </p>
        <p>
          <span className="font-medium">Scansionati:</span> {job.scannedCount}
        </p>
        <p>
          <span className="font-medium">Scorati:</span> {job.scoredCount}
        </p>
      </div>

      {job.status === "running" || job.status === "pending" ? (
        <div className="h-2 w-full rounded bg-neutral-100">
          <div
            className="h-2 rounded bg-blue-500 transition-all"
            style={{
              width: `${job.maxResults > 0 ? Math.round((job.scannedCount / job.maxResults) * 100) : 0}%`,
            }}
          />
        </div>
      ) : null}

      {job.status === "failed" && job.errorMessage && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {job.errorMessage}
        </p>
      )}

      {job.status === "done" && (
        <p className="text-sm text-green-600">
          Ricerca completata — reindirizzamento ai lead…
        </p>
      )}
    </div>
  );
}
