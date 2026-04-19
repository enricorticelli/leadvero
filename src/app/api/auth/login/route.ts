import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { verifyPassword } from "@/server/auth/password";
import { setSessionCookie } from "@/server/auth/session";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 });
  }

  const username =
    typeof body === "object" && body !== null && "username" in body
      ? String((body as { username: unknown }).username ?? "").trim()
      : "";
  const password =
    typeof body === "object" && body !== null && "password" in body
      ? String((body as { password: unknown }).password ?? "")
      : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username e password richiesti" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Credenziali non valide" },
      { status: 401 },
    );
  }

  await setSessionCookie({
    userId: user.id,
    username: user.username,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return NextResponse.json({
    ok: true,
    mustChangePassword: user.mustChangePassword,
  });
}
