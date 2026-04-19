/**
 * Single-command dev bootstrap:
 *   npm run dev:up
 *
 * Steps:
 *   1. prisma db push --skip-generate  (create/sync leadvero.db, idempotent)
 *   2. seed if DB is empty
 *   3. spawn: next dev + worker         (in parallel, logs merged)
 */

import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function step(msg: string) {
  console.log(`\n\x1b[36m▶ ${msg}\x1b[0m`);
}

function ok(msg: string) {
  console.log(`\x1b[32m✓ ${msg}\x1b[0m`);
}

function fail(msg: string) {
  console.error(`\x1b[31m✗ ${msg}\x1b[0m`);
}

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit", cwd: ROOT });
}

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) {
    fail(".env not found — copy .env.example to .env and fill in SERPAPI_KEY.");
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

async function main() {
  console.log("\x1b[1m\nLeadvero — dev bootstrap\x1b[0m");

  loadEnv();

  // 1. sync SQLite schema
  step("Syncing database schema (prisma db push)…");
  try {
    run("npx prisma db push --skip-generate --accept-data-loss");
    ok("Schema synced → leadvero.db");
  } catch {
    fail("prisma db push failed");
    process.exit(1);
  }

  // 2. seed if empty
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
      ok(`DB has data (${count} SearchJob rows) — skipping seed`);
    }
  } catch {
    ok("Skipped seed check (non-fatal)");
  }

  // 3. spawn next dev + worker
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
      for (const line of d.toString().split("\n").filter(Boolean))
        console.log(`${prefix} ${line}`);
    });
    proc.stderr?.on("data", (d: Buffer) => {
      for (const line of d.toString().split("\n").filter(Boolean))
        console.error(`${prefix} ${line}`);
    });
    proc.on("exit", (code) => {
      console.error(`${prefix} exited with code ${code}`);
      process.exit(code ?? 1);
    });
    return proc;
  }

  const nextProc = spawn1("next", "npx", ["next", "dev"]);
  const workerProc = spawn1("worker", "npx", ["tsx", "src/server/jobs/worker.ts"]);

  process.on("SIGINT",  () => { nextProc.kill("SIGINT");  workerProc.kill("SIGINT");  process.exit(0); });
  process.on("SIGTERM", () => { nextProc.kill("SIGTERM"); workerProc.kill("SIGTERM"); process.exit(0); });
}

main().catch((err) => {
  fail(String(err));
  process.exit(1);
});
