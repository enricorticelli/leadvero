import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as parser from "@/server/crawl/parser";
import { extractSeoSignals } from "@/server/crawl/detect/seo";

const FIXTURES = join(__dirname, "../../fixtures");
function fixture(name: string) {
  return readFileSync(join(FIXTURES, name), "utf8");
}

describe("extractSeoSignals", () => {
  it("returns good quality for a proper title in range 30-60", () => {
    const html = fixture("shopify.html");
    const $ = parser.load(html);
    const seo = extractSeoSignals($, true, true);
    expect(seo.titleQuality).toBe("good");
    expect(seo.metaDescriptionPresent).toBe(true);
    expect(seo.h1Count).toBe(1);
    expect(seo.canonicalPresent).toBe(true);
    expect(seo.indexable).toBe(true);
    expect(seo.sitemapPresent).toBe(true);
  });

  it("flags missing title + meta + H1", () => {
    const html = fixture("noseo.html");
    const $ = parser.load(html);
    const seo = extractSeoSignals($, false, false);
    expect(seo.titleQuality).toBe("missing");
    expect(seo.metaDescriptionPresent).toBe(false);
    expect(seo.h1Count).toBe(0);
    expect(seo.schemaPresent).toBe(false);
    expect(seo.sitemapPresent).toBe(false);
  });

  it("detects noindex from robots meta", () => {
    const html = `<html><head><meta name="robots" content="noindex,nofollow"></head></html>`;
    const $ = parser.load(html);
    expect(extractSeoSignals($, false, false).indexable).toBe(false);
  });
});
