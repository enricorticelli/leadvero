import { NextRequest, NextResponse } from "next/server";
import { scanSingleUrl } from "@/server/jobs/scan-single";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON non valido" },
      { status: 400 },
    );
  }

  const url =
    typeof body === "object" && body !== null && "url" in body
      ? String((body as { url: unknown }).url ?? "")
      : "";

  if (!url.trim()) {
    return NextResponse.json({ error: "URL mancante" }, { status: 400 });
  }

  const result = await scanSingleUrl(url);
  if (!result.ok) {
    const status =
      result.error === "invalid_url" || result.error === "blocked_domain"
        ? 400
        : result.error === "unreachable"
          ? 502
          : 500;
    return NextResponse.json(
      { error: result.message, code: result.error },
      { status },
    );
  }

  return NextResponse.json({
    leadId: result.leadId,
    isNew: result.isNew,
    normalizedDomain: result.normalizedDomain,
  });
}
