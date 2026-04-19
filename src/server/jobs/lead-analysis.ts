type PageType = "home" | "contact" | "about" | "blog_index" | "collection" | "product" | "service" | "other";
import { prisma } from "../db/prisma";
import { fetchPage } from "../crawl/fetcher";
import * as parser from "../crawl/parser";
import {
  ANALYSIS_PRESET_DEFAULTS,
  type AnalysisAdvancedConfig,
  type AnalysisIssue,
  type AnalysisIssueSeverity,
  type AnalysisPreset,
  type AnalysisSummary,
} from "@/lib/deep-analysis";

type PartialAdvancedConfig = Partial<AnalysisAdvancedConfig>;

const BLOG_OR_PRODUCT_PATH_PATTERNS = [
  /\/blog\b/i,
  /\/news\b/i,
  /\/articoli\b/i,
  /\/notizie\b/i,
  /\/products?\//i,
  /\/collections?\//i,
  /\/shop\b/i,
  /\/catalogo\b/i,
];

const CONTACT_PATH_PATTERNS = [
  /\/contact\b/i,
  /\/contatti\b/i,
  /\/contattaci\b/i,
  /\/about\b/i,
  /\/chi-siamo\b/i,
];

export interface DeepAnalysisPageSnapshot {
  scannedUrl: string;
  pageType: PageType;
  httpStatus: number | null;
  title: string;
  metaDescription: string;
  h1: string;
  canonical: string;
  robotsMeta: string;
  schemaPresent: boolean;
  indexable: boolean;
  titleQuality: "good" | "short" | "long" | "missing";
  issues: AnalysisIssue[];
  notes: Record<string, unknown>;
}

export interface DeepAnalysisResult {
  pages: DeepAnalysisPageSnapshot[];
  discoveredCount: number;
  scannedCount: number;
  summary: AnalysisSummary;
}

export function resolveAnalysisConfig(
  preset: AnalysisPreset,
  advanced?: PartialAdvancedConfig,
): AnalysisAdvancedConfig {
  const base = ANALYSIS_PRESET_DEFAULTS[preset];
  return {
    maxPages: advanced?.maxPages ?? base.maxPages,
    runTimeoutMs: advanced?.runTimeoutMs ?? base.runTimeoutMs,
    includeBlogAndProductPaths:
      advanced?.includeBlogAndProductPaths ?? base.includeBlogAndProductPaths,
  };
}

export function shouldStopScan(
  scannedCount: number,
  maxPages: number,
  deadlineMs: number,
): boolean {
  return scannedCount >= maxPages || Date.now() >= deadlineMs;
}

export function summarizeIssues(pages: DeepAnalysisPageSnapshot[]): AnalysisSummary {
  const counts: Record<AnalysisIssueSeverity, number> = {
    high: 0,
    medium: 0,
    low: 0,
  };
  const issuesByCode: Record<string, number> = {};

  for (const page of pages) {
    for (const issue of page.issues) {
      counts[issue.severity] += 1;
      issuesByCode[issue.code] = (issuesByCode[issue.code] ?? 0) + 1;
    }
  }

  const topFindings = Object.entries(issuesByCode)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => `${issueCodeLabel(code)} (${count})`);

  return {
    generatedAt: new Date().toISOString(),
    pagesScanned: pages.length,
    issueCounts: {
      high: counts.high,
      medium: counts.medium,
      low: counts.low,
      total: counts.high + counts.medium + counts.low,
    },
    issuesByCode,
    topFindings,
  };
}

