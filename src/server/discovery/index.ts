import { buildQueries, type QueryInput } from "./query-builder";
import { dedupe, normalizeUrl, type NormalizedCandidate } from "./normalize";
import { serpSearch, type SerpResult } from "./serpapi";

export interface DiscoveryInput extends QueryInput {
  maxResults: number;
}

export interface DiscoveredCandidate extends NormalizedCandidate {
  sourceIntent: "shopify" | "wordpress" | "generic";
  sourceQuery: string;
  title?: string;
  snippet?: string;
}

export interface DiscoveryDeps {
  search?: (q: string, num: number) => Promise<SerpResult[]>;
  existingDomains?: Set<string>;
}

export async function discover(
  input: DiscoveryInput,
  deps: DiscoveryDeps = {},
): Promise<DiscoveredCandidate[]> {
  const search =
    deps.search ?? ((q, num) => serpSearch({ q, num, gl: "it", hl: "it" }));

  const queries = buildQueries(input);
  if (queries.length === 0) return [];

  const perQuery = Math.max(
    10,
    Math.ceil(input.maxResults / queries.length) * 2,
  );

  const all: DiscoveredCandidate[] = [];
  for (const query of queries) {
    const results = await search(query.q, perQuery);
    for (const r of results) {
      const normalized = normalizeUrl(r.url);
      if (!normalized) continue;
      all.push({
        ...normalized,
        sourceIntent: query.intent,
        sourceQuery: query.q,
        title: r.title,
        snippet: r.snippet,
      });
    }
    if (all.length >= input.maxResults * 3) break;
  }

  const deduped = dedupe(all, deps.existingDomains);
  return deduped.slice(0, input.maxResults);
}
