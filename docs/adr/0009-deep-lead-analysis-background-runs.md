# ADR-0009: Deep lead analysis via background runs with versioned history

- Status: accepted
- Date: 2026-04-19

## Context

The lead detail page already shows first-pass scan data (limited page sample) and aggregate scoring. For high-priority leads, users need a deeper technical SEO inspection with more crawled pages, run-time controls, and historical comparison across repeated analyses.

Running this analysis inline in an HTTP request would introduce timeout risk and poor UX. The current architecture already uses database-backed async processing for discovery jobs (ADR-0003).

## Decision

Introduce a dedicated deep-analysis pipeline for a single lead with these properties:

- **Database-backed run model**: `LeadAnalysisRun` stores lifecycle (`pending/running/done/failed`), config, counters, summary, and timestamps.
- **Versioned page snapshots**: `LeadAnalysisPage` stores per-page technical SEO signals and issue list for each run.
- **Background execution**: the existing worker loop also claims pending `LeadAnalysisRun` records and executes `runLeadAnalysis(runId)`.
- **Configurable presets + advanced controls**: presets (`light`, `standard`, `deep`) with optional overrides (`maxPages`, `runTimeoutMs`, `includeBlogAndProductPaths`).
- **Lead-page UX**: run creation, live progress, history list, and selected run details remain inside `/leads/[id]`.

## Consequences

- Deep analysis remains bounded and safe by reusing crawler safeguards (robots, throttle, timeout, body cap).
- Multiple run history is available without overwriting prior evidence.
- Worker complexity increases slightly (two claimable queues) but preserves existing `SearchJob` behavior.
- Additional DB storage is consumed by per-page snapshots; retention policy can be added later if needed.

## Evidence

- `prisma/schema.prisma` adds `LeadAnalysisRun`, `LeadAnalysisPage`, and related enums/relations.
- `src/server/jobs/lead-analysis.ts` implements bounded crawl, issue aggregation, summary generation, and persistence.
- `src/server/jobs/worker.ts` claims and executes both search jobs and deep-analysis runs.
- `src/app/api/leads/[id]/analyses/route.ts` and `src/app/api/leads/[id]/analyses/[runId]/route.ts` expose run lifecycle APIs.
- `src/components/leads/DeepAnalysisPanel.tsx` integrates controls, progress polling, history, and report breakdown in lead detail.
