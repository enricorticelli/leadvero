# RB-0002: Start the stack manually

## When to use

Use this procedure when you need separate control of the database, Next.js app, and worker, or when debugging a single stage of local startup.

## Prerequisites

- Node.js 20+.
- Docker running locally.
- `.env` created from `.env.example`.
- Dependencies installed with `npm install`.

## Steps

1. Run `docker compose up -d`.
2. Run `npm run db:push` to sync the Prisma schema.
3. Optionally run `npm run db:seed` for fixture data.
4. In one terminal run `npm run dev`.
5. In a second terminal run `npm run worker`.

## Verification

- `docker compose ps` shows the Postgres container running.
- The app responds on `http://localhost:3000`.
- The worker terminal logs job pickup when a search is created.

## Rollback

1. Stop the `npm run dev` and `npm run worker` processes.
2. Run `docker compose down` to stop PostgreSQL.

## Evidence

- `README.md:44-50` lists the manual startup sequence.
- `package.json:6`, `package.json:9`, and `package.json:11-14` expose the needed commands.
- `docker-compose.yml:3` and `docker-compose.yml:11-13` define the local Postgres service and port mapping.
