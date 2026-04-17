import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const perPage = Math.min(100, parseInt(sp.get("perPage") ?? "25", 10));
  const skip = (page - 1) * perPage;

  const where: Prisma.LeadWhereInput = {};

  const search = sp.get("search");
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: "insensitive" } },
      { domain: { contains: search, mode: "insensitive" } },
      { niche: { contains: search, mode: "insensitive" } },
    ];
  }

  const status = sp.get("status");
  if (status) where.status = status as Parameters<typeof prisma.lead.findMany>[0] extends { where?: infer W } ? never : never;

  const minScore = sp.get("minScore");
  if (minScore) where.totalScore = { gte: parseInt(minScore, 10) };

  const cms = sp.get("cms");
  if (cms) where.cms = cms;

  const hasEmail = sp.get("hasEmail");
  if (hasEmail === "true") where.publicEmail = { not: null };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { totalScore: "desc" },
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
        scoreReasons: true,
        createdAt: true,
        lastScannedAt: true,
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({
    leads,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  });
}
