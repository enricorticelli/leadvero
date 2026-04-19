import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import {
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/server/auth/jwt";

const VALID: SessionPayload = {
  userId: "user_1",
  username: "alice",
  role: "admin",
  mustChangePassword: false,
};

const TEST_SECRET = "a-test-secret-for-the-unit-suite-32bytes";

beforeEach(() => {
  process.env.SESSION_SECRET = TEST_SECRET;
});

afterEach(() => {
  delete process.env.SESSION_SECRET;
});

describe("signSessionToken / verifySessionToken", () => {
  it("round-trips a valid payload", async () => {
    const token = await signSessionToken(VALID);
    const verified = await verifySessionToken(token);
    expect(verified).toEqual(VALID);
  });

  it("preserves role and mustChangePassword", async () => {
    const payload: SessionPayload = {
      userId: "u",
      username: "bob",
      role: "user",
      mustChangePassword: true,
    };
    const token = await signSessionToken(payload);
    const verified = await verifySessionToken(token);
    expect(verified?.role).toBe("user");
    expect(verified?.mustChangePassword).toBe(true);
  });

  it("returns null for an unparsable token", async () => {
    expect(await verifySessionToken("not-a-jwt")).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
  });

  it("returns null for a token signed with a different secret", async () => {
    const token = await signSessionToken(VALID);
    process.env.SESSION_SECRET = "a-different-secret-for-verification-only";
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("returns null for a payload missing required fields", async () => {
    const bad = await new SignJWT({ userId: "u" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(TEST_SECRET));
    expect(await verifySessionToken(bad)).toBeNull();
  });

  it("returns null for a payload with an invalid role", async () => {
    const bad = await new SignJWT({
      userId: "u",
      username: "x",
      role: "superuser",
      mustChangePassword: false,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(TEST_SECRET));
    expect(await verifySessionToken(bad)).toBeNull();
  });

  it("returns null for an expired token", async () => {
    const expired = await new SignJWT({ ...VALID })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(new TextEncoder().encode(TEST_SECRET));
    expect(await verifySessionToken(expired)).toBeNull();
  });
});
