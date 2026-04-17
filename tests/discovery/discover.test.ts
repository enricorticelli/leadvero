import { describe, expect, it, vi } from "vitest";
import { discover } from "@/server/discovery";

describe("discover", () => {
  it("de-duplicates across queries and respects maxResults", async () => {
    const search = vi
      .fn()
      .mockResolvedValueOnce([
        { title: "A", url: "https://www.a.it/" },
        { title: "B", url: "https://b.it/" },
        { title: "FB", url: "https://facebook.com/page" },
      ])
      .mockResolvedValueOnce([
        { title: "A2", url: "https://a.it/about" },
        { title: "C", url: "https://c.it/" },
      ])
      .mockResolvedValue([]);

    const out = await discover(
      {
        country: "IT",
        language: "it",
        city: "Milano",
        niche: "gelato",
        targetPlatform: "both",
        keyword: null,
        businessType: null,
        maxResults: 10,
      },
      { search },
    );

    const domains = out.map((c) => c.normalizedDomain);
    expect(new Set(domains).size).toBe(domains.length);
    expect(domains).toContain("a.it");
    expect(domains).toContain("b.it");
    expect(domains).toContain("c.it");
    expect(domains).not.toContain("facebook.com");
  });

  it("skips existing domains passed in", async () => {
    const search = vi.fn().mockResolvedValue([
      { title: "A", url: "https://a.it/" },
      { title: "B", url: "https://b.it/" },
    ]);

    const out = await discover(
      {
        country: "IT",
        language: "it",
        city: "Roma",
        niche: "pizza",
        targetPlatform: "any",
        keyword: null,
        businessType: null,
        maxResults: 10,
      },
      { search, existingDomains: new Set(["a.it"]) },
    );

    expect(out.map((c) => c.normalizedDomain)).not.toContain("a.it");
  });
});
