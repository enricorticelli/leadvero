import { createRun, listRuns, markAborted } from "../db/repositories/discovery-runs.repository";
import { queueClient } from "../queue/client";
import { processRun } from "../queue/worker";
import type { DiscoveryRunInput } from "./types";

export async function startRun(input: DiscoveryRunInput) {
  const run = createRun(input);
  queueClient.add({ runId: run.id });
  void processRun(run.id);
  return run;
}

export function stopRun(id: string) {
  return markAborted(id);
}

export function listDiscoveryRuns() {
  return listRuns();
}
