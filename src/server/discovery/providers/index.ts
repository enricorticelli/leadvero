import type { Provider } from "./types";
import type { DiscoveryRunInput, CandidateInput } from "../types";

const wordpressProvider: Provider = {
  name: "blended-wordpress",
  async fetch(criteria: DiscoveryRunInput): Promise<CandidateInput[]> {
    return [
      { domain: `${criteria.keyword}-wp.example.com`, platform: "wordpress", source: "blended", score: 0.8 }
    ];
  }
};

const shopifyProvider: Provider = {
  name: "blended-shopify",
  async fetch(criteria: DiscoveryRunInput): Promise<CandidateInput[]> {
    return [
      { domain: `${criteria.keyword}-shop.example.com`, platform: "shopify", source: "blended", score: 0.7 }
    ];
  }
};

export const blendedProviders: Provider[] = [wordpressProvider, shopifyProvider];

export async function fetchBlendedCandidates(criteria: DiscoveryRunInput): Promise<CandidateInput[]> {
  const results = await Promise.all(blendedProviders.map((provider) => provider.fetch(criteria)));
  return results.flat();
}
