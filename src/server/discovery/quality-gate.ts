import { getDomain } from "tldts";
import type { CandidateInput, CandidateRecord } from "./types";

const SUPPRESSED_HOST_PARTS = ["parked", "placeholder", "localhost"];

export function canonicalDomain(input: string): string {
  const normalized = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");
  const root = getDomain(normalized, { allowPrivateDomains: true });
  return root ?? normalized.split("/")[0];
}

function isSuppressedHost(host: string): boolean {
  return SUPPRESSED_HOST_PARTS.some((token) => host.includes(token));
}

export function qualityGate(candidates: CandidateInput[]): CandidateRecord[] {
  const deduped = new Map<string, CandidateRecord>();

  for (const candidate of candidates) {
    const canonical = canonicalDomain(candidate.domain);
    if (!canonical || isSuppressedHost(canonical)) continue;

    const domainKey = canonical.replace(/[^a-z0-9.-]/g, "");
    const existing = deduped.get(domainKey);
    const normalized: CandidateRecord = {
      ...candidate,
      canonicalDomain: canonical,
      domainKey,
      score: candidate.score ?? 0
    };

    if (!existing || normalized.score > existing.score) {
      deduped.set(domainKey, normalized);
    }
  }

  return [...deduped.values()];
}
