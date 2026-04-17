import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = await prisma.searchJob.findUnique({
    where: { id },
    select: {
      id: true,
      niche: true,
      city: true,
      country: true,
      keyword: true,
      targetPlatform: true,
      status: true,
      errorMessage: true,
      discoveredCount: true,
      scannedCount: true,
      scoredCount: true,
      maxResults: true,
      createdAt: true,
      startedAt: true,
      finishedAt: true,
    },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}
