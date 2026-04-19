import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { resolveAnalysisConfig } from "@/server/jobs/lead-analysis";

const bodySchema = z.object({
  preset: z.enum(["light", "standard", "deep"]).default("standard"),
  advanced: z
    .object({
      maxPages: z.number().int().min(5).max(100).optional(),
      runTimeoutMs: z.number().int().min(10_000).max(600_000).optional(),
      includeBlogAndProductPaths: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON non valido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
  if (!lead) {
    return NextResponse.json({ error: "Lead non trovato" }, { status: 404 });
  }

  const config = resolveAnalysisConfig(parsed.data.preset, parsed.data.advanced);
  const run = await prisma.leadAnalysisRun.create({
    data: {
      leadId: id,
      preset: parsed.data.preset,
      maxPages: config.maxPages,
      runTimeoutMs: config.runTimeoutMs,
      includeBlogAndProductPaths: config.includeBlogAndProductPaths,
      status: "pending",
    },
    select: { id: true },
  });

  return NextResponse.json({ runId: run.id }, { status: 201 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
  if (!lead) {
    return NextResponse.json({ error: "Lead non trovato" }, { status: 404 });
  }

  const runs = await prisma.leadAnalysisRun.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      preset: true,
      status: true,
      maxPages: true,
      runTimeoutMs: true,
      includeBlogAndProductPaths: true,
      discoveredCount: true,
      scannedCount: true,
      summary: true,
      errorMessage: true,
      createdAt: true,
      startedAt: true,
      finishedAt: true,
    },
  });

  return NextResponse.json(runs);
}
