import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import {
  requireSession,
  setSessionCookie,
  UnauthorizedError,
} from "@/server/auth/session";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "@/server/auth/password";

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 });
  }

  const currentPassword =
    typeof body === "object" && body !== null && "currentPassword" in body
      ? String((body as { currentPassword: unknown }).currentPassword ?? "")
      : "";
  const newPassword =
    typeof body === "object" && body !== null && "newPassword" in body
      ? String((body as { newPassword: unknown }).newPassword ?? "")
      : "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Password attuale e nuova richieste" },
      { status: 400 },
    );
  }

  const strengthErr = validatePasswordStrength(newPassword);
  if (strengthErr) {
    return NextResponse.json({ error: strengthErr }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return NextResponse.json(
      { error: "Password attuale errata" },
      { status: 400 },
    );
  }

  const hash = await hashPassword(newPassword);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash, mustChangePassword: false },
  });

  await setSessionCookie({
    userId: updated.id,
    username: updated.username,
    role: updated.role,
    mustChangePassword: false,
  });

  return NextResponse.json({ ok: true });
}
