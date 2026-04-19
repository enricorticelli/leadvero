import { prisma } from "../db/prisma";
import { runLeadAnalysis } from "./lead-analysis";
import { runSearchJob } from "./runner";

const POLL_INTERVAL_MS = 2_000;

async function claimNextSearchJob(): Promise<string | null> {
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

async function claimNextLeadAnalysisRun(): Promise<string | null> {
  const result = await prisma.$queryRaw<{ id: string }[]>`
    UPDATE "LeadAnalysisRun"
    SET status = 'running', "startedAt" = NOW()
    WHERE id = (
      SELECT id FROM "LeadAnalysisRun"
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
      const searchJobId = await claimNextSearchJob();
      if (searchJobId) {
        console.log(`[worker] Running search job ${searchJobId}`);
        await runSearchJob(searchJobId);
        console.log(`[worker] Finished search job ${searchJobId}`);
      } else {
        const analysisRunId = await claimNextLeadAnalysisRun();
        if (analysisRunId) {
          console.log(`[worker] Running lead analysis ${analysisRunId}`);
          await runLeadAnalysis(analysisRunId);
          console.log(`[worker] Finished lead analysis ${analysisRunId}`);
        }
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
