import "server-only";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function validatePasswordStrength(plain: string): string | null {
  if (plain.length < 6) return "La password deve essere di almeno 6 caratteri";
  if (plain.length > 128) return "Password troppo lunga (max 128 caratteri)";
  return null;
}
