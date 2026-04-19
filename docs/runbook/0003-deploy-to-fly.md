# RB-0003: Deploy to Fly.io (tag push → GitHub Actions)

## When to use

Use this procedure for first-time deployment and for any production release. Production context is defined in [ADR-0008](../adr/0008-fly-io-deployment.md).

## Prerequisites

- A Fly.io account with `flyctl` installed locally.
- Repository secret `FLY_API_TOKEN` configured in GitHub (Settings → Secrets and variables → Actions).
- The `leadvero` app and a Postgres cluster created on Fly.

## First-time setup (once)

1. Install `flyctl` and authenticate: `flyctl auth login`.
2. Create the app (from repo root): `flyctl apps create leadvero` — the name must match [fly.toml](../../fly.toml).
3. Provision Postgres: `flyctl postgres create --name leadvero-db --region fra --vm-size shared-cpu-1x --volume-size 1`.
4. Attach Postgres to the app: `flyctl postgres attach leadvero-db --app leadvero` — this sets `DATABASE_URL` as a Fly secret.
5. Set the remaining secrets:
   - `flyctl secrets set -a leadvero SESSION_SECRET="$(openssl rand -hex 32)"`
   - `flyctl secrets set -a leadvero SERPAPI_KEY="..."`
   - `flyctl secrets set -a leadvero ANTHROPIC_API_KEY="..."`
   - (optional) `flyctl secrets set -a leadvero ANTHROPIC_MODEL="claude-sonnet-4-6"`
6. Generate a Fly deploy token for CI: `flyctl tokens create deploy --name github-actions --app leadvero`.
7. Paste the token as the `FLY_API_TOKEN` secret in GitHub.
8. Trigger the first deploy by pushing a tag (see below).

## Release (every deploy)

1. Bump the app version locally and commit on `main`.
2. Create an annotated tag: `git tag -a v0.1.0 -m "Release 0.1.0"`.
3. Push the tag: `git push origin v0.1.0`.
4. GitHub Actions runs typecheck + unit tests, then `flyctl deploy --remote-only`.
5. Fly runs the release command (`prisma db push --skip-generate`) before switching traffic.

## Seed the admin user (first deploy only)

1. `flyctl ssh console -a leadvero`.
2. Inside the machine: `npx tsx prisma/seed.ts`.
3. Open the app URL, log in as `admin`/`admin`, and change the password on the first-login screen.

## Verification

- `flyctl status -a leadvero` shows at least one `app` machine and one `worker` machine as `started`.
- `flyctl logs -a leadvero -n` prints Next.js startup; use `flyctl machine list -a leadvero` + `flyctl logs -a leadvero --machine <id>` to isolate a specific process-group machine.
- Visit `https://leadvero.fly.dev/login` (or the custom hostname) and log in.

## Rollback

1. `flyctl releases -a leadvero` to list recent releases.
2. `flyctl releases rollback <version> -a leadvero` to switch back.
3. If the failure is schema-related, rolling back the image does not roll back the schema — reconcile with `prisma db push` against the old schema before restoring traffic.

## Common issues

- **Release command failed (destructive schema change)**: `prisma db push` refuses to drop columns without `--accept-data-loss`. Review the diff, export any data at risk, then re-run manually via `flyctl ssh console`.
- **`Authentication failed against database server ... provided database credentials ... are not valid`**: `DATABASE_URL` was updated but not fully rolled out to all machines. Check `flyctl secrets list -a leadvero`; if `DATABASE_URL` is `Staged` or `Partial`, run `flyctl secrets deploy -a leadvero`, then verify again.
- **`P1001: Can't reach database server at leadvero-db.flycast:5432` during deploy/release**: the Postgres machine may be stopped. Check `flyctl status -a leadvero-db`; if needed, start it with `flyctl machine start <db-machine-id> -a leadvero-db`, wait for checks to pass, then rerun the failed command.
- **`Error [DataError]: Zero-length key is not supported` on login**: `SESSION_SECRET` is empty/invalid on Fly. Regenerate and deploy: `flyctl secrets set -a leadvero --stage SESSION_SECRET="$(openssl rand -hex 32)"` then `flyctl secrets deploy -a leadvero`.
- **Worker loops on the same failed job**: find the worker machine with `flyctl machine list -a leadvero`, then inspect with `flyctl logs -a leadvero --machine <worker-id>` and inspect the `SearchJob` row; set `status = 'failed'` manually if needed.
- **Prisma engine not found at runtime**: the image must be rebuilt; the Alpine engine is baked in only when `binaryTargets` includes `linux-musl-openssl-3.0.x` (see [prisma/schema.prisma](../../prisma/schema.prisma)).
