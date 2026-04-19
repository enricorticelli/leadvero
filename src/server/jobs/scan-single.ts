import { prisma } from "../db/prisma";
import { normalizeUrl } from "../discovery/normalize";
import { scanSite } from "../crawl/site-scan";
import { score } from "../scoring";
import { Prisma } from "@prisma/client";

function toJson(v: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
}

const MANUAL_JOB_ID = "__manual__";

export type ScanSingleError =
  | "invalid_url"
  | "blocked_domain"
  | "unreachable"
  | "upsert_failed";

export type ScanSingleResult =
  | { ok: true; leadId: string; isNew: boolean; normalizedDomain: string }
  | { ok: false; error: ScanSingleError; message: string };

async function ensureManualJob(): Promise<void> {
  await prisma.searchJob.upsert({
    where: { id: MANUAL_JOB_ID },
    update: {},
    create: {
      id: MANUAL_JOB_ID,
      country: "IT",
      language: "it",
      targetPlatform: "any",
      maxResults: 1,
      status: "done",
      finishedAt: new Date(),
    },
  });
}

export async function scanSingleUrl(rawUrl: string): Promise<ScanSingleResult> {
  const trimmed = rawUrl.trim();
  if (!trimmed) return { ok: false, error: "invalid_url", message: "URL vuoto" };

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const normalized = normalizeUrl(withProtocol);
  if (!normalized) {
    return {
      ok: false,
      error: "invalid_url",
      message:
        "URL non valido o dominio escluso (social, marketplace o piattaforma generica).",
    };
  }

  const existing = await prisma.lead.findUnique({
    where: { normalizedDomain: normalized.normalizedDomain },
    select: { id: true },
  });

  let scanResult;
  try {
    scanResult = await scanSite(normalized.normalizedDomain);
  } catch {
    scanResult = null;
  }
  if (!scanResult) {
    return {
      ok: false,
      error: "unreachable",
      message: "Impossibile raggiungere il sito o contenuto non analizzabile.",
    };
  }

  const scoreOutput = score({
    fit: {
      targetPlatform: "any",
      cms: scanResult.cms,
      language: scanResult.language,
      country: "IT",
      jobCountry: "IT",
      jobLanguage: "it",
    },
    opportunity: { seo: scanResult.seo, quality: scanResult.quality },
    commercial: {
      quality: scanResult.quality,
      cms: scanResult.cms,
      pagesScannedCount: scanResult.pages.length,
      companyName: scanResult.companyName,
    },
    contact: scanResult.contact,
  });

  await ensureManualJob();

  try {
    const lead = await prisma.lead.upsert({
      where: { normalizedDomain: normalized.normalizedDomain },
      update: {
        lastScannedAt: new Date(),
        companyName: scanResult.companyName,
        cms: scanResult.cms.cms,
        ecommercePlatform: scanResult.cms.ecommercePlatform,
        language: scanResult.language,
        hasBlog: scanResult.quality.hasBlog,
        hasContactPage: scanResult.contact.hasContactPage,
        publicEmail: scanResult.contact.publicEmail,
        publicPhone: scanResult.contact.publicPhone,
        hasForm: scanResult.contact.hasForm,
        socialLinks: toJson(scanResult.contact.socialLinks),
        seoSignals: toJson(scanResult.seo),
        analyticsPresent: scanResult.quality.analyticsPresent,
        tagManagerPresent: scanResult.quality.tagManagerPresent,
        siteQualityNotes: toJson({
          likelySiteDated: scanResult.quality.likelySiteDated,
          copyrightYear: scanResult.quality.copyrightYear,
        }),
        fitScore: scoreOutput.fitScore,
        opportunityScore: scoreOutput.opportunityScore,
        commercialScore: scoreOutput.commercialScore,
        contactabilityScore: scoreOutput.contactabilityScore,
        totalScore: scoreOutput.totalScore,
        scoreReasons: scoreOutput.scoreReasons,
      },
      create: {
        searchJobId: MANUAL_JOB_ID,
        companyName: scanResult.companyName,
        domain: normalized.domain,
        normalizedDomain: normalized.normalizedDomain,
        sourceUrl: normalized.sourceUrl,
        sourceType: "manual",
        country: "IT",
        language: scanResult.language,
        cms: scanResult.cms.cms,
        ecommercePlatform: scanResult.cms.ecommercePlatform,
        hasBlog: scanResult.quality.hasBlog,
        hasContactPage: scanResult.contact.hasContactPage,
        publicEmail: scanResult.contact.publicEmail,
        publicPhone: scanResult.contact.publicPhone,
        hasForm: scanResult.contact.hasForm,
        socialLinks: toJson(scanResult.contact.socialLinks),
        seoSignals: toJson(scanResult.seo),
        analyticsPresent: scanResult.quality.analyticsPresent,
        tagManagerPresent: scanResult.quality.tagManagerPresent,
        siteQualityNotes: toJson({
          likelySiteDated: scanResult.quality.likelySiteDated,
          copyrightYear: scanResult.quality.copyrightYear,
        }),
        fitScore: scoreOutput.fitScore,
        opportunityScore: scoreOutput.opportunityScore,
        commercialScore: scoreOutput.commercialScore,
        contactabilityScore: scoreOutput.contactabilityScore,
        totalScore: scoreOutput.totalScore,
        scoreReasons: scoreOutput.scoreReasons,
        lastScannedAt: new Date(),
      },
    });

    await prisma.scanResult.createMany({
      data: scanResult.pages.map((p) => ({
        leadId: lead.id,
        scannedUrl: p.url,
        pageType: p.pageType,
        httpStatus: p.httpStatus,
        title: p.title,
        metaDescription: p.metaDescription,
        h1: p.h1,
        canonical: p.canonical,
        robotsMeta: p.robotsMeta,
        structuredData: toJson({ detected: p.structuredData }),
        notes: toJson(p.notes),
      })),
      skipDuplicates: true,
    });

    return {
      ok: true,
      leadId: lead.id,
      isNew: !existing,
      normalizedDomain: normalized.normalizedDomain,
    };
  } catch {
    return {
      ok: false,
      error: "upsert_failed",
      message: "Errore durante il salvataggio del lead.",
    };
  }
}