export async function runLeadAnalysis(runId: string): Promise<void> {
  const run = await prisma.leadAnalysisRun.findUnique({
    where: { id: runId },
    include: { lead: { select: { domain: true } } },
  });

  if (!run || run.status !== "running") return;

  try {
    let lastProgressUpdate = 0;
    const result = await crawlLeadDomain(run.lead.domain, {
      maxPages: run.maxPages,
      runTimeoutMs: run.runTimeoutMs,
      includeBlogAndProductPaths: run.includeBlogAndProductPaths,
    }, async (progress) => {
      const now = Date.now();
      if (now - lastProgressUpdate < 1_000) return;
      lastProgressUpdate = now;
      await prisma.leadAnalysisRun.update({
        where: { id: runId },
        data: {
          discoveredCount: progress.discoveredCount,
          scannedCount: progress.scannedCount,
        },
      });
    });

    await prisma.$transaction([
      prisma.leadAnalysisPage.deleteMany({ where: { runId } }),
      prisma.leadAnalysisPage.createMany({
        data: result.pages.map((page) => ({
          runId,
          scannedUrl: page.scannedUrl,
          pageType: page.pageType,
          httpStatus: page.httpStatus,
          title: page.title,
          metaDescription: page.metaDescription,
          h1: page.h1,
          canonical: page.canonical,
          robotsMeta: page.robotsMeta,
          schemaPresent: page.schemaPresent,
          indexable: page.indexable,
          titleQuality: page.titleQuality,
          issues: toJson(page.issues),
          notes: toJson(page.notes),
        })),
      }),
      prisma.leadAnalysisRun.update({
        where: { id: runId },
        data: {
          status: "done",
          discoveredCount: result.discoveredCount,
          scannedCount: result.scannedCount,
          summary: toJson(result.summary),
          finishedAt: new Date(),
        },
      }),
    ]);
  } catch (error) {
    await prisma.leadAnalysisRun.update({
      where: { id: runId },
      data: {
        status: "failed",
        errorMessage: String(error),
        finishedAt: new Date(),
      },
    });
  }
}

async function crawlLeadDomain(
  domain: string,
  config: AnalysisAdvancedConfig,
  onProgress?: (progress: { discoveredCount: number; scannedCount: number }) => Promise<void> | void,
): Promise<DeepAnalysisResult> {
  const startUrl = `https://${domain}`;
  const deadlineMs = Date.now() + config.runTimeoutMs;
  const queue: string[] = [startUrl];
  const queued = new Set([normalizeQueueKey(startUrl)]);
  const visited = new Set<string>();
  const pages: DeepAnalysisPageSnapshot[] = [];

  while (queue.length > 0 && !shouldStopScan(pages.length, config.maxPages, deadlineMs)) {
    const currentUrl = queue.shift()!;
    const currentKey = normalizeQueueKey(currentUrl);
    queued.delete(currentKey);
    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    const fetched = await fetchPage(currentUrl, { checkRobots: true });
    if (!fetched) continue;

    const html = fetched.html ?? "";
    const $ = html ? parser.load(html) : null;

    const title = $ ? parser.getTitle($) : "";
    const metaDescription = $ ? parser.getMeta($, "description") : "";
    const h1s = $ ? parser.getH1s($) : [];
    const canonical = $ ? parser.getCanonical($) : "";
    const robotsMeta = $ ? parser.getRobotsMeta($) : "";
    const schemaPresent = $ ? parser.hasJsonLd($) : false;
    const indexable = !/noindex/i.test(robotsMeta);
    const titleQuality = getTitleQuality(title);
    const pageType = classifyPageType(fetched.url);

    const pageSnapshot: DeepAnalysisPageSnapshot = {
      scannedUrl: fetched.url,
      pageType,
      httpStatus: fetched.status ?? null,
      title,
      metaDescription,
      h1: h1s[0] ?? "",
      canonical,
      robotsMeta,
      schemaPresent,
      indexable,
      titleQuality,
      issues: buildPageIssues({
        status: fetched.status,
        titleQuality,
        metaDescriptionPresent: metaDescription.length > 0,
        h1Count: h1s.length,
        canonicalPresent: canonical.length > 0,
        indexable,
        schemaPresent,
      }),
      notes: {
        h1Count: h1s.length,
      },
    };

    pages.push(pageSnapshot);
    if (onProgress) {
      await onProgress({ discoveredCount: visited.size + queue.length, scannedCount: pages.length });
    }

    if (!$ || shouldStopScan(pages.length, config.maxPages, deadlineMs)) {
      continue;
    }

    const links = parser.getLinks($, fetched.url)
      .filter((link) => isSameHost(link, startUrl))
      .filter((link) => !visited.has(normalizeQueueKey(link)) && !queued.has(normalizeQueueKey(link)))
      .sort((a, b) => rankLink(b, config.includeBlogAndProductPaths) - rankLink(a, config.includeBlogAndProductPaths));

    for (const link of links) {
      if (queue.length + pages.length >= config.maxPages * 4) break;
      const key = normalizeQueueKey(link);
      queued.add(key);
      queue.push(link);
    }

    if (onProgress) {
      await onProgress({ discoveredCount: visited.size + queue.length, scannedCount: pages.length });
    }
  }

  return {
    pages,
    discoveredCount: visited.size + queue.length,
    scannedCount: pages.length,
    summary: summarizeIssues(pages),
  };
}

