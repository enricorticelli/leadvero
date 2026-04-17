import { z } from "zod";
import { prisma } from "../db/prisma";
import { generateOutreach } from "./claude";
import { env } from "../env";

const PROMPT_VERSION = "1.0";

const draftSchema = z.object({
  hook: z.string().min(5),
  miniAudit: z.string().min(5),
  suggestedOffer: z.string().min(5),
  emailDraft: z.string().min(10),
  linkedinDraft: z.string().min(10),
});

export async function generateOutreachForLead(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { scans: { take: 3 } },
  });
  if (!lead) throw new Error(`Lead ${leadId} not found`);

  const seoSignals = lead.seoSignals as Record<string, unknown> | null;
  const siteQuality = lead.siteQualityNotes as Record<string, unknown> | null;

  const bundle = {
    companyName: lead.companyName,
    domain: lead.domain,
    cms: lead.cms,
    language: lead.language ?? "it",
    country: lead.country,
    niche: lead.niche,
    totalScore: lead.totalScore,
    scoreReasons: lead.scoreReasons,
    seo: seoSignals
      ? {
          titleQuality: seoSignals.titleQuality,
          metaDescriptionPresent: seoSignals.metaDescriptionPresent,
          h1Count: seoSignals.h1Count,
          schemaPresent: seoSignals.schemaPresent,
          sitemapPresent: seoSignals.sitemapPresent,
        }
      : null,
    quality: siteQuality
      ? {
          likelySiteDated: siteQuality.likelySiteDated,
          hasBlog: lead.hasBlog,
          analyticsPresent: lead.analyticsPresent,
          tagManagerPresent: lead.tagManagerPresent,
        }
      : null,
    contact: {
      publicEmail: lead.publicEmail,
      hasContactPage: lead.hasContactPage,
      hasForm: lead.hasForm,
    },
  };

  const userMessage = JSON.stringify(bundle, null, 2);
  const raw = await generateOutreach(userMessage);

  const validated = draftSchema.safeParse(raw);
  if (!validated.success) {
    throw new Error(`Invalid outreach response: ${validated.error.message}`);
  }

  const draft = await prisma.outreachDraft.create({
    data: {
      leadId,
      ...validated.data,
      model: env().ANTHROPIC_MODEL,
      promptVersion: PROMPT_VERSION,
    },
  });

  return draft;
}
