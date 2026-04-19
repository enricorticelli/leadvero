import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/server/auth/session";

function getConfigPath(): string | null {
  const dir = process.env.LEADVERO_DATA_DIR;
  if (!dir) return null;
  return path.join(dir, "config.json");
}

function readConfig(): Record<string, string> {
  const configPath = getConfigPath();
  if (!configPath || !existsSync(configPath)) return {};
  try {
    return JSON.parse(readFileSync(configPath, "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeConfig(data: Record<string, string>): void {
  const configPath = getConfigPath();
  if (!configPath) return;
  const current = readConfig();
  writeFileSync(configPath, JSON.stringify({ ...current, ...data }, null, 2));
}

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    throw e;
  }

  const config = readConfig();
  return NextResponse.json({
    serpApiKey: config.serpApiKey ?? "",
    desktopMode: !!process.env.LEADVERO_DATA_DIR,
  });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    throw e;
  }

  const configPath = getConfigPath();
  if (!configPath) {
    return NextResponse.json(
      { error: "Impostazioni non disponibili in modalità sviluppo" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 });
  }

  const serpApiKey =
    typeof body === "object" && body !== null && "serpApiKey" in body
      ? String((body as { serpApiKey: unknown }).serpApiKey ?? "").trim()
      : null;

  if (serpApiKey === null) {
    return NextResponse.json({ error: "Campo serpApiKey richiesto" }, { status: 400 });
  }

  writeConfig({ serpApiKey });

  // Hot-update the current process env so new searches use the key immediately
  process.env.SERPAPI_KEY = serpApiKey;

  return NextResponse.json({ ok: true });
}
