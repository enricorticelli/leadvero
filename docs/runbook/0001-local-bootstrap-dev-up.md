# RB-0001: Bootstrap local development with dev:up

## When to use

Use this procedure for the normal local development startup path when you want the database, Next.js app, and worker process started together.

## Prerequisites

- Node.js 20+.
- Docker running locally.
- `npm install` completed.
- `.env` created from `.env.example` and populated with `SERPAPI_KEY` and `ANTHROPIC_API_KEY`.

## Steps

1. Copy `.env.example` to `.env` and fill in the provider keys.
2. Run `npm run dev:up` from the repository root.
3. Wait for the script to start Docker, wait for PostgreSQL readiness, run `prisma db push`, seed if the database is empty, and launch Next.js plus the worker.
4. Keep the terminal open while developing.

## Verification

- The script prints that Postgres is ready and the schema synced.
- The Next.js app is reachable at `http://localhost:3000`.
- Creating a search from the UI causes the worker to pick it up in the background.

## Rollback

1. Stop the bootstrap with `Ctrl+C`.
2. If you need to stop the database container too, run `docker compose down`.

## Evidence

- `package.json:10` exposes `dev:up`.
- `README.md:18-30` describes the first-time setup and `.env` creation.
- `README.md:34-39` documents the behavior of `npm run dev:up`.
- `scripts/bootstrap.ts:6-10` defines the intended bootstrap sequence.
- `scripts/bootstrap.ts:94-147` implements Docker startup, readiness waiting, schema sync, conditional seed, and process launch.
