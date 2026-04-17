import robotsParser from "robots-parser";
import { env } from "../env";

const TIMEOUT_MS = 10_000;
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const RATE_LIMIT_MS = 1_000;

const lastRequestAt = new Map<string, number>();
const robotsCache = new Map<string, ReturnType<typeof robotsParser>>();

async function throttle(host: string): Promise<void> {
  const now = Date.now();
  const last = lastRequestAt.get(host) ?? 0;
  const wait = RATE_LIMIT_MS - (now - last);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt.set(host, Date.now());
}

async function fetchRobots(
  baseUrl: string,
): Promise<ReturnType<typeof robotsParser>> {
  const cached = robotsCache.get(baseUrl);
  if (cached) return cached;
  try {
    const res = await fetch(`${baseUrl}/robots.txt`, {
      signal: AbortSignal.timeout(5_000),
    });
    const text = res.ok ? await res.text() : "";
    const parsed = robotsParser(`${baseUrl}/robots.txt`, text);
    robotsCache.set(baseUrl, parsed);
    return parsed;
  } catch {
    const parsed = robotsParser(`${baseUrl}/robots.txt`, "");
    robotsCache.set(baseUrl, parsed);
    return parsed;
  }
}

export interface FetchedPage {
  url: string;
  status: number;
  html: string;
  headers: Record<string, string>;
}

export interface FetchOptions {
  checkRobots?: boolean;
  signal?: AbortSignal;
}

export async function fetchPage(
  url: string,
  opts: FetchOptions = {},
): Promise<FetchedPage | null> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const baseUrl = `${parsed.protocol}//${parsed.host}`;
  await throttle(parsed.host);

  if (opts.checkRobots !== false) {
    const robots = await fetchRobots(baseUrl);
    const ua = env().LEADVERO_USER_AGENT;
    if (!robots.isAllowed(url, ua)) {
      return null;
    }
  }

  let attempt = 0;
  while (attempt < 2) {
    attempt++;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const combined = opts.signal
        ? anyAbort([controller.signal, opts.signal])
        : controller.signal;

      const res = await fetch(url, {
        signal: combined,
        redirect: "follow",
        headers: {
          "User-Agent": env().LEADVERO_USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
        },
      });
      clearTimeout(timeout);

      if (res.status >= 500 && attempt < 2) continue;
      if (!res.ok && res.status !== 301 && res.status !== 302) {
        return {
          url: res.url,
          status: res.status,
          html: "",
          headers: headersToRecord(res.headers),
        };
      }

      const headers = headersToRecord(res.headers);
      const contentType = headers["content-type"] ?? "";
      if (!contentType.includes("html")) {
        return { url: res.url, status: res.status, html: "", headers };
      }

      const reader = res.body?.getReader();
      if (!reader) {
        return { url: res.url, status: res.status, html: "", headers };
      }

      let bytes = 0;
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BODY_BYTES) {
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }

      const html = new TextDecoder().decode(
        chunks.reduce((acc, c) => {
          const merged = new Uint8Array(acc.length + c.length);
          merged.set(acc);
          merged.set(c, acc.length);
          return merged;
        }, new Uint8Array(0)),
      );

      return { url: res.url, status: res.status, html, headers };
    } catch {
      if (attempt >= 2) return null;
    }
  }
  return null;
}

function headersToRecord(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((v, k) => {
    out[k.toLowerCase()] = v;
  });
  return out;
}

function anyAbort(signals: AbortSignal[]): AbortSignal {
  const ctrl = new AbortController();
  for (const s of signals) {
    if (s.aborted) {
      ctrl.abort();
      break;
    }
    s.addEventListener("abort", () => ctrl.abort(), { once: true });
  }
  return ctrl.signal;
}

export function clearRobotsCache() {
  robotsCache.clear();
}