function classifyPageType(urlString: string): PageType {
  let path = "/";
  try {
    path = new URL(urlString).pathname.toLowerCase();
  } catch {
    return "other";
  }

  if (path === "/" || path === "") return "home";
  if (CONTACT_PATH_PATTERNS.some((pattern) => pattern.test(path))) return "contact";
  if (/\/blog\b|\/news\b|\/articoli\b|\/notizie\b/.test(path)) return "blog_index";
  if (/\/collections?\//.test(path)) return "collection";
  if (/\/products?\//.test(path)) return "product";
  if (/\/services?\b|\/servizi\b/.test(path)) return "service";
  if (/\/about\b|\/chi-siamo\b/.test(path)) return "about";
  return "other";
}

function getTitleQuality(title: string): "good" | "short" | "long" | "missing" {
  if (!title) return "missing";
  if (title.length < 30) return "short";
  if (title.length > 60) return "long";
  return "good";
}

function buildPageIssues(input: {
  status: number;
  titleQuality: "good" | "short" | "long" | "missing";
  metaDescriptionPresent: boolean;
  h1Count: number;
  canonicalPresent: boolean;
  indexable: boolean;
  schemaPresent: boolean;
}): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];

  if (input.status >= 400) {
    issues.push({
      code: "http_error",
      severity: "high",
      message: `HTTP status ${input.status}`,
    });
  }

  if (input.titleQuality === "missing") {
    issues.push({ code: "title_missing", severity: "high", message: "Title tag assente" });
  } else if (input.titleQuality === "short") {
    issues.push({ code: "title_short", severity: "medium", message: "Title troppo corto" });
  } else if (input.titleQuality === "long") {
    issues.push({ code: "title_long", severity: "medium", message: "Title troppo lungo" });
  }

  if (!input.metaDescriptionPresent) {
    issues.push({
      code: "meta_missing",
      severity: "medium",
      message: "Meta description assente",
    });
  }

  if (input.h1Count === 0) {
    issues.push({ code: "h1_missing", severity: "high", message: "Nessun H1" });
  } else if (input.h1Count > 1) {
    issues.push({ code: "h1_multiple", severity: "low", message: "Più H1 rilevati" });
  }

  if (!input.canonicalPresent) {
    issues.push({ code: "canonical_missing", severity: "low", message: "Canonical assente" });
  }

  if (!input.indexable) {
    issues.push({ code: "noindex", severity: "high", message: "Pagina non indicizzabile" });
  }

  if (!input.schemaPresent) {
    issues.push({ code: "schema_missing", severity: "medium", message: "Schema JSON-LD assente" });
  }

  return issues;
}

function rankLink(urlString: string, includeBlogAndProductPaths: boolean): number {
  if (!includeBlogAndProductPaths) return 0;
  try {
    const path = new URL(urlString).pathname.toLowerCase();
    if (BLOG_OR_PRODUCT_PATH_PATTERNS.some((pattern) => pattern.test(path))) {
      return 100;
    }
  } catch {
    return 0;
  }
  return 0;
}

function issueCodeLabel(code: string): string {
  const labels: Record<string, string> = {
    http_error: "Pagine con errore HTTP",
    title_missing: "Title assente",
    title_short: "Title corto",
    title_long: "Title lungo",
    meta_missing: "Meta description assente",
    h1_missing: "H1 assente",
    h1_multiple: "H1 multipli",
    canonical_missing: "Canonical assente",
    noindex: "Noindex rilevato",
    schema_missing: "Schema JSON-LD assente",
  };
  return labels[code] ?? code;
}

function normalizeQueueKey(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    const path = parsed.pathname.endsWith("/") && parsed.pathname !== "/"
      ? parsed.pathname.slice(0, -1)
      : parsed.pathname;
    return `${parsed.origin}${path}`.toLowerCase();
  } catch {
    return urlString.toLowerCase();
  }
}

function isSameHost(urlString: string, baseUrl: string): boolean {
  try {
    return new URL(urlString).host === new URL(baseUrl).host;
  } catch {
    return false;
  }
}

function toJson(value: unknown): string | null {
  return value == null ? null : JSON.stringify(value);
}
