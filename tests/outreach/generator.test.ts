import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGenerate = vi.fn();

vi.mock("@/server/outreach/claude", () => ({
  generateOutreach: mockGenerate,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    lead: {
      findUnique: vi.fn().mockResolvedValue({
        id: "lead-1",
        companyName: "Test Shop",
        domain: "testshop.it",
        cms: "shopify",
        language: "it",
        country: "IT",
        niche: "abbigliamento",
        totalScore: 72,
        scoreReasons: ["Shopify rilevato", "Meta description assente"],
        seoSignals: { titleQuality: "good", metaDescriptionPresent: false },
        siteQualityNotes: { likelySiteDated: false },
        hasBlog: false,
        analyticsPresent: false,
        tagManagerPresent: false,
        hasContactPage: true,
        hasForm: false,
        publicEmail: "info@testshop.it",
        scans: [],
      }),
    },
    outreachDraft: {
      create: vi.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: "draft-1", ...args.data }),
      ),
    },
  },
}));

vi.mock("@/server/env", () => ({
  env: () => ({ ANTHROPIC_MODEL: "claude-sonnet-4-6" }),
  requireAnthropic: () => "test-key",
}));

describe("generateOutreachForLead", () => {
  beforeEach(() => {
    mockGenerate.mockResolvedValue({
      hook: "Ho notato che le pagine del vostro store non hanno meta description.",
      miniAudit: "• Meta description assente\n• Nessun blog",
      suggestedOffer: "SEO audit Shopify + ottimizzazione metadata",
      emailDraft: "Gentili,\n\nHo analizzato il vostro store...\n\nCordiali saluti",
      linkedinDraft: "Ciao! Ho notato alcune opportunità SEO sul vostro store.",
    });
  });

  it("calls generateOutreach and persists result", async () => {
    const { generateOutreachForLead } = await import(
      "@/server/outreach/generator"
    );
    const draft = await generateOutreachForLead("lead-1");
    expect(draft).toMatchObject({ hook: expect.any(String), emailDraft: expect.any(String) });
    expect(mockGenerate).toHaveBeenCalledOnce();
  });

  it("throws when draft fails validation", async () => {
    mockGenerate.mockResolvedValueOnce({ hook: "", miniAudit: "" });
    const { generateOutreachForLead } = await import(
      "@/server/outreach/generator"
    );
    await expect(generateOutreachForLead("lead-1")).rejects.toThrow();
  });
});
