# ADR-0003: Run lead discovery asynchronously via a database-backed worker

- Status: accepted
- Date: 2026-04-17

## Context

Lead discovery includes external search, site crawling, scoring, and persistence. That work is too slow and failure-prone to keep inside a synchronous request path.

## Decision

Persist search requests as `SearchJob` records and process them asynchronously through a polling worker that claims pending jobs from PostgreSQL.

## Consequences

API requests create jobs quickly and return an identifier instead of waiting for the full pipeline.
Operationally, local development and production-like environments need a separate worker process.
Progress and failures are tracked on the job record through discovery, scan, and scoring counters.

## Evidence

- `prisma/schema.prisma:10-14` defines job lifecycle states.
- `src/app/api/searches/route.ts:34-41` creates a `SearchJob` and returns `201` with the new id.
- `src/server/jobs/worker.ts:4` sets a polling interval, and `src/server/jobs/worker.ts:9-15` claims pending work with `FOR UPDATE SKIP LOCKED`.
- `src/server/jobs/worker.ts:29` delegates execution to `runSearchJob`.
- `src/server/jobs/runner.ts:35`, `src/server/jobs/runner.ts:59`, `src/server/jobs/runner.ts:74`, `src/server/jobs/runner.ts:182`, and `src/server/jobs/runner.ts:189-192` show the discover-scan-score-persist pipeline and final job completion updates.
- `README.md:39`, `README.md:50`, and `README.md:57` describe the background worker behavior in local usage.
