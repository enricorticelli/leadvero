import type { DiscoveryPlatformSchema, DiscoveryRunInputSchema } from "./schema";
import type { z } from "zod";

export type DiscoveryPlatform = z.infer<typeof DiscoveryPlatformSchema>;
export type DiscoveryRunInput = z.infer<typeof DiscoveryRunInputSchema>;

export type CandidateInput = {
  domain: string;
  platform: "wordpress" | "shopify";
  source: string;
  score?: number;
};

export type CandidateRecord = CandidateInput & {
  canonicalDomain: string;
  domainKey: string;
  score: number;
};

export type DiscoveryRunRecord = DiscoveryRunInput & {
  id: string;
  status: "queued" | "running" | "completed" | "aborted";
  discoveredCount: number;
  startedAt?: string;
  completedAt?: string;
  stoppedAt?: string;
};
