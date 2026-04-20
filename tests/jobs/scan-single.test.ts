import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  searchJob: {
    upsert: vi.fn(),
  },
  lead: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  scanResult: {
    createMany: vi.fn(),
  },
};

vi.mock("@/server/db/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/server/discovery/normalize", () => ({
  normalizeUrl: vi.fn(() => ({
    domain: "example.com",
    normalizedDomain: "example.com",
    sourceUrl: "https://example.com",
  })),
}));

vi.mock("@/server/crawl/site-scan", () => ({
  scanSite: vi.fn(async () => ({
    domain: "example.com",
    baseUrl: "https://example.com",
    cms: { cms: "wordpress", ecommercePlatform: null },
    seo: {
      hasTitle: true,
      hasMetaDescription: true,
      hasH1: true,
      hasCanonical: true,
      hasRobotsMeta: true,
      hasSchemaOrg: true,
      hasSitemap: true,
      hasRobotsTxt: true,
    },
    contact: {
      publicEmail: "hello@example.com",
      publicPhone: null,
      hasContactPage: true,
      hasForm: true,
      socialLinks: {},
    },
    quality: {
      likelySiteDated: false,
      copyrightYear: 2026,
      hasBlog: true,
      analyticsPresent: true,
      tagManagerPresent: true,
    },
    pages: [
      {
        url: "https://example.com",
        pageType: "home",
        httpStatus: 200,
        title: "Home",
        metaDescription: "Desc",
        h1: "H1",
        canonical: "https://example.com",
        robotsMeta: "index,follow",
        structuredData: true,
        notes: {},
      },
    ],
    companyName: "Example",
    language: "it",
  })),
}));

vi.mock("@/server/scoring", () => ({
  score: vi.fn(() => ({
    fitScore: 70,
    opportunityScore: 60,
    commercialScore: 50,
    contactabilityScore: 40,
    totalScore: 58,
    scoreReasons: ["reason"],
  })),
}));

describe("scanSingleUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.searchJob.upsert.mockResolvedValue({ id: "__manual__" });
    prismaMock.lead.findUnique.mockResolvedValue(null);
    prismaMock.lead.upsert.mockResolvedValue({ id: "lead_1" });
    prismaMock.scanResult.createMany.mockResolvedValue({ count: 1 });
  });

  it("persists scanned pages without skipDuplicates for SQLite compatibility", async () => {
    const { scanSingleUrl } = await import("@/server/jobs/scan-single");

    const result = await scanSingleUrl("example.com");

    expect(result.ok).toBe(true);
    expect(prismaMock.scanResult.createMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.scanResult.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(Array),
      }),
    );

    const args = prismaMock.scanResult.createMany.mock.calls[0]?.[0] as {
      skipDuplicates?: unknown;
    };
    expect(args.skipDuplicates).toBeUndefined();
  });
});
