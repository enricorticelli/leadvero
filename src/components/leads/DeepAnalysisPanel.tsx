"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronDown, Loader2, Play, RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import {
  ANALYSIS_PRESET_LABELS,
  type AnalysisIssue,
  type AnalysisPreset,
  type AnalysisSummary,
} from "@/lib/deep-analysis";

interface AnalysisRun {
  id: string;
  preset: AnalysisPreset;
  status: "pending" | "running" | "done" | "failed";
  maxPages: number;
  runTimeoutMs: number;
  includeBlogAndProductPaths: boolean;
  discoveredCount: number;
  scannedCount: number;
  summary: unknown;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

interface AnalysisPage {
  id: string;
  scannedUrl: string;
  pageType: string;
  httpStatus: number | null;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  canonical: string | null;
  robotsMeta: string | null;
  schemaPresent: boolean;
  indexable: boolean;
  titleQuality: string | null;
  issues: unknown;
  scannedAt: string;
}

interface AnalysisRunDetail extends AnalysisRun {
  pages: AnalysisPage[];
}

const STATUS_TONE: Record<AnalysisRun["status"], "yellow" | "brand" | "green" | "pink"> = {
  pending: "yellow",
  running: "brand",
  done: "green",
  failed: "pink",
};

const STATUS_LABEL: Record<AnalysisRun["status"], string> = {
  pending: "In coda",
  running: "In corso",
  done: "Completata",
  failed: "Errore",
};

const PRESET_OPTIONS: AnalysisPreset[] = ["light", "standard", "deep"];

export function DeepAnalysisPanel({ leadId }: { leadId: string }) {
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<AnalysisRunDetail | null>(null);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [preset, setPreset] = useState<AnalysisPreset>("standard");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxPages, setMaxPages] = useState("25");
  const [runTimeoutSec, setRunTimeoutSec] = useState("120");
  const [includeBlogAndProductPaths, setIncludeBlogAndProductPaths] = useState(true);

