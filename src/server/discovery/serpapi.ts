import { requireSerpApi } from "../env";

export interface SerpResult {
  title: string;
  url: string;
  snippet?: string;
  position?: number;
}

export interface SerpSearchOptions {
  q: string;
  num?: number;
  start?: number;
  gl?: string;
  hl?: string;
  googleDomain?: string;
  signal?: AbortSignal;
}

interface SerpApiResponse {
  organic_results?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
    position?: number;
  }>;
  error?: string;
}

const ENDPOINT = "https://serpapi.com/search.json";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function serpSearch(
  opts: SerpSearchOptions,
): Promise<SerpResult[]> {
  const params = new URLSearchParams({
    engine: "google",
    q: opts.q,
    num: String(opts.num ?? 20),
    start: String(opts.start ?? 0),
    gl: opts.gl ?? "it",
    hl: opts.hl ?? "it",
    google_domain: opts.googleDomain ?? "google.it",
    api_key: requireSerpApi(),
  });

  let attempt = 0;
  const maxAttempts = 3;
  let lastErr: unknown;
  while (attempt < maxAttempts) {
    attempt++;
    try {
      const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
        signal: opts.signal,
      });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`SerpAPI ${res.status}`);
        await sleep(500 * Math.pow(2, attempt));
        continue;
      }
      if (!res.ok) {
        throw new Error(`SerpAPI ${res.status}: ${await res.text()}`);
      }
      const json = (await res.json()) as SerpApiResponse;
      if (json.error) throw new Error(`SerpAPI: ${json.error}`);
      return (json.organic_results ?? [])
        .filter((r) => r.link)
        .map((r) => ({
          title: r.title ?? "",
          url: r.link!,
          snippet: r.snippet,
          position: r.position,
        }));
    } catch (err) {
      lastErr = err;
      if (attempt >= maxAttempts) break;
      await sleep(500 * Math.pow(2, attempt));
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error("SerpAPI failed after retries");
}
