import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import {
  requireAdmin,
  ForbiddenError,
  UnauthorizedError,
} from "@/server/auth/session";
import {
  hashPassword,
  validatePasswordStrength,
} from "@/server/auth/password";

function handleAuthError(e: unknown): NextResponse | null {
  if (e instanceof UnauthorizedError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (e instanceof ForbiddenError) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    const res = handleAuthError(e);
    if (res) return res;
    throw e;
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      role: true,
      mustChangePassword: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    const res = handleAuthError(e);
    if (res) return res;
    throw e;
  }

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
  const role =
    typeof body === "object" && body !== null && "role" in body
      ? String((body as { role: unknown }).role ?? "user")
      : "user";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username e password richiesti" },
      { status: 400 },
    );
  }
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    return NextResponse.json(
      { error: "Username non valido (3-32 caratteri, a-z 0-9 . _ -)" },
      { status: 400 },
    );
  }
  if (role !== "admin" && role !== "user") {
    return NextResponse.json({ error: "Ruolo non valido" }, { status: 400 });
  }

  const strengthErr = validatePasswordStrength(password);
  if (strengthErr) {
    return NextResponse.json({ error: strengthErr }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json(
      { error: "Username già esistente" },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash: await hashPassword(password),
      role,
      mustChangePassword: true,
    },
    select: {
      id: true,
      username: true,
      role: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
