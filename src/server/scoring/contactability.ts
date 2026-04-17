import type { ContactSignals } from "../crawl/detect/contact";
import { CONTACTABILITY_POINTS as P } from "./config";

export function scoreContactability(contact: ContactSignals): { score: number; reasons: string[] } {
  let raw = 0;
  const reasons: string[] = [];

  if (contact.publicEmail) { raw += P.publicEmail; reasons.push(`Email pubblica: ${contact.publicEmail}`); }
  if (contact.hasContactPage) { raw += P.contactPage; reasons.push("Pagina contatti presente"); }
  if (contact.hasForm) { raw += P.form; reasons.push("Form di contatto rilevato"); }
  if (contact.publicPhone) { raw += P.publicPhone; }
  if (Object.keys(contact.socialLinks).length > 0) { raw += P.socials; }

  const maxRaw = P.publicEmail + P.contactPage + P.form + P.publicPhone + P.socials;
  const score = Math.round((raw / maxRaw) * 100);

  return { score: Math.min(100, score), reasons: reasons.slice(0, 3) };
}
