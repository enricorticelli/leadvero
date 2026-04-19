export interface SeoSignalsShape {
  title?: string;
  titleLength?: number;
  titleQuality?: "good" | "short" | "long" | "missing";
  metaDescription?: string;
  metaDescriptionPresent?: boolean;
  h1Count?: number;
  h1First?: string;
  canonical?: string;
  canonicalPresent?: boolean;
  robotsMeta?: string;
  indexable?: boolean;
  schemaPresent?: boolean;
  sitemapPresent?: boolean;
  robotsTxtPresent?: boolean;
}

export interface QualitySignalsShape {
  analyticsPresent?: boolean;
  tagManagerPresent?: boolean;
  hasBlog?: boolean;
  likelySiteDated?: boolean;
  copyrightYear?: number | null;
  hasProductsOrCollections?: boolean;
}

export interface LeadForAnalysis {
  cms: string | null;
  publicEmail: string | null;
  publicPhone: string | null;
  hasContactPage: boolean;
  hasBlog: boolean;
  hasForm: boolean;
  analyticsPresent: boolean;
  tagManagerPresent: boolean;
  socialLinks: Record<string, string> | null;
  seoSignals: SeoSignalsShape | null;
  siteQualityNotes: QualitySignalsShape | null;
}

export type Severity = "high" | "medium" | "low";

export interface Insight {
  label: string;
  hint?: string;
  severity?: Severity;
}

export interface LeadAnalysis {
  strengths: Insight[];
  weaknesses: Insight[];
}

