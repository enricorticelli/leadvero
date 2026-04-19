# ADR-0010: Migrate to SQLite for single-machine desktop deployment

- Status: accepted
- Date: 2026-04-19
- Supersedes: [ADR-0002](./0002-postgresql-and-prisma.md)

## Context

Leadvero is a personal tool used by a single operator on a single machine. Distributing it as a desktop application (see ADR-0011) requires the database to run without a separate server process. Requiring the end user to install Docker or run a PostgreSQL daemon defeats the goal of zero-dependency installation.

## Decision

Replace PostgreSQL with SQLite as the Prisma datasource. All Prisma models remain unchanged; `Json` columns map to TEXT with JSON serialisation and enums map to string literals, both handled transparently by Prisma 5.x.

The `binaryTargets` in `prisma/schema.prisma` are updated to `["native", "darwin", "darwin-arm64"]` to generate macOS engine binaries for the packaged app.

The two worker functions that used the PostgreSQL-specific `FOR UPDATE SKIP LOCKED` advisory lock are replaced with an optimistic `findFirst` + guarded `updateMany` pattern. This is race-safe for a single worker process on SQLite because SQLite serialises writes.

A `leadvero-template.db` is generated at build time (`npm run build:db-template`) by running `prisma db push` and seeding the admin user into a fresh SQLite file. On first launch, the Electron shell copies this template into the user's data directory instead of running schema migrations at runtime, keeping the production binary free of the Prisma schema engine.

## Consequences

- No PostgreSQL process, no Docker dependency, no port conflicts.
- SQLite is not suitable for multi-user or multi-machine deployments. If Leadvero ever needs those, this ADR must be revisited.
- Schema migrations on app updates require a migration helper or a full template-replace strategy (acceptable for a single-user tool at this stage).

## Evidence

- `prisma/schema.prisma:1-8` sets `provider = "sqlite"` and `binaryTargets = ["native", "darwin", "darwin-arm64"]`.
- `src/server/jobs/worker.ts:7-35` implements the optimistic claim pattern for both job types.
- `scripts/build-db-template.ts` generates `electron/leadvero-template.db` at build time.
- `electron/main.js:33-41` copies the template to `userData/leadvero.db` on first launch.
- `src/server/env.ts:4` provides `file:./leadvero.db` as the default `DATABASE_URL`.
