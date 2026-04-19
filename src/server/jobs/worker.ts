import { prisma } from "../db/prisma";
import { runLeadAnalysis } from "./lead-analysis";
import { runSearchJob } from "./runner";

const POLL_INTERVAL_MS = 2_000;

async function claimNextSearchJob(): Promise<string | null> {
  const job = await prisma.searchJob.findFirst({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!job) return null;
  const updated = await prisma.searchJob.updateMany({
    where: { id: job.id, status: "pending" },
    data: { status: "running", startedAt: new Date() },
  });
  return updated.count === 1 ? job.id : null;
}

async function claimNextLeadAnalysisRun(): Promise<string | null> {
  const run = await prisma.leadAnalysisRun.findFirst({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!run) return null;
  const updated = await prisma.leadAnalysisRun.updateMany({
    where: { id: run.id, status: "pending" },
    data: { status: "running", startedAt: new Date() },
  });
  return updated.count === 1 ? run.id : null;
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
