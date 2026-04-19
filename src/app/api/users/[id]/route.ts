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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireAdmin();
  } catch (e) {
    const res = handleAuthError(e);
    if (res) return res;
    throw e;
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  const data: {
    role?: "admin" | "user";
    passwordHash?: string;
    mustChangePassword?: boolean;
  } = {};

  if (typeof body === "object" && body !== null) {
    const b = body as Record<string, unknown>;

    if ("role" in b) {
      const role = String(b.role ?? "");
      if (role !== "admin" && role !== "user") {
        return NextResponse.json(
          { error: "Ruolo non valido" },
          { status: 400 },
        );
      }
      if (
        target.role === "admin" &&
        role === "user" &&
        target.id === session.userId
      ) {
        return NextResponse.json(
          { error: "Non puoi rimuovere il ruolo admin a te stesso" },
          { status: 400 },
        );
      }
      if (target.role === "admin" && role === "user") {
        const adminCount = await prisma.user.count({
          where: { role: "admin" },
        });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "Deve esserci almeno un amministratore" },
            { status: 400 },
          );
        }
      }
      data.role = role;
    }

    if ("password" in b) {
      const password = String(b.password ?? "");
      const strengthErr = validatePasswordStrength(password);
      if (strengthErr) {
        return NextResponse.json({ error: strengthErr }, { status: 400 });
      }
      data.passwordHash = await hashPassword(password);
      data.mustChangePassword = true;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Nessuna modifica fornita" },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      role: true,
      mustChangePassword: true,
    },
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireAdmin();
  } catch (e) {
    const res = handleAuthError(e);
    if (res) return res;
    throw e;
  }

  const { id } = await params;
  if (id === session.userId) {
    return NextResponse.json(
      { error: "Non puoi eliminare te stesso" },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  if (target.role === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Deve esserci almeno un amministratore" },
        { status: 400 },
      );
    }
  }

  await prisma.user.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
