import { describe, expect, it } from "vitest";
import { DiscoveryRunInputSchema } from "../../src/server/discovery/schema";

describe("DiscoveryRunInputSchema", () => {
  it("rejects missing required fields", () => {
    const result = DiscoveryRunInputSchema.safeParse({ country: "IT", platform: "both" });
    expect(result.success).toBe(false);
  });

  it("accepts optional city and language", () => {
    const result = DiscoveryRunInputSchema.safeParse({
      keyword: "seo",
      country: "IT",
      city: "Rome",
      language: "it",
      platform: "wordpress"
    });
    expect(result.success).toBe(true);
  });
});
