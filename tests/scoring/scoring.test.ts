import { describe, expect, it } from "vitest";
import { score } from "@/server/scoring";
import { scoreFit } from "@/server/scoring/fit";
import { scoreOpportunity } from "@/server/scoring/opportunity";
import { scoreContactability } from "@/server/scoring/contactability";

const baseCms = { cms: "shopify" as const, ecommercePlatform: "shopify" as const };
const baseContact = {
  publicEmail: "info@example.it",
  publicPhone: "02 1234567",
  hasForm: true,
  socialLinks: { instagram: "https://instagram.com/x" },
  hasContactPage: true,
};
const baseSeo = {
  title: "Negozio Moda Online Donna Milano",
  titleLength: 36,
  titleQuality: "good" as const,
  metaDescription: "Acquista abiti...",
  metaDescriptionPresent: true,
  h1Count: 1,
  h1First: "Benvenuto",
  canonical: "https://example.it/",
  canonicalPresent: true,
  robotsMeta: "",
  indexable: true,
  schemaPresent: true,
  sitemapPresent: true,
  robotsTxtPresent: true,
};
const baseQuality = {
  analyticsPresent: true,
  tagManagerPresent: true,
  hasBlog: false,
  likelySiteDated: false,
  copyrightYear: 2024,
  hasProductsOrCollections: true,
};

describe("scoreFit", () => {
  it("gives high fit for correct CMS + language match", () => {
    const { score } = scoreFit({
      targetPlatform: "shopify",
      cms: baseCms,
      language: "it",
      country: "IT",
      jobCountry: "IT",
      jobLanguage: "it",
    });
    expect(score).toBeGreaterThan(80);
  });

  it("penalises wrong CMS (shopify target, WP detected)", () => {
    const { score } = scoreFit({
      targetPlatform: "shopify",
      cms: { cms: "wordpress", ecommercePlatform: null },
      language: "it",
      country: "IT",
      jobCountry: "IT",
      jobLanguage: "it",
    });
    expect(score).toBeLessThan(50);
  });

  it("targetPlatform=any accepts all CMS", () => {
    const { score } = scoreFit({
      targetPlatform: "any",
      cms: { cms: "other", ecommercePlatform: null },
      language: "it",
      country: "IT",
      jobCountry: "IT",
      jobLanguage: "it",
    });
    expect(score).toBeGreaterThan(20);
  });
});

describe("scoreOpportunity", () => {
  it("gives max opportunity for missing everything", () => {
    const { score } = scoreOpportunity({
      seo: { ...baseSeo, titleQuality: "missing", metaDescriptionPresent: false, h1Count: 0, schemaPresent: false, sitemapPresent: false },
      quality: { ...baseQuality, analyticsPresent: false, tagManagerPresent: false, hasBlog: false, likelySiteDated: true },
    });
    expect(score).toBeGreaterThan(70);
  });

  it("gives low opportunity for well-optimised site", () => {
    const { score } = scoreOpportunity({
      seo: baseSeo,
      quality: { ...baseQuality, likelySiteDated: false, hasBlog: true },
    });
    expect(score).toBeLessThan(30);
  });
});

describe("scoreContactability", () => {
  it("maxes out when email + contact page + form + phone + socials", () => {
    const { score } = scoreContactability(baseContact);
    expect(score).toBe(100);
  });

  it("returns 0 with no signals", () => {
    const { score } = scoreContactability({
      publicEmail: null,
      publicPhone: null,
      hasForm: false,
      socialLinks: {},
      hasContactPage: false,
    });
    expect(score).toBe(0);
  });
});

describe("score (aggregate)", () => {
  it("produces a totalScore between 0 and 100", () => {
    const result = score({
      fit: { targetPlatform: "shopify", cms: baseCms, language: "it", country: "IT", jobCountry: "IT", jobLanguage: "it" },
      opportunity: { seo: baseSeo, quality: baseQuality },
      commercial: { quality: baseQuality, cms: baseCms, pagesScannedCount: 4, companyName: "Moda Esempio" },
      contact: baseContact,
    });
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(result.scoreReasons.length).toBeGreaterThan(0);
  });
});
