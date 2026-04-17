import type { CandidateRecord } from "../../discovery/types";

const store = new Map<string, CandidateRecord>();

export function upsertCandidate(runId: string, candidate: CandidateRecord): CandidateRecord {
  const key = `${runId}:${candidate.domainKey}`;
  const existing = store.get(key);
  if (!existing || candidate.score >= existing.score) {
    store.set(key, candidate);
  }
  return store.get(key)!;
}

export function listCandidates(runId: string): CandidateRecord[] {
  const prefix = `${runId}:`;
  return [...store.entries()]
    .filter(([key]) => key.startsWith(prefix))
    .map(([, value]) => value);
}
