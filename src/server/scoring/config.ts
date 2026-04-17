export const SCORE_WEIGHTS = {
  fit: 0.30,
  opportunity: 0.35,
  commercial: 0.20,
  contactability: 0.15,
} as const;

export const OPPORTUNITY_WEIGHTS = {
  titleMissing: 15,
  titlePoor: 8,
  noMetaDescription: 10,
  noH1: 10,
  noSchema: 8,
  noAnalytics: 7,
  noTagManager: 4,
  blogAbsent: 8,
  sitemapMissing: 5,
  siteDated: 15,
} as const;

export const CONTACTABILITY_POINTS = {
  publicEmail: 35,
  contactPage: 25,
  form: 20,
  publicPhone: 12,
  socials: 8,
} as const;

export const COMMERCIAL_WEIGHTS = {
  hasProductsOrCollections: 20,
  hasBlog: 10,
  hasSocials: 15,
  hasAnalytics: 15,
  multiplePagesScanned: 15,
  cmsDetected: 10,
  brandLikeTitle: 15,
} as const;
