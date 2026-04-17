import type { DiscoveryRunInput, DiscoveryRunRecord } from "../../discovery/types";

const runs = new Map<string, DiscoveryRunRecord>();

export function createRun(input: DiscoveryRunInput): DiscoveryRunRecord {
  const id = `run_${Math.random().toString(36).slice(2, 10)}`;
  const run: DiscoveryRunRecord = {
    ...input,
    id,
    status: "queued",
    discoveredCount: 0
  };
  runs.set(id, run);
  return run;
}

export function markRunning(id: string): DiscoveryRunRecord | undefined {
  const run = runs.get(id);
  if (!run) return undefined;
  run.status = "running";
  run.startedAt = new Date().toISOString();
  return run;
}

export function markCompleted(id: string): DiscoveryRunRecord | undefined {
  const run = runs.get(id);
  if (!run) return undefined;
  run.status = "completed";
  run.completedAt = new Date().toISOString();
  return run;
}

export function markAborted(id: string): DiscoveryRunRecord | undefined {
  const run = runs.get(id);
  if (!run) return undefined;
  run.status = "aborted";
  run.stoppedAt = new Date().toISOString();
  return run;
}

export function incrementDiscovered(id: string, by = 1): DiscoveryRunRecord | undefined {
  const run = runs.get(id);
  if (!run) return undefined;
  run.discoveredCount += by;
  return run;
}

export function listRuns(): DiscoveryRunRecord[] {
  return [...runs.values()];
}

export function getRun(id: string): DiscoveryRunRecord | undefined {
  return runs.get(id);
}
