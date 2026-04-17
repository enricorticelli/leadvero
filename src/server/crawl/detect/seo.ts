import type { Cheerio$ } from "../parser";
import {
  getCanonical,
  getH1s,
  getMeta,
  getRobotsMeta,
  getTitle,
  hasJsonLd,
} from "../parser";

export interface SeoSignals {
  title: string;
  titleLength: number;
  titleQuality: "good" | "short" | "long" | "missing";
  metaDescription: string;
  metaDescriptionPresent: boolean;
  h1Count: number;
  h1First: string;
  canonical: string;
  canonicalPresent: boolean;
  robotsMeta: string;
  indexable: boolean;
  schemaPresent: boolean;
  sitemapPresent: boolean;
  robotsTxtPresent: boolean;
}

export function extractSeoSignals(
  $: Cheerio$,
  sitemapOk: boolean,
  robotsTxtOk: boolean,
): SeoSignals {
  const title = getTitle($);
  const titleLength = title.length;
  let titleQuality: SeoSignals["titleQuality"];
  if (!title) titleQuality = "missing";
  else if (titleLength < 30) titleQuality = "short";
  else if (titleLength > 60) titleQuality = "long";
  else titleQuality = "good";

  const metaDescription = getMeta($, "description");
  const robotsMeta = getRobotsMeta($).toLowerCase();
  const noindex = /noindex/.test(robotsMeta);

  const h1s = getH1s($);

  return {
    title,
    titleLength,
    titleQuality,
    metaDescription,
    metaDescriptionPresent: metaDescription.length > 0,
    h1Count: h1s.length,
    h1First: h1s[0] ?? "",
    canonical: getCanonical($),
    canonicalPresent: Boolean(getCanonical($)),
    robotsMeta,
    indexable: !noindex,
    schemaPresent: hasJsonLd($),
    sitemapPresent: sitemapOk,
    robotsTxtPresent: robotsTxtOk,
  };
}
