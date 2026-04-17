import { describe, expect, it } from "vitest";
import { canonicalDomain, qualityGate } from "../../src/server/discovery/quality-gate";

describe("qualityGate", () => {
  it("normalizes and dedupes", () => {
    const result = qualityGate([
      { domain: "https://www.Example.com", platform: "wordpress", source: "x", score: 0.2 },
      { domain: "example.com", platform: "wordpress", source: "y", score: 0.9 }
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].canonicalDomain).toBe("example.com");
    expect(result[0].score).toBe(0.9);
  });

  it("suppresses parked-like domains", () => {
    const result = qualityGate([{ domain: "parked-something.com", platform: "shopify", source: "x" }]);
    expect(result).toHaveLength(0);
  });

  it("canonicalDomain collapses www and protocol", () => {
    expect(canonicalDomain("https://www.test.com/path")).toBe("test.com");
  });
});
