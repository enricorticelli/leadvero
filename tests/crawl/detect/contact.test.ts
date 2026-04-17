import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as parser from "@/server/crawl/parser";
import { extractContactSignals } from "@/server/crawl/detect/contact";

const FIXTURES = join(__dirname, "../../fixtures");
function fixture(name: string) {
  return readFileSync(join(FIXTURES, name), "utf8");
}

describe("extractContactSignals", () => {
  it("extracts email, phone, social from shopify fixture", () => {
    const html = fixture("shopify.html");
    const $ = parser.load(html);
    const result = extractContactSignals($, html, [
      "https://moda-esempio.com/collections/donna",
    ]);
    expect(result.publicEmail).toBe("info@moda-esempio.com");
    expect(result.publicPhone).toBeTruthy();
    expect(result.socialLinks).toHaveProperty("instagram");
    expect(result.hasContactPage).toBe(false); // no contact link in the page links provided
  });

  it("detects form presence from wordpress fixture", () => {
    const html = fixture("wordpress.html");
    const $ = parser.load(html);
    const result = extractContactSignals($, html, []);
    expect(result.hasForm).toBe(true);
    expect(result.publicEmail).toBe("avvocato@studio-legale.it");
    expect(result.socialLinks).toHaveProperty("linkedin");
  });

  it("detects contact page link", () => {
    const html = "<html><body></body></html>";
    const $ = parser.load(html);
    const result = extractContactSignals($, html, [
      "https://example.it/contatti",
    ]);
    expect(result.hasContactPage).toBe(true);
  });

  it("ignores noreply emails", () => {
    const html = "Contact: noreply@example.com";
    const $ = parser.load(html);
    const result = extractContactSignals($, html, []);
    expect(result.publicEmail).toBeNull();
  });
});
