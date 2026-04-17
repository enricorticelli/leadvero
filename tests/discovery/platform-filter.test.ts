import { describe, expect, it } from "vitest";
import { platformFilter } from "../../src/server/discovery/platform-filter";

describe("platformFilter", () => {
  const wp = { domain: "a.com", platform: "wordpress" as const, source: "x" };
  const sh = { domain: "b.com", platform: "shopify" as const, source: "x" };

  it("accepts only selected platform", () => {
    expect(platformFilter(wp, "wordpress")).toBe(true);
    expect(platformFilter(wp, "shopify")).toBe(false);
    expect(platformFilter(sh, "shopify")).toBe(true);
  });

  it("accepts both when both selected", () => {
    expect(platformFilter(wp, "both")).toBe(true);
    expect(platformFilter(sh, "both")).toBe(true);
  });
});
