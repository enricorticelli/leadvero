import type { CmsDetection } from "../crawl/detect/cms";

type TargetPlatform = "shopify" | "wordpress" | "both" | "any";

export interface FitInput {
  targetPlatform: TargetPlatform;
  cms: CmsDetection;
  country?: string | null;
  language?: string | null;
  jobCountry: string;
  jobLanguage: string;
}

export function scoreFit(input: FitInput): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const { cms, targetPlatform } = input;
  const detectedCms = cms.cms;

  if (targetPlatform === "shopify") {
    if (detectedCms === "shopify") { score += 60; reasons.push("Shopify rilevato — target perfetto"); }
    else if (detectedCms === "woocommerce") { score += 25; reasons.push("WooCommerce rilevato — possibile migrazione Shopify"); }
    else if (detectedCms === null) { score += 10; }
  } else if (targetPlatform === "wordpress") {
    if (detectedCms === "wordpress" || detectedCms === "woocommerce") { score += 60; reasons.push("WordPress rilevato — target perfetto"); }
    else if (detectedCms === null) { score += 10; }
  } else if (targetPlatform === "both") {
    if (detectedCms === "shopify" || detectedCms === "wordpress" || detectedCms === "woocommerce") {
      score += 60;
      reasons.push(`${detectedCms} rilevato`);
    } else {
      score += 10;
    }
  } else {
    // "any" — any cms is fine
    if (detectedCms) { score += 30; reasons.push(`CMS rilevato: ${detectedCms}`); }
    else { score += 15; }
  }

  // language match
  if (input.language && input.jobLanguage && input.language === input.jobLanguage) {
    score += 25;
    reasons.push("Lingua corrispondente");
  } else if (input.language && input.jobLanguage && input.language !== input.jobLanguage) {
    score -= 10;
  }

  // country match
  if (input.country && input.jobCountry) {
    const siteCountry = input.country.toUpperCase();
    const targetCountry = input.jobCountry.toUpperCase();
    if (siteCountry === targetCountry) {
      score += 15;
    }
  }

  return { score: clamp(score), reasons: reasons.slice(0, 3) };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}
