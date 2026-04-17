import type { Cheerio$ } from "../parser";
import { extractEmails, extractPhones, extractSocials } from "../parser";

export interface ContactSignals {
  publicEmail: string | null;
  publicPhone: string | null;
  hasForm: boolean;
  socialLinks: Record<string, string>;
  hasContactPage: boolean;
}

const CONTACT_LINK_PATTERNS = [
  /\/(contact|contatti|contattaci|contact-us|chi-siamo|about|about-us)/i,
];

export function extractContactSignals(
  $: Cheerio$,
  html: string,
  pageLinks: string[],
): ContactSignals {
  const emails = extractEmails(html);
  const phones = extractPhones(html);
  const socials = extractSocials($);

  const hasForm = $('form').length > 0;
  const hasContactPage = pageLinks.some((l) =>
    CONTACT_LINK_PATTERNS.some((p) => p.test(new URL(l).pathname)),
  );

  return {
    publicEmail: emails[0] ?? null,
    publicPhone: phones[0] ?? null,
    hasForm,
    socialLinks: socials,
    hasContactPage,
  };
}
