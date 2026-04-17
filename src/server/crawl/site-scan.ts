import { fetchPage, type FetchedPage } from "./fetcher";
import * as parser from "./parser";
import { detectCms, type CmsDetection } from "./detect/cms";
import { extractContactSignals, type ContactSignals } from "./detect/contact";
import { extractQualitySignals, type QualitySignals } from "./detect/quality";
import { extractSeoSignals, type SeoSignals } from "./detect/seo";

const MAX_PAGES = 5;

const CONTACT_PATH_PATTERNS = [
  "/contact",
  "/contatti",
  "/contattaci",
  "/chi-siamo",
  "/about",
  "/about-us",
];
const BLOG_PATH_PATTERNS = ["/blog", "/news", "/articoli", "/notizie"];

export interface ScanPageResult {
  url: string;
  pageType: "home" | "contact" | "about" | "blog_index" | "collection" | "product" | "other";
  httpStatus: number;
  title: string;
  metaDescription: string;
  h1: string;
  canonical: string;
  robotsMeta: string;
  structuredData: boolean;
  notes: Record<string, unknown>;
}

export interface SiteScanResult {
  domain: string;
  baseUrl: string;
  cms: CmsDetection;
  seo: SeoSignals;
  contact: ContactSignals;
  quality: QualitySignals;
  pages: ScanPageResult[];
  companyName: string | null;
  language: string | null;
}

export async function scanSite(domain: string): Promise<SiteScanResult | null> {
  const baseUrl = `https://${domain}`;
  const home = await fetchPage(baseUrl, { checkRobots: true });
  if (!home || !home.html) return null;

  const $ = parser.load(home.html);
  const pageLinks = parser.getLinks($, home.url);
  const homeResult = buildPageResult(home, $, "home");

  const cms = detectCms($, home.html, home.headers);

  // probe sitemap + robots.txt
  const [sitemapOk, robotsOk] = await Promise.all([
    probeUrl(`${baseUrl}/sitemap.xml`),
    probeUrl(`${baseUrl}/robots.txt`),
  ]);

  const seo = extractSeoSignals($, sitemapOk, robotsOk);
  const contact = extractContactSignals($, home.html, pageLinks);
  const quality = extractQualitySignals($, home.html, pageLinks);

  const pages: ScanPageResult[] = [homeResult];

  const toFetch = pickAdditionalPages(
    pageLinks,
    cms.cms === "shopify",
    MAX_PAGES - 1,
  );

  for (const { url, type } of toFetch) {
    if (pages.length >= MAX_PAGES) break;
    const page = await fetchPage(url, { checkRobots: true });
    if (!page || !page.html) continue;
    const p$ = parser.load(page.html);
    pages.push(buildPageResult(page, p$, type));

    // enrich contact signals from contact pages
    if (type === "contact") {
      const addEmails = parser.extractEmails(page.html);
      if (addEmails.length > 0 && !contact.publicEmail) {
        contact.publicEmail = addEmails[0];
      }
    }
  }

  const companyName = deriveCompanyName($, home.url);
  const language = detectLanguage($, home.html);

  return {
    domain,
    baseUrl: home.url,
    cms,
    seo,
    contact,
    quality,
    pages,
    companyName,
    language,
  };
}

function buildPageResult(
  page: FetchedPage,
  $: ReturnType<typeof parser.load>,
  pageType: ScanPageResult["pageType"],
): ScanPageResult {
  return {
    url: page.url,
    pageType,
    httpStatus: page.status,
    title: parser.getTitle($),
    metaDescription: parser.getMeta($, "description"),
    h1: parser.getH1s($)[0] ?? "",
    canonical: parser.getCanonical($),
    robotsMeta: parser.getRobotsMeta($),
    structuredData: parser.hasJsonLd($),
    notes: {},
  };
}

function pickAdditionalPages(
  links: string[],
  isShopify: boolean,
  max: number,
): Array<{ url: string; type: ScanPageResult["pageType"] }> {
  const picked: Array<{ url: string; type: ScanPageResult["pageType"] }> = [];
  const seen = new Set<string>();

  const tryAdd = (url: string, type: ScanPageResult["pageType"]) => {
    if (picked.length >= max) return;
    const key = new URL(url).pathname;
    if (seen.has(key)) return;
    seen.add(key);
    picked.push({ url, type });
  };

  // contact
  for (const link of links) {
    const path = new URL(link).pathname.toLowerCase();
    if (CONTACT_PATH_PATTERNS.some((p) => path === p || path.startsWith(p + "/"))) {
      tryAdd(link, "contact");
      break;
    }
  }

  // blog
  for (const link of links) {
    const path = new URL(link).pathname.toLowerCase();
    if (BLOG_PATH_PATTERNS.some((p) => path === p || path.startsWith(p + "/"))) {
      tryAdd(link, "blog_index");
      break;
    }
  }

  // Shopify collection pages (up to 2)
  if (isShopify) {
    let collCount = 0;
    for (const link of links) {
      if (collCount >= 2) break;
      const path = new URL(link).pathname.toLowerCase();
      if (/^\/collections\/[^/]+$/.test(path)) {
        tryAdd(link, "collection");
        collCount++;
      }
    }
  }

  return picked;
}

async function probeUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5_000),
      redirect: "follow",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function deriveCompanyName($: ReturnType<typeof parser.load>, pageUrl: string): string | null {
  // og:site_name first, then title tag domain portion
  const og = $('meta[property="og:site_name"]').attr("content");
  if (og?.trim()) return og.trim();
  const title = parser.getTitle($);
  if (title) {
    const parts = title.split(/[|–—\-]/);
    return parts[parts.length - 1].trim() || parts[0].trim();
  }
  try {
    return new URL(pageUrl).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function detectLanguage($: ReturnType<typeof parser.load>, html: string): string | null {
  const htmlLang = $("html").attr("lang");
  if (htmlLang) return htmlLang.split("-")[0].toLowerCase();
  const ogLocale = $('meta[property="og:locale"]').attr("content");
  if (ogLocale) return ogLocale.split("_")[0].toLowerCase();
  // rough heuristic: Italian word frequency
  const itWords = (html.match(/\b(il|la|le|di|per|che|con|una|non|del|della)\b/gi) ?? []).length;
  const enWords = (html.match(/\b(the|and|for|with|that|this|from|you|are|have)\b/gi) ?? []).length;
  if (itWords > enWords * 1.5) return "it";
  if (enWords > itWords * 1.5) return "en";
  return null;
}