export function analyzeLead(lead: LeadForAnalysis): LeadAnalysis {
  const strengths: Insight[] = [];
  const weaknesses: Insight[] = [];

  const seo = lead.seoSignals ?? {};
  const quality = lead.siteQualityNotes ?? {};

  // Title
  if (seo.titleQuality === "good") {
    strengths.push({
      label: `Title tag ottimizzato (${seo.titleLength ?? 0} caratteri)`,
    });
  } else if (seo.titleQuality === "missing") {
    weaknesses.push({
      label: "Title tag assente",
      hint: "Penalizzato in modo grave dai motori di ricerca.",
      severity: "high",
    });
  } else if (seo.titleQuality === "short") {
    weaknesses.push({
      label: `Title troppo corto (${seo.titleLength ?? 0} caratteri)`,
      hint: "Ideale tra 30 e 60 caratteri.",
      severity: "medium",
    });
  } else if (seo.titleQuality === "long") {
    weaknesses.push({
      label: `Title troppo lungo (${seo.titleLength ?? 0} caratteri)`,
      hint: "Oltre 60 caratteri Google tronca lo snippet.",
      severity: "medium",
    });
  }

  // Meta description
  if (seo.metaDescriptionPresent) {
    strengths.push({ label: "Meta description presente" });
  } else {
    weaknesses.push({
      label: "Meta description assente",
      hint: "Riduce il CTR dai risultati di ricerca.",
      severity: "medium",
    });
  }

  // H1
  if (seo.h1Count === 1) {
    strengths.push({ label: "H1 singolo e ben strutturato" });
  } else if (seo.h1Count === 0) {
    weaknesses.push({
      label: "Nessun H1 in homepage",
      hint: "L'H1 è il segnale più forte di tema pagina per i motori di ricerca.",
      severity: "high",
    });
  } else if ((seo.h1Count ?? 0) > 1) {
    weaknesses.push({
      label: `${seo.h1Count} H1 nella stessa pagina`,
      hint: "Meglio averne uno solo per chiarezza semantica.",
      severity: "low",
    });
  }

  // Indexable
  if (seo.indexable === false) {
    weaknesses.push({
      label: "Sito non indicizzabile (noindex)",
      hint: "Con questo tag il sito non appare su Google.",
      severity: "high",
    });
  }

  // Schema
  if (seo.schemaPresent) {
    strengths.push({ label: "Schema markup JSON-LD rilevato" });
  } else {
    weaknesses.push({
      label: "Nessuno schema markup",
      hint: "Senza schema niente rich snippet (stelle, prezzi, FAQ).",
      severity: "medium",
    });
  }

  // Canonical
  if (seo.canonicalPresent) {
    strengths.push({ label: "Canonical dichiarato" });
  } else {
    weaknesses.push({
      label: "Canonical assente",
      hint: "Rischio di duplicati in SERP.",
      severity: "low",
    });
  }

  // Sitemap + robots
  if (seo.sitemapPresent) {
    strengths.push({ label: "Sitemap XML disponibile" });
  } else {
    weaknesses.push({
      label: "Nessuna sitemap.xml",
      hint: "Ne rallenta la scoperta delle nuove pagine.",
      severity: "medium",
    });
  }
  if (seo.robotsTxtPresent === false) {
    weaknesses.push({
      label: "robots.txt non trovato",
      hint: "File di base per controllo crawler, utile averlo.",
      severity: "low",
    });
  }

  // Quality signals
  if (quality.likelySiteDated) {
    weaknesses.push({
      label: quality.copyrightYear
        ? `Sito probabilmente datato (copyright ${quality.copyrightYear})`
        : "Sito probabilmente datato",
      hint: "Ottima leva per proporre un restyling.",
      severity: "medium",
    });
  } else if (quality.copyrightYear && quality.copyrightYear >= new Date().getFullYear() - 1) {
    strengths.push({ label: `Sito aggiornato (copyright ${quality.copyrightYear})` });
  }

  if (quality.hasProductsOrCollections && (lead.cms === "shopify" || lead.cms === "woocommerce")) {
    strengths.push({ label: "Catalogo e-commerce rilevato" });
  }

  // Analytics / Tag Manager
  if (lead.analyticsPresent && lead.tagManagerPresent) {
    strengths.push({ label: "Analytics + Tag Manager configurati" });
  } else if (lead.analyticsPresent) {
    strengths.push({ label: "Analytics presente" });
    weaknesses.push({
      label: "Tag Manager non rilevato",
      hint: "Utile per gestire script e conversioni.",
      severity: "low",
    });
  } else {
    weaknesses.push({
      label: "Analytics non rilevato",
      hint: "Niente dati di traffico → nessuna misurazione ROI.",
      severity: "medium",
    });
  }

  // Blog
  if (lead.hasBlog) {
    strengths.push({ label: "Blog presente (content marketing attivo)" });
  } else {
    weaknesses.push({
      label: "Nessun blog",
      hint: "Opportunità content marketing / SEO editoriale.",
      severity: "low",
    });
  }

  // Contattabilità
  if (lead.publicEmail) {
    strengths.push({
      label: "Email pubblica disponibile",
      hint: lead.publicEmail,
    });
  } else if (!lead.hasContactPage) {
    weaknesses.push({
      label: "Nessuna email né pagina contatti",
      hint: "Rende difficile l'outreach.",
      severity: "high",
    });
  } else {
    weaknesses.push({
      label: "Email pubblica non esposta",
      hint: "C'è una pagina contatti ma nessuna email diretta.",
      severity: "medium",
    });
  }

  if (lead.publicPhone) strengths.push({ label: "Telefono pubblico disponibile" });
  if (lead.hasForm) strengths.push({ label: "Form di contatto presente" });

  const socialCount = lead.socialLinks ? Object.keys(lead.socialLinks).length : 0;
  if (socialCount >= 3) {
    strengths.push({ label: `Presenza social (${socialCount} canali)` });
  } else if (socialCount === 0) {
    weaknesses.push({
      label: "Nessun canale social rilevato",
      hint: "Limita i punti di contatto alternativi.",
      severity: "low",
    });
  }

  // Sort weaknesses by severity (high > medium > low)
  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  weaknesses.sort(
    (a, b) => order[a.severity ?? "low"] - order[b.severity ?? "low"],
  );

  return { strengths, weaknesses };
}
