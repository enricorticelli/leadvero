import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;
  username: string;
  role: "admin" | "user";
  mustChangePassword: boolean;
}

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getSecret(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET ??
    "dev-insecure-secret-change-in-production-please-32chars";
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.username !== "string" ||
      (payload.role !== "admin" && payload.role !== "user") ||
      typeof payload.mustChangePassword !== "boolean"
    )
      return null;
    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      mustChangePassword: payload.mustChangePassword,
    };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "leadvero_session";
export const SESSION_MAX_AGE = SESSION_DURATION_SECONDS;
