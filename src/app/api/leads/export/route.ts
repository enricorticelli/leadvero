import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";

function toCsvRow(values: (string | number | null | undefined)[]): string {
  return values
    .map((v) => {
      if (v == null) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    })
    .join(",");
}

const HEADERS = [
  "id",
  "companyName",
  "domain",
  "cms",
  "niche",
  "country",
  "city",
  "language",
  "totalScore",
  "fitScore",
  "opportunityScore",
  "commercialScore",
  "contactabilityScore",
  "publicEmail",
  "publicPhone",
  "hasContactPage",
  "hasBlog",
  "analyticsPresent",
  "status",
  "createdAt",
];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const where: Prisma.LeadWhereInput = {};

  const minScore = sp.get("minScore");
  if (minScore) where.totalScore = { gte: parseInt(minScore, 10) };
  const status = sp.get("status");
  if (status) where.status = status as Prisma.LeadWhereInput["status"];
  const cms = sp.get("cms");
  if (cms) where.cms = cms;
  const hasEmail = sp.get("hasEmail");
  if (hasEmail === "true") where.publicEmail = { not: null };

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { totalScore: "desc" },
    take: 5000,
    select: {
      id: true,
      companyName: true,
      domain: true,
      cms: true,
      niche: true,
      country: true,
      city: true,
      language: true,
      totalScore: true,
      fitScore: true,
      opportunityScore: true,
      commercialScore: true,
      contactabilityScore: true,
      publicEmail: true,
      publicPhone: true,
      hasContactPage: true,
      hasBlog: true,
      analyticsPresent: true,
      status: true,
      createdAt: true,
    },
  });

  const rows = [
    toCsvRow(HEADERS),
    ...leads.map((l) =>
      toCsvRow([
        l.id,
        l.companyName,
        l.domain,
        l.cms,
        l.niche,
        l.country,
        l.city,
        l.language,
        l.totalScore,
        l.fitScore,
        l.opportunityScore,
        l.commercialScore,
        l.contactabilityScore,
        l.publicEmail,
        l.publicPhone,
        l.hasContactPage ? "true" : "false",
        l.hasBlog ? "true" : "false",
        l.analyticsPresent ? "true" : "false",
        l.status,
        l.createdAt.toISOString(),
      ]),
    ),
  ].join("\r\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leadvero-export-${Date.now()}.csv"`,
    },
  });
}
