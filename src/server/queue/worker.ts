import { listCandidates, upsertCandidate } from "../db/repositories/discovery-candidates.repository";
import { getRun, incrementDiscovered, markAborted, markCompleted, markRunning } from "../db/repositories/discovery-runs.repository";
import { platformFilter } from "../discovery/platform-filter";
import { fetchBlendedCandidates } from "../discovery/providers";
import { qualityGate } from "../discovery/quality-gate";

export async function processRun(runId: string): Promise<void> {
  const run = markRunning(runId);
  if (!run) return;

  const raw = await fetchBlendedCandidates(run);
  const filtered = raw.filter((candidate) => platformFilter(candidate, run.platform));
  const gated = qualityGate(filtered).sort((a, b) => b.score - a.score).slice(0, 50);

  for (const candidate of gated) {
    upsertCandidate(runId, candidate);
    incrementDiscovered(runId, 1);
    const current = getRun(runId);
    if (!current || current.status === "aborted") {
      markAborted(runId);
      return;
    }
  }

  markCompleted(runId);
}

export function getRunSnapshot(runId: string) {
  return {
    run: getRun(runId),
    candidates: listCandidates(runId)
  };
}
