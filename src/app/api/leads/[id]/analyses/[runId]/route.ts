import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; runId: string }> },
) {
  const { id, runId } = await params;

  const run = await prisma.leadAnalysisRun.findFirst({
    where: { id: runId, leadId: id },
    include: {
      pages: {
        orderBy: { scannedAt: "desc" },
        select: {
          id: true,
          scannedUrl: true,
          pageType: true,
          httpStatus: true,
          title: true,
          metaDescription: true,
          h1: true,
          canonical: true,
          robotsMeta: true,
          schemaPresent: true,
          indexable: true,
          titleQuality: true,
          issues: true,
          notes: true,
          scannedAt: true,
        },
      },
    },
  });

  if (!run) {
    return NextResponse.json({ error: "Run non trovata" }, { status: 404 });
  }

  return NextResponse.json(run);
}
