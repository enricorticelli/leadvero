import { prisma } from "../db/prisma";
import { runSearchJob } from "./runner";

const POLL_INTERVAL_MS = 2_000;

async function claimNextJob(): Promise<string | null> {
  const result = await prisma.$queryRaw<{ id: string }[]>`
    UPDATE "SearchJob"
    SET status = 'running', "startedAt" = NOW()
    WHERE id = (
      SELECT id FROM "SearchJob"
      WHERE status = 'pending'
      ORDER BY "createdAt" ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id
  `;
  return result[0]?.id ?? null;
}

async function main() {
  console.log("[worker] Starting Leadvero job worker…");
  while (true) {
    try {
      const jobId = await claimNextJob();
      if (jobId) {
        console.log(`[worker] Running job ${jobId}`);
        await runSearchJob(jobId);
        console.log(`[worker] Finished job ${jobId}`);
      }
    } catch (err) {
      console.error("[worker] Error in loop:", err);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

main().catch((err) => {
  console.error("[worker] Fatal:", err);
  process.exit(1);
});
