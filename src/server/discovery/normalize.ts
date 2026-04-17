import { getDomain, parse } from "tldts";

const BLOCKED_HOSTS = new Set([
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "tiktok.com",
  "pinterest.com",
  "reddit.com",
  "wikipedia.org",
  "amazon.com",
  "amazon.it",
  "ebay.com",
  "ebay.it",
  "etsy.com",
  "aliexpress.com",
  "alibaba.com",
  "zalando.it",
  "zalando.com",
  "google.com",
  "google.it",
  "bing.com",
  "yelp.com",
  "paginegialle.it",
  "trustpilot.com",
  "tripadvisor.com",
  "tripadvisor.it",
]);

const BLOCKED_SUBSTRINGS = [
  "myshopify.com",
  "wordpress.com",
  "wixsite.com",
  "squarespace.com",
  "blogspot.com",
  "medium.com",
  "shopify.dev",
];

export interface NormalizedCandidate {
  normalizedDomain: string;
  domain: string;
  sourceUrl: string;
}

export function normalizeUrl(raw: string): NormalizedCandidate | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const parsed = parse(url.hostname);
  if (!parsed.domain || parsed.isIp) return null;

  const registrable = getDomain(url.hostname);
  if (!registrable) return null;

  if (BLOCKED_HOSTS.has(registrable)) return null;
  if (BLOCKED_SUBSTRINGS.some((s) => url.hostname.includes(s))) return null;

  const hostWithoutWww = url.hostname.replace(/^www\./, "");
  return {
    normalizedDomain: registrable.toLowerCase(),
    domain: hostWithoutWww.toLowerCase(),
    sourceUrl: url.toString(),
  };
}

export function dedupe<T extends NormalizedCandidate>(
  candidates: T[],
  existing: Set<string> = new Set(),
): T[] {
  const out: T[] = [];
  const seen = new Set(existing);
  for (const c of candidates) {
    if (seen.has(c.normalizedDomain)) continue;
    seen.add(c.normalizedDomain);
    out.push(c);
  }
  return out;
}
