import { describe, expect, it, vi } from "vitest";
import {
  resolveAnalysisConfig,
  shouldStopScan,
  summarizeIssues,
  type DeepAnalysisPageSnapshot,
} from "@/server/jobs/lead-analysis";

describe("resolveAnalysisConfig", () => {
  it("maps preset defaults", () => {
    const light = resolveAnalysisConfig("light");
    const standard = resolveAnalysisConfig("standard");
    const deep = resolveAnalysisConfig("deep");

    expect(light.maxPages).toBe(10);
    expect(standard.maxPages).toBe(25);
    expect(deep.maxPages).toBe(50);
  });

  it("applies advanced overrides", () => {
    const config = resolveAnalysisConfig("standard", {
      maxPages: 40,
      runTimeoutMs: 90_000,
      includeBlogAndProductPaths: false,
    });

    expect(config).toEqual({
      maxPages: 40,
      runTimeoutMs: 90_000,
      includeBlogAndProductPaths: false,
    });
  });
});

describe("shouldStopScan", () => {
  it("stops when page limit is reached", () => {
    const deadline = Date.now() + 1000;
    expect(shouldStopScan(10, 10, deadline)).toBe(true);
    expect(shouldStopScan(9, 10, deadline)).toBe(false);
  });

  it("stops when deadline is exceeded", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-19T10:00:00.000Z"));

    expect(shouldStopScan(1, 10, Date.now() - 1)).toBe(true);
    expect(shouldStopScan(1, 10, Date.now() + 1_000)).toBe(false);

    vi.useRealTimers();
  });
});

describe("summarizeIssues", () => {
  it("builds severity counts and top findings", () => {
    const pages: DeepAnalysisPageSnapshot[] = [
      {
        scannedUrl: "https://example.it/",
        pageType: "home",
        httpStatus: 200,
        title: "Home",
        metaDescription: "",
        h1: "",
        canonical: "",
        robotsMeta: "",
        schemaPresent: false,
        indexable: true,
        titleQuality: "short",
        issues: [
          { code: "meta_missing", severity: "medium", message: "Meta assente" },
          { code: "h1_missing", severity: "high", message: "H1 assente" },
        ],
        notes: {},
      },
      {
        scannedUrl: "https://example.it/blog",
        pageType: "blog_index",
        httpStatus: 200,
        title: "Blog",
        metaDescription: "desc",
        h1: "Blog",
        canonical: "https://example.it/blog",
        robotsMeta: "",
        schemaPresent: false,
        indexable: true,
        titleQuality: "good",
        issues: [
          { code: "schema_missing", severity: "medium", message: "Schema assente" },
          { code: "meta_missing", severity: "medium", message: "Meta assente" },
        ],
        notes: {},
      },
    ];

    const summary = summarizeIssues(pages);
    expect(summary.pagesScanned).toBe(2);
    expect(summary.issueCounts).toEqual({
      high: 1,
      medium: 3,
      low: 0,
      total: 4,
    });
    expect(summary.issuesByCode.meta_missing).toBe(2);
    expect(summary.topFindings[0]).toContain("(2)");
  });
});
