import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";

const schema = z.object({
  keyword: z.string().optional().nullable(),
  niche: z.string().optional().nullable(),
  country: z.string().default("IT"),
  city: z.string().optional().nullable(),
  language: z.string().default("it"),
  targetPlatform: z
    .enum(["shopify", "wordpress", "both", "any"])
    .default("any"),
  businessType: z.string().optional().nullable(),
  maxResults: z.number().int().min(5).max(100).default(30),
  filters: z.record(z.unknown()).optional().nullable(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { filters, ...rest } = parsed.data;
  const job = await prisma.searchJob.create({
    data: {
      ...rest,
      ...(filters != null
        ? { filters: JSON.stringify(filters) }
        : {}),
    },
  });
  return NextResponse.json({ id: job.id }, { status: 201 });
}

export async function GET() {
  const jobs = await prisma.searchJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      niche: true,
      city: true,
      country: true,
      targetPlatform: true,
      status: true,
      discoveredCount: true,
      scannedCount: true,
      scoredCount: true,
      createdAt: true,
      startedAt: true,
      finishedAt: true,
    },
  });
  return NextResponse.json(jobs);
}
