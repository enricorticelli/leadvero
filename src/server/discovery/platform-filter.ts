import type { CandidateInput, DiscoveryPlatform } from "./types";

export function platformFilter(candidate: CandidateInput, platform: DiscoveryPlatform): boolean {
  if (platform === "both") {
    return candidate.platform === "wordpress" || candidate.platform === "shopify";
  }
  return candidate.platform === platform;
}
