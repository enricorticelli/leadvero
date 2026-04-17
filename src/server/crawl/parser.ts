import * as cheerio from "cheerio";

export type Cheerio$ = ReturnType<typeof cheerio.load>;

export function load(html: string): Cheerio$ {
  return cheerio.load(html);
}

export function getTitle($: Cheerio$): string {
  return $("head title").first().text().trim();
}

export function getMeta($: Cheerio$, name: string): string {
  return (
    $(`meta[name="${name}"]`).attr("content") ??
    $(`meta[property="${name}"]`).attr("content") ??
    ""
  ).trim();
}

export function getH1s($: Cheerio$): string[] {
  return $("h1")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
}

export function getCanonical($: Cheerio$): string {
  return ($('link[rel="canonical"]').attr("href") ?? "").trim();
}

export function getRobotsMeta($: Cheerio$): string {
  return (
    $('meta[name="robots"]').attr("content") ??
    $('meta[name="googlebot"]').attr("content") ??
    ""
  ).trim();
}

export function hasJsonLd($: Cheerio$): boolean {
  return $('script[type="application/ld+json"]').length > 0;
}

export function getGeneratorMeta($: Cheerio$): string {
  return ($('meta[name="generator"]').attr("content") ?? "").trim();
}

export function extractEmails(html: string): string[] {
  const raw = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) ?? [];
  return [
    ...new Set(
      raw
        .map((e) => e.toLowerCase())
        .filter((e) => !e.match(/^(noreply|no-reply|donotreply|mailer-daemon)/))
        .filter((e) => !e.endsWith(".png") && !e.endsWith(".jpg")),
    ),
  ].slice(0, 5);
}

export function extractPhones(html: string): string[] {
  const raw =
    html.match(
      /(?:\+39[\s\-]?)?(?:0\d{1,4}[\s\-]?\d{4,8}|\d{3}[\s\-]?\d{6,7})/g,
    ) ?? [];
  return [...new Set(raw.map((p) => p.replace(/\s/g, "")))].slice(0, 3);
}

const SOCIAL_PATTERNS: [string, RegExp][] = [
  ["instagram", /instagram\.com\/(?!p\/)/],
  ["facebook", /facebook\.com\//],
  ["linkedin", /linkedin\.com\//],
  ["twitter", /twitter\.com\/|x\.com\//],
  ["youtube", /youtube\.com\/(?:channel|c|user|@)/],
  ["tiktok", /tiktok\.com\/@/],
  ["pinterest", /pinterest\.it\/|pinterest\.com\//],
];

export function extractSocials($: Cheerio$): Record<string, string> {
  const found: Record<string, string> = {};
  $('a[href]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    for (const [name, pattern] of SOCIAL_PATTERNS) {
      if (!found[name] && pattern.test(href)) {
        found[name] = href;
      }
    }
  });
  return found;
}

export function getLinks($: Cheerio$, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const links: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    try {
      const resolved = new URL(href, base);
      if (resolved.hostname === base.hostname && resolved.protocol.startsWith("http")) {
        links.push(resolved.toString());
      }
    } catch {
      // skip
    }
  });
  return links;
}
