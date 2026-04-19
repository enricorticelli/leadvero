# RB-0002: Start the stack manually

## When to use

Use this procedure when you need separate control of the Next.js app and worker, or when debugging a single stage of local startup.

## Prerequisites

- Node.js 20+.
- `.env` created from `.env.example`.
- Dependencies installed with `npm install`.
- No Docker required — the database is SQLite (see ADR-0010).

## Steps

1. Run `npm run db:push` to sync the Prisma schema to `leadvero.db` (creates the file if absent).
2. Optionally run `npm run db:seed` for fixture data.
3. In one terminal run `npm run dev`.
4. In a second terminal run `npm run worker`.

## Verification

- `leadvero.db` exists in the project root.
- The app responds on `http://localhost:3000`.
- The worker terminal logs job pickup when a search is created.

## Rollback

1. Stop the `npm run dev` and `npm run worker` processes.
2. To reset data: delete `leadvero.db` and re-run `npm run db:push`.

## Evidence

- `package.json` exposes `dev`, `worker`, and `db:push`.
- `src/server/env.ts:4` provides `file:./leadvero.db` as the default `DATABASE_URL`.
