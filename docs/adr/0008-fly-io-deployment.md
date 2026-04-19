# ADR-0008: Deploy to Fly.io with web + worker process groups

- Status: accepted
- Date: 2026-04-19

## Context

Leadvero must ship to a hosted environment while keeping the existing architecture intact: a Next.js app (interactive UI + API routes) plus a long-running worker process that polls Postgres for queued search jobs (ADR-0003). The project is a single-operator tool — hosting cost must be near zero, and deploy ergonomics must not require bespoke infrastructure.

Vercel was considered but rejected: its serverless model cannot host the worker as-is without rewriting the job runner into cron-triggered chunks with per-function timeouts.

## Decision

Deploy the full stack to **Fly.io** using a single Docker image with two process groups:

- `app` — runs `npm start` (Next.js), fronted by Fly's HTTPS edge.
- `worker` — runs `npm run worker` (the polling loop unchanged).

Configuration lives in [fly.toml](../../fly.toml). Both processes share the same image, the same Postgres (Fly Postgres), and the same secrets. Schema sync uses `prisma db push --skip-generate` as a release command — matching the local development flow (ADR-0002). Destructive changes fail the release rather than silently dropping data.

Continuous deployment is driven by GitHub Actions at [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml): pushing a tag matching `v*` runs typecheck + unit tests, then `flyctl deploy --remote-only`. A single `FLY_API_TOKEN` repository secret is required.

## Alternatives considered

- **Vercel + Neon + Cron**: web easy, worker requires splitting jobs into chunked cron ticks capped at 60s (hobby) / 300s (pro). Scans may exceed those limits. Architectural drift from the current runner was the decisive factor.
- **Oracle Cloud Free VM + docker-compose**: most generous free tier, fewest vendor limits, but requires manual VM maintenance (SSH, TLS, backups). Good fallback if Fly's free tier shrinks further.
- **Railway / Render free tiers**: web free but workers are not, and Render free DB is deleted after 90 days — not a fit for a job system that must stay online.
- **Prisma Migrate vs `db push`**: `prisma migrate deploy` is the conventional production path, but the project has no migration history and ships schema-first. Adding migrations now would be premature; we will switch when schema change rate justifies it.

## Consequences

- All provider secrets (`DATABASE_URL`, `SESSION_SECRET`, `SERPAPI_KEY`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`) must be set via `flyctl secrets set`.
- `tsx` and `prisma` moved from `devDependencies` to `dependencies` so the production image can run the worker and schema sync.
- `prisma/schema.prisma` now declares `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` so the generated client works in the Alpine runtime.
- Fly Postgres free tier may be retired; the system is Postgres-agnostic, so swapping to Neon is a one-env-var change.
- The worker VM runs continuously (no auto-stop). The web VM auto-stops on idle to preserve free-tier hours.
- Deploys are gated on unit tests passing. Integration/smoke of the deployed image is manual via `fly logs` + a post-deploy health check.
