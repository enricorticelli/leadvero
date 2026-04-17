import type { SeoSignals } from "../crawl/detect/seo";
import type { QualitySignals } from "../crawl/detect/quality";
import { OPPORTUNITY_WEIGHTS as W } from "./config";

export interface OpportunityInput {
  seo: SeoSignals;
  quality: QualitySignals;
}

export function scoreOpportunity(input: OpportunityInput): { score: number; reasons: string[] } {
  let raw = 0;
  const reasons: string[] = [];

  const { seo, quality } = input;

  if (seo.titleQuality === "missing") { raw += W.titleMissing; reasons.push("Nessun title tag"); }
  else if (seo.titleQuality === "short" || seo.titleQuality === "long") { raw += W.titlePoor; reasons.push("Title tag poco ottimizzato"); }

  if (!seo.metaDescriptionPresent) { raw += W.noMetaDescription; reasons.push("Meta description assente"); }
  if (seo.h1Count === 0) { raw += W.noH1; reasons.push("H1 assente"); }
  if (!seo.schemaPresent) { raw += W.noSchema; reasons.push("Nessun markup schema"); }
  if (!quality.analyticsPresent) { raw += W.noAnalytics; reasons.push("Analytics non rilevato"); }
  if (!quality.tagManagerPresent) { raw += W.noTagManager; }
  if (!quality.hasBlog) { raw += W.blogAbsent; reasons.push("Nessun blog/content"); }
  if (!seo.sitemapPresent) { raw += W.sitemapMissing; }
  if (quality.likelySiteDated) { raw += W.siteDated; reasons.push("Sito probabilmente datato"); }

  const maxRaw = Object.values(W).reduce((a, b) => a + b, 0);
  const score = Math.round((raw / maxRaw) * 100);

  return { score: Math.min(100, score), reasons: reasons.slice(0, 4) };
}
