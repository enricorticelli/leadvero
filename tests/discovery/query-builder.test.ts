import { describe, expect, it } from "vitest";
import { buildQueries } from "@/server/discovery/query-builder";

const base = {
  country: "IT",
  language: "it",
  city: "Milano",
  niche: "abbigliamento donna",
  keyword: null,
  businessType: null,
};

describe("buildQueries", () => {
  it("returns empty when no keyword/niche/city provided", () => {
    expect(
      buildQueries({
        country: "IT",
        language: "it",
        targetPlatform: "any",
        keyword: null,
        niche: null,
        city: null,
        businessType: null,
      }),
    ).toEqual([]);
  });

  it("emits shopify-specific queries when target=shopify", () => {
    const q = buildQueries({ ...base, targetPlatform: "shopify" });
    expect(q.every((x) => x.intent === "shopify")).toBe(true);
    expect(q.some((x) => x.q.includes("powered by shopify"))).toBe(true);
    expect(q.some((x) => x.q.includes("inurl:/collections/"))).toBe(true);
  });

  it("emits wordpress-specific queries when target=wordpress", () => {
    const q = buildQueries({ ...base, targetPlatform: "wordpress" });
    expect(q.every((x) => x.intent === "wordpress")).toBe(true);
    expect(q.some((x) => x.q.includes("powered by wordpress"))).toBe(true);
  });

  it("emits both shopify and wordpress queries when target=both", () => {
    const q = buildQueries({ ...base, targetPlatform: "both" });
    const intents = new Set(q.map((x) => x.intent));
    expect(intents.has("shopify")).toBe(true);
    expect(intents.has("wordpress")).toBe(true);
  });

  it("includes generic query only when target=any", () => {
    const any = buildQueries({ ...base, targetPlatform: "any" });
    expect(any.some((x) => x.intent === "generic")).toBe(true);
    const shopify = buildQueries({ ...base, targetPlatform: "shopify" });
    expect(shopify.some((x) => x.intent === "generic")).toBe(false);
  });

  it("trims and joins keyword + niche + city", () => {
    const q = buildQueries({
      ...base,
      keyword: "scarpe",
      niche: "running",
      city: "Roma",
      targetPlatform: "any",
    });
    const generic = q.find((x) => x.intent === "generic")!;
    expect(generic.q).toBe("scarpe running Roma");
  });
});
