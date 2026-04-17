import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as parser from "@/server/crawl/parser";
import { extractQualitySignals } from "@/server/crawl/detect/quality";

const FIXTURES = join(__dirname, "../../fixtures");
function fixture(name: string) {
  return readFileSync(join(FIXTURES, name), "utf8");
}

describe("extractQualitySignals", () => {
  it("detects analytics and blog from shopify fixture", () => {
    const html = fixture("shopify.html");
    const $ = parser.load(html);
    const links = [
      "https://moda-esempio.com/collections/donna",
      "https://moda-esempio.com/blogs/news",
    ];
    const q = extractQualitySignals($, html, links);
    expect(q.hasBlog).toBe(true);
    expect(q.hasProductsOrCollections).toBe(true);
  });

  it("flags dated site: old copyright year", () => {
    const html = fixture("wordpress.html");
    const $ = parser.load(html);
    const q = extractQualitySignals($, html, []);
    expect(q.likelySiteDated).toBe(true);
    expect(q.copyrightYear).toBe(2021);
  });

  it("flags dated site: old jquery version", () => {
    const html = `<html><body><!-- jquery-1.12.4.min.js --></body></html>`;
    const $ = parser.load(html);
    const q = extractQualitySignals($, html, []);
    expect(q.likelySiteDated).toBe(true);
  });

  it("detects Google Analytics", () => {
    const html = `<html><head><script>gtag('config','G-XXXXXXX')</script></head></html>`;
    const $ = parser.load(html);
    const q = extractQualitySignals($, html, []);
    expect(q.analyticsPresent).toBe(true);
  });

  it("detects Google Tag Manager", () => {
    const html = `<html><head><script>GTM-ABCDE</script></head></html>`;
    const $ = parser.load(html);
    const q = extractQualitySignals($, html, []);
    expect(q.tagManagerPresent).toBe(true);
  });
});
