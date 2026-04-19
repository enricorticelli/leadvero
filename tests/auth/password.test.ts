import { describe, expect, it } from "vitest";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "@/server/auth/password";

describe("hashPassword / verifyPassword", () => {
  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("correct-horse-battery-staple", hash)).toBe(
      true,
    );
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("secret123");
    expect(await verifyPassword("secret124", hash)).toBe(false);
  });

  it("produces different hashes for the same input (salt)", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
    expect(await verifyPassword("same", a)).toBe(true);
    expect(await verifyPassword("same", b)).toBe(true);
  });
});

describe("validatePasswordStrength", () => {
  it("accepts passwords of at least 6 characters", () => {
    expect(validatePasswordStrength("abcdef")).toBeNull();
    expect(validatePasswordStrength("a-long-enough-passphrase")).toBeNull();
  });

  it("rejects passwords shorter than 6 characters", () => {
    expect(validatePasswordStrength("abc")).toMatch(/almeno 6/i);
    expect(validatePasswordStrength("")).toMatch(/almeno 6/i);
  });

  it("rejects passwords longer than 128 characters", () => {
    expect(validatePasswordStrength("a".repeat(129))).toMatch(/troppo lunga/i);
  });
});
