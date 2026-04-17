import type { Cheerio$ } from "../parser";
import { getGeneratorMeta } from "../parser";

export type CmsDetection = {
  cms: "shopify" | "wordpress" | "woocommerce" | "other" | null;
  ecommercePlatform: "shopify" | "woocommerce" | null;
};

const WP_PATTERNS = [
  /wp-content\//,
  /wp-includes\//,
  /wp-json\//,
  /xmlrpc\.php/,
];

const SHOPIFY_PATTERNS = [
  /cdn\.shopify\.com/,
  /shopify\.com\/s\//,
  /window\.Shopify\s*=/,
  /shopify-payment-button/,
];

export function detectCms(
  $: Cheerio$,
  html: string,
  headers: Record<string, string>,
): CmsDetection {
  const isShopify =
    Boolean(headers["x-shopid"]) ||
    SHOPIFY_PATTERNS.some((p) => p.test(html));

  if (isShopify) {
    return { cms: "shopify", ecommercePlatform: "shopify" };
  }

  const generator = getGeneratorMeta($).toLowerCase();
  const isWp =
    generator.includes("wordpress") ||
    WP_PATTERNS.some((p) => p.test(html));

  if (isWp) {
    const isWoo = /woocommerce|wc-(?:cart|checkout|ajax)/.test(html);
    return {
      cms: isWoo ? "woocommerce" : "wordpress",
      ecommercePlatform: isWoo ? "woocommerce" : null,
    };
  }

  return { cms: null, ecommercePlatform: null };
}