  async function loadRuns() {
    setLoadingRuns(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/analyses`);
      if (!res.ok) return;
      const data = (await res.json()) as AnalysisRun[];
      setRuns(data);
      setSelectedRunId((current) => current ?? data[0]?.id ?? null);
    } finally {
      setLoadingRuns(false);
    }
  }

  async function loadDetail(runId: string) {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/analyses/${runId}`);
      if (!res.ok) return;
      const data = (await res.json()) as AnalysisRunDetail;
      setSelectedRun(data);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function startRun() {
    if (submitting) return;

    const parsedMaxPages = Number(maxPages);
    const parsedRunTimeoutSec = Number(runTimeoutSec);
    const advanced = {
      maxPages: Number.isFinite(parsedMaxPages) ? parsedMaxPages : 25,
      runTimeoutMs: Number.isFinite(parsedRunTimeoutSec)
        ? parsedRunTimeoutSec * 1000
        : 120_000,
      includeBlogAndProductPaths,
    };

    setSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/analyses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset, advanced: showAdvanced ? advanced : undefined }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { runId: string };
      await loadRuns();
      setSelectedRunId(data.runId);
      await loadDetail(data.runId);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadRuns();
  }, [leadId]);

  useEffect(() => {
    if (!selectedRunId) {
      setSelectedRun(null);
      return;
    }
    loadDetail(selectedRunId);
  }, [leadId, selectedRunId]);

  const hasRunning = runs.some((run) => run.status === "pending" || run.status === "running");

  useEffect(() => {
    if (!hasRunning) return;
    const t = setInterval(() => {
      loadRuns();
      if (selectedRunId) loadDetail(selectedRunId);
    }, 2_500);
    return () => clearInterval(t);
  }, [hasRunning, selectedRunId]);

  const selectedSummary = useMemo(
    () => (selectedRun ? parseSummary(selectedRun.summary) : null),
    [selectedRun],
  );

  return (
    <Card
      title="Analisi approfondita"
      subtitle="Analizza più pagine del sito e mostra criticità SEO tecniche ordinate per priorità"
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-ink-700">
          <p className="font-semibold text-ink-900">Come usarla</p>
          <p className="mt-1 text-xs text-ink-500">
            1) Scegli preset o opzioni avanzate. 2) Avvia la run. 3) Leggi prima le criticità alta priorità.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Preset analisi" hint="Leggera: veloce · Standard: bilanciata · Profonda: massima copertura">
            <Select
              value={preset}
              onChange={(event) => {
                const next = event.target.value as AnalysisPreset;
                setPreset(next);
                if (next === "light") {
                  setMaxPages("10");
                  setRunTimeoutSec("60");
                } else if (next === "standard") {
                  setMaxPages("25");
                  setRunTimeoutSec("120");
                } else {
                  setMaxPages("50");
                  setRunTimeoutSec("180");
                }
              }}
            >
              {PRESET_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {ANALYSIS_PRESET_LABELS[option]}
                </option>
              ))}
            </Select>
          </Field>
          <div className="md:col-span-2 flex items-end justify-end gap-2">
            <Button
              variant="secondary"
              iconLeft={<RefreshCcw className="h-4 w-4" />}
              onClick={loadRuns}
              disabled={loadingRuns}
            >
              Aggiorna
            </Button>
            <Button
              onClick={startRun}
              disabled={submitting}
              iconLeft={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            >
              {submitting ? "Avvio…" : "Avvia analisi"}
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-700"
        >
          <ChevronDown className={clsx("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
          Opzioni avanzate
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 gap-3 rounded-xl bg-surface-muted p-3 md:grid-cols-3">
            <Field label="Pagine massime" hint="Tra 5 e 100">
              <Input
                type="number"
                min={5}
                max={100}
                value={maxPages}
                onChange={(event) => setMaxPages(event.target.value)}
              />
            </Field>
            <Field label="Timeout totale (secondi)" hint="Tra 10 e 600 secondi">
              <Input
                type="number"
                min={10}
                max={600}
                value={runTimeoutSec}
                onChange={(event) => setRunTimeoutSec(event.target.value)}
              />
            </Field>
            <Field label="Priorità crawling" hint="Dai precedenza a URL blog/prodotti">
              <label className="inline-flex h-[42px] items-center gap-2 rounded-xl bg-surface px-3.5 py-2.5 text-sm text-ink-900 ring-1 ring-ink-300/70">
                <input
                  type="checkbox"
                  checked={includeBlogAndProductPaths}
                  onChange={(event) => setIncludeBlogAndProductPaths(event.target.checked)}
                />
                Abilitata
              </label>
            </Field>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Storico analisi" subtitle="Seleziona una run per vedere il dettaglio" padding="sm">
            {runs.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">Nessuna analisi eseguita.</p>
            ) : (
              <ul className="space-y-2">
                {runs.map((run) => {
                  const active = run.id === selectedRunId;
                  const progress = getRunProgress(run);

                  return (
                    <li key={run.id}>
                      <button
                        type="button"
                        className={clsx(
                          "w-full rounded-xl border px-3 py-2 text-left",
                          active ? "border-brand-400 bg-brand-50/40" : "border-ink-300/50 bg-surface-muted",
                        )}
                        onClick={() => setSelectedRunId(run.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Badge tone={STATUS_TONE[run.status]}>{STATUS_LABEL[run.status]}</Badge>
                          <span className="text-xs text-ink-500">{ANALYSIS_PRESET_LABELS[run.preset]}</span>
                          {run.status === "running" && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600" />}
                        </div>
                        <p className="mt-1 text-xs text-ink-500">{new Date(run.createdAt).toLocaleString("it-IT")}</p>
                        <p className="mt-1 text-xs text-ink-700">
                          Scansionate: {run.scannedCount} · Trovate: {run.discoveredCount} · Limite: {run.maxPages}
                        </p>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-surface-sunken">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="mt-1 text-[11px] text-ink-500">
                          {run.status === "done" ? "Run conclusa" : `${progress}% completamento`}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Dettaglio run" subtitle="Priorità: affronta prima alta, poi media, poi bassa" padding="sm">
            {!selectedRunId ? (
              <p className="py-6 text-center text-sm text-ink-400">Seleziona una run.</p>
            ) : loadingDetail ? (
              <p className="py-6 text-center text-sm text-ink-400">Caricamento dettagli…</p>
            ) : !selectedRun ? (
              <p className="py-6 text-center text-sm text-ink-400">Dettaglio non disponibile.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE[selectedRun.status]}>{STATUS_LABEL[selectedRun.status]}</Badge>
                  <span className="text-xs text-ink-500">{ANALYSIS_PRESET_LABELS[selectedRun.preset]}</span>
                </div>

                {selectedRun.errorMessage && (
                  <p className="rounded-xl bg-tile-pink-bg px-3 py-2 text-xs text-tile-pink-icon">
                    {selectedRun.errorMessage}
                  </p>
                )}

                {selectedSummary && (
                  <div className="rounded-xl bg-surface-muted p-3 text-sm">
                    <p className="font-semibold text-ink-900">Riepilogo criticità</p>
                    <p className="text-xs text-ink-500">
                      Pagine analizzate: {selectedSummary.pagesScanned} · Problemi totali: {selectedSummary.issueCounts.total}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone="pink">Alta priorità: {selectedSummary.issueCounts.high}</Badge>
                      <Badge tone="orange">Media priorità: {selectedSummary.issueCounts.medium}</Badge>
                      <Badge tone="yellow">Bassa priorità: {selectedSummary.issueCounts.low}</Badge>
                    </div>
                    {selectedSummary.topFindings.length > 0 && (
                      <ul className="mt-2 list-disc pl-5 text-xs text-ink-700">
                        {selectedSummary.topFindings.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {selectedRun && selectedRun.pages.length > 0 && (
          <Card
            title="Dettaglio per pagina"
            subtitle={`${selectedRun.pages.length} pagine nel report selezionato`}
            padding="sm"
          >
            <div className="space-y-2">
              {selectedRun.pages.map((page) => {
                const issues = parseIssues(page.issues);
                const high = issues.filter((issue) => issue.severity === "high").length;
                const medium = issues.filter((issue) => issue.severity === "medium").length;
                const low = issues.filter((issue) => issue.severity === "low").length;

                return (
                  <details key={page.id} className="rounded-xl bg-surface-muted px-3 py-2" open={false}>
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="neutral" className="capitalize">{page.pageType}</Badge>
                        {page.httpStatus != null && (
                          <Badge tone={page.httpStatus < 400 ? "green" : "pink"}>{page.httpStatus}</Badge>
                        )}
                        <Badge tone="pink">Alta: {high}</Badge>
                        <Badge tone="orange">Media: {medium}</Badge>
                        <Badge tone="yellow">Bassa: {low}</Badge>
                        <span className="ml-auto text-[11px] text-ink-500">
                          {new Date(page.scannedAt).toLocaleString("it-IT")}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-ink-700">{page.scannedUrl}</p>
                    </summary>

                    <div className="mt-2 border-t border-ink-300/40 pt-2 text-xs">
                      <p><span className="text-ink-500">Title:</span> <span className="text-ink-900">{page.title || "Assente"}</span></p>
                      <p><span className="text-ink-500">Meta description:</span> <span className="text-ink-900">{page.metaDescription || "Assente"}</span></p>
                      <p><span className="text-ink-500">H1:</span> <span className="text-ink-900">{page.h1 || "Assente"}</span></p>
                      <p><span className="text-ink-500">Canonical:</span> <span className="text-ink-900 break-all">{page.canonical || "Assente"}</span></p>
                      <p><span className="text-ink-500">Robots meta:</span> <span className="text-ink-900">{page.robotsMeta || "(default)"}</span></p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge tone={page.schemaPresent ? "green" : "neutral"}>
                          Schema {page.schemaPresent ? "presente" : "assente"}
                        </Badge>
                        <Badge tone={page.indexable ? "green" : "pink"}>
                          {page.indexable ? "Indicizzabile" : "Noindex"}
                        </Badge>
                      </div>
                      {issues.length > 0 && (
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-ink-700">
                          {issues.map((issue, index) => (
                            <li key={`${page.id}-${issue.code}-${index}`}>
                              <span className="font-medium">{severityLabel(issue.severity)}:</span> {issue.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}

function getRunProgress(run: AnalysisRun): number {
  if (run.status === "done") return 100;
  if (run.maxPages <= 0) return 0;
  return Math.min(100, Math.round((run.scannedCount / run.maxPages) * 100));
}

function parseSummary(value: unknown): AnalysisSummary | null {
  if (!value || typeof value !== "object") return null;
  const summary = value as AnalysisSummary;
  if (!summary.issueCounts || !summary.topFindings) return null;
  return summary;
}

function parseIssues(value: unknown): AnalysisIssue[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is AnalysisIssue => {
    return (
      typeof item === "object" &&
      item !== null &&
      "severity" in item &&
      "message" in item &&
      "code" in item
    );
  });
}

function severityLabel(severity: AnalysisIssue["severity"]): string {
  if (severity === "high") return "Alta priorità";
  if (severity === "medium") return "Media priorità";
  return "Bassa priorità";
}
