import type { QualitySignals } from "../crawl/detect/quality";
import type { CmsDetection } from "../crawl/detect/cms";
import { COMMERCIAL_WEIGHTS as W } from "./config";

export interface CommercialInput {
  quality: QualitySignals;
  cms: CmsDetection;
  pagesScannedCount: number;
  companyName: string | null;
}

export function scoreCommercial(input: CommercialInput): { score: number; reasons: string[] } {
  let raw = 0;
  const reasons: string[] = [];

  if (input.quality.hasProductsOrCollections) { raw += W.hasProductsOrCollections; reasons.push("Catalogo prodotti rilevato"); }
  if (input.quality.hasBlog) { raw += W.hasBlog; reasons.push("Blog presente"); }
  if (Object.keys(input.quality).length > 0 && input.quality.analyticsPresent) { raw += W.hasAnalytics; }

  if (input.quality.analyticsPresent || input.quality.tagManagerPresent) {
    raw += W.hasSocials / 2;
  }

  if (input.pagesScannedCount >= 3) { raw += W.multiplePagesScanned; reasons.push("Sito con più pagine indicizzabili"); }

  if (input.cms.cms !== null) { raw += W.cmsDetected; }

  const hasName = Boolean(
    input.companyName && input.companyName.length > 2 && !/^\d/.test(input.companyName),
  );
  if (hasName) { raw += W.brandLikeTitle; reasons.push("Brand identificabile"); }

  const maxRaw = Object.values(W).reduce((a, b) => a + b, 0);
  const score = Math.round((raw / maxRaw) * 100);

  return { score: Math.min(100, score), reasons: reasons.slice(0, 3) };
}
