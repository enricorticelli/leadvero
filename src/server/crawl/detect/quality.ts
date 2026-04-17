import type { Cheerio$ } from "../parser";

export interface QualitySignals {
  analyticsPresent: boolean;
  tagManagerPresent: boolean;
  hasBlog: boolean;
  likelySiteDated: boolean;
  copyrightYear: number | null;
  hasProductsOrCollections: boolean;
}

const BLOG_PATH_PATTERNS = [/\/blog\b/, /\/news\b/, /\/articoli\b/, /\/notizie\b/];
const PRODUCT_PATH_PATTERNS = [/\/products?\//, /\/collections?\//, /\/shop\b/, /\/catalogo\b/];

export function extractQualitySignals(
  $: Cheerio$,
  html: string,
  pageLinks: string[],
): QualitySignals {
  const analyticsPresent =
    /google-analytics\.com|gtag|ga\.js|analytics\.js/.test(html) ||
    /plausible\.io|fathom\.script|umami\.is/.test(html);

  const tagManagerPresent =
    /googletagmanager\.com|GTM-[A-Z0-9]+/.test(html);

  const hasBlog = pageLinks.some((l) =>
    BLOG_PATH_PATTERNS.some((p) => p.test(new URL(l).pathname)),
  );

  const hasProductsOrCollections = pageLinks.some((l) =>
    PRODUCT_PATH_PATTERNS.some((p) => p.test(new URL(l).pathname)),
  );

  const currentYear = new Date().getFullYear();
  const yearMatch = html.match(/(?:©|&copy;|copyright)\s*(\d{4})/i);
  const copyrightYear = yearMatch ? parseInt(yearMatch[1], 10) : null;
  const likelySiteDated =
    (copyrightYear !== null && copyrightYear < currentYear - 2) ||
    /jquery[.-][12]\.[0-9]/.test(html) ||
    $("table[width]").length > 3 ||
    $("font[face]").length > 0;

  return {
    analyticsPresent,
    tagManagerPresent,
    hasBlog,
    likelySiteDated,
    copyrightYear,
    hasProductsOrCollections,
  };
}
