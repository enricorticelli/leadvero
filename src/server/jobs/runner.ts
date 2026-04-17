import { prisma } from "../db/prisma";
import { discover, type DiscoveryInput } from "../discovery";
import { scanSite } from "../crawl/site-scan";
import { score } from "../scoring";
import type { TargetPlatform } from "@prisma/client";
import { Prisma } from "@prisma/client";

function toJson(v: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
}

export async function runSearchJob(jobId: string): Promise<void> {
  const job = await prisma.searchJob.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "running") return;

  const existingDomains = new Set(
    (await prisma.lead.findMany({ select: { normalizedDomain: true } })).map(
      (l) => l.normalizedDomain,
    ),
  );

  const discoveryInput: DiscoveryInput = {
    keyword: job.keyword,
    niche: job.niche,
    city: job.city,
    country: job.country,
    language: job.language,
    targetPlatform: job.targetPlatform as TargetPlatform,
    businessType: job.businessType,
    maxResults: job.maxResults,
  };

  let candidates;
  try {
    candidates = await discover(discoveryInput, { existingDomains });
  } catch (err) {
    await prisma.searchJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        finishedAt: new Date(),
        errorMessage: String(err),
      },
    });
    return;
  }

  await prisma.searchJob.update({
    where: { id: jobId },
    data: { discoveredCount: candidates.length },
  });

  let scanned = 0;
  let scored = 0;

  for (const candidate of candidates) {
    let scanResult;
    try {
      scanResult = await scanSite(candidate.normalizedDomain);
    } catch {
      scanResult = null;
    }

    scanned++;

    if (!scanResult) {
      await prisma.searchJob.update({
        where: { id: jobId },
        data: { scannedCount: scanned },
      });
      continue;
    }

    const scoreOutput = score({
      fit: {
        targetPlatform: job.targetPlatform as TargetPlatform,
        cms: scanResult.cms,
        language: scanResult.language,
        country: job.country,
        jobCountry: job.country,
        jobLanguage: job.language,
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

    try {
      const lead = await prisma.lead.upsert({
        where: { normalizedDomain: candidate.normalizedDomain },
        update: {
          lastScannedAt: new Date(),
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
          searchJobId: jobId,
          companyName: scanResult.companyName,
          domain: candidate.domain,
          normalizedDomain: candidate.normalizedDomain,
          sourceUrl: candidate.sourceUrl,
          sourceType: candidate.sourceIntent,
          country: job.country,
          city: job.city,
          language: scanResult.language,
          niche: job.niche,
          businessType: job.businessType,
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

      scored++;
    } catch {
      // upsert failed — continue with next candidate
    }

    await prisma.searchJob.update({
      where: { id: jobId },
      data: { scannedCount: scanned, scoredCount: scored },
    });
  }

  await prisma.searchJob.update({
    where: { id: jobId },
    data: {
      status: "done",
      finishedAt: new Date(),
      scannedCount: scanned,
      scoredCount: scored,
    },
  });
}
