# RB-0001: Bootstrap local development with dev:up

## When to use

Use this procedure for the normal local development startup path when you want the database, Next.js app, and worker process started together.

## Prerequisites

- Node.js 20+.
- `npm install` completed.
- `.env` created from `.env.example` and populated with `SERPAPI_KEY`.
- No Docker required — the database is SQLite (see ADR-0010).

## Steps

1. Copy `.env.example` to `.env` and fill in `SERPAPI_KEY`. `DATABASE_URL` defaults to `file:./leadvero.db`.
2. Run `npx prisma migrate dev` (first time only) to create the local SQLite database.
3. Run `npm run dev:up` from the repository root.
4. Keep the terminal open while developing.

## Verification

- The script prints that the schema is synced.
- The Next.js app is reachable at `http://localhost:3000`.
- Creating a search from the UI causes the worker to pick it up in the background.

## Rollback

1. Stop the bootstrap with `Ctrl+C`.
2. To reset the database: delete `leadvero.db` and re-run `npx prisma migrate dev`.

## Evidence

- `package.json` exposes `dev:up`.
- `src/server/env.ts:4` provides `file:./leadvero.db` as the default `DATABASE_URL`.
- `scripts/bootstrap.ts` implements the bootstrap sequence.
