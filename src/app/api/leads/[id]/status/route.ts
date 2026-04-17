import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";

const schema = z.object({
  status: z.enum(["new", "to_contact", "contacted", "not_relevant", "closed"]).optional(),
  userNotes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const lead = await prisma.lead.update({
    where: { id },
    data: parsed.data,
    select: { id: true, status: true, userNotes: true },
  });
  return NextResponse.json(lead);
}
