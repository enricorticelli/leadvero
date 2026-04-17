import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("discovery form contract", () => {
  it("contains required and optional fields", () => {
    const content = fs.readFileSync("src/app/(discovery)/components/DiscoveryCriteriaForm.tsx", "utf8");
    expect(content).toContain("keyword");
    expect(content).toContain("country");
    expect(content).toContain("city");
    expect(content).toContain("language");
    expect(content).toContain("WordPress");
    expect(content).toContain("Shopify");
    expect(content).toContain("Both");
  });
});
