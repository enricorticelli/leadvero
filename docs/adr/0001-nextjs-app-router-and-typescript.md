# ADR-0001: Use Next.js App Router with TypeScript

- Status: accepted
- Date: 2026-04-17

## Context

Leadvero ships both a browser UI and HTTP endpoints from the same repository. The current codebase already organizes pages and API handlers under `src/app` and uses TypeScript across runtime and scripts.

## Decision

Use Next.js 15 App Router with TypeScript as the primary application framework for the web UI and API surface.

## Consequences

UI routes and API handlers live in the same application tree.
Server-side orchestration remains in `src/server`, while App Router files stay focused on request and response handling.
Build, lint, and local development flows follow the Next.js toolchain.

## Evidence

- `package.json:5-7` declares the Next.js build and runtime scripts.
- `package.json:19` uses `next lint`.
- `package.json:27` depends on `next`.
- `README.md:67-79` documents `src/app` for pages and API routes plus `src/server` for backend modules.
- `src/app/api/searches/route.ts:1` and `src/app/api/leads/route.ts:1` implement App Router route handlers.
