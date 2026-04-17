/**
 * Single-command dev bootstrap:
 *   npm run dev:up
 *
 * Steps:
 *   1. docker compose up -d           (start Postgres)
 *   2. wait for Postgres to accept connections (up to 60s)
 *   3. prisma db push --skip-generate (sync schema, idempotent)
 *   4. prisma db seed                 (only if DB is empty)
 *   5. spawn: next dev  + worker      (in parallel, logs merged)
 */

import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as net from "node:net";
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ── helpers ──────────────────────────────────────────────────────────────────

function step(msg: string) {
  console.log(`\n\x1b[36m▶ ${msg}\x1b[0m`);
}

function ok(msg: string) {
  console.log(`\x1b[32m✓ ${msg}\x1b[0m`);
}

function fail(msg: string) {
  console.error(`\x1b[31m✗ ${msg}\x1b[0m`);
}

function run(cmd: string, opts: { cwd?: string } = {}) {
  execSync(cmd, { stdio: "inherit", cwd: opts.cwd ?? ROOT });
}

async function waitForPort(
  host: string,
  port: number,
  timeoutMs = 60_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await new Promise<boolean>((resolve) => {
      const sock = net.createConnection({ host, port });
      sock.once("connect", () => { sock.destroy(); resolve(true); });
      sock.once("error", () => { sock.destroy(); resolve(false); });
    });
    if (ok) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timeout waiting for ${host}:${port}`);
}

function parsePgUrl(url: string): { host: string; port: number } {
  try {
    const u = new URL(url);
    return { host: u.hostname, port: parseInt(u.port || "5432", 10) };
  } catch {
    return { host: "localhost", port: 5432 };
  }
}

// ── .env loading (minimal) ───────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) {
    fail(".env file not found — copy .env.example to .env and fill in the values.");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\x1b[1m\nLeadvero — full dev bootstrap\x1b[0m");

  loadEnv();

  // 1. docker compose up
  step("Starting Postgres via docker compose…");
  try {
    run("docker compose up -d");
    ok("docker compose up -d done");
  } catch {
    fail("docker compose failed — is Docker running?");
    process.exit(1);
  }

  // 2. wait for Postgres
  const dbUrl = process.env.DATABASE_URL ?? "";
  const { host, port } = parsePgUrl(dbUrl);
  step(`Waiting for Postgres at ${host}:${port}…`);
  try {
    await waitForPort(host, port, 60_000);
    ok(`Postgres is ready`);
  } catch {
    fail("Postgres did not become ready within 60s");
    process.exit(1);
  }

  // extra 1s so the server finishes auth setup
  await new Promise((r) => setTimeout(r, 1_000));

  // 3. prisma db push (idempotent schema sync)
  step("Syncing database schema (prisma db push)…");
  try {
    run("npx prisma db push --skip-generate --accept-data-loss");
    ok("Schema synced");
  } catch {
    fail("prisma db push failed");
    process.exit(1);
  }

  // 4. seed if DB is empty
  step("Checking if seed is needed…");
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const count = await prisma.searchJob.count();
    await prisma.$disconnect();
    if (count === 0) {
      step("DB empty — running seed…");
      run("npx tsx prisma/seed.ts");
      ok("Seed done");
    } else {
      ok(`DB already has data (${count} SearchJob rows) — skipping seed`);
    }
  } catch {
    ok("Skipped seed check (non-fatal)");
  }

  // 5. spawn dev + worker
  step("Starting Next.js dev server + job worker…\n");

  function spawn1(label: string, cmd: string, args: string[]) {
    const proc = spawn(cmd, args, {
      cwd: ROOT,
      shell: true,
      env: { ...process.env },
      stdio: "pipe",
    });

    const prefix = label === "next"
      ? "\x1b[34m[next]  \x1b[0m"
      : "\x1b[35m[worker]\x1b[0m";

    proc.stdout?.on("data", (d: Buffer) => {
      for (const line of d.toString().split("\n").filter(Boolean)) {
        console.log(`${prefix} ${line}`);
      }
    });
    proc.stderr?.on("data", (d: Buffer) => {
      for (const line of d.toString().split("\n").filter(Boolean)) {
        console.error(`${prefix} ${line}`);
      }
    });

    proc.on("exit", (code) => {
      console.error(`${prefix} exited with code ${code}`);
      process.exit(code ?? 1);
    });

    return proc;
  }

  const nextProc = spawn1("next", "npx", ["next", "dev"]);
  const workerProc = spawn1("worker", "npx", ["tsx", "src/server/jobs/worker.ts"]);

  process.on("SIGINT", () => {
    nextProc.kill("SIGINT");
    workerProc.kill("SIGINT");
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    nextProc.kill("SIGTERM");
    workerProc.kill("SIGTERM");
    process.exit(0);
  });
}

main().catch((err) => {
  fail(String(err));
  process.exit(1);
});
