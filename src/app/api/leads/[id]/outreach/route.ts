import { NextRequest, NextResponse } from "next/server";
import { generateOutreachForLead } from "@/server/outreach/generator";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const draft = await generateOutreachForLead(id);
    return NextResponse.json(draft, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 503 },
      );
    }
    console.error("[outreach]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
