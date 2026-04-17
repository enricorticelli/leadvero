import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as parser from "@/server/crawl/parser";
import { detectCms } from "@/server/crawl/detect/cms";

const FIXTURES = join(__dirname, "../../fixtures");
function fixture(name: string) {
  return readFileSync(join(FIXTURES, name), "utf8");
}

describe("detectCms", () => {
  it("detects Shopify from CDN script", () => {
    const html = fixture("shopify.html");
    const $ = parser.load(html);
    const result = detectCms($, html, {});
    expect(result.cms).toBe("shopify");
    expect(result.ecommercePlatform).toBe("shopify");
  });

  it("detects Shopify from X-ShopId header", () => {
    const $ = parser.load("<html></html>");
    const result = detectCms($, "", { "x-shopid": "123" });
    expect(result.cms).toBe("shopify");
  });

  it("detects WordPress from generator meta", () => {
    const html = fixture("wordpress.html");
    const $ = parser.load(html);
    const result = detectCms($, html, {});
    expect(result.cms).toBe("wordpress");
    expect(result.ecommercePlatform).toBeNull();
  });

  it("detects WooCommerce when WP + woocommerce patterns", () => {
    const html = `<html><head><meta name="generator" content="WordPress"></head>
      <body class="woocommerce-page"><div class="wc-cart"></div></body></html>`;
    const $ = parser.load(html);
    expect(detectCms($, html, {}).cms).toBe("woocommerce");
  });

  it("returns null for unknown CMS", () => {
    const html = "<html><body>Hello</body></html>";
    const $ = parser.load(html);
    expect(detectCms($, html, {}).cms).toBeNull();
  });
});
