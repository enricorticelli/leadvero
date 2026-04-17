import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("discovery flow smoke", () => {
  it("contains run lifecycle controls", () => {
    const page = fs.readFileSync("src/app/(discovery)/page.tsx", "utf8");
    expect(page).toContain("/api/discovery-runs");
    expect(page).toContain("EventSource");
    expect(page).toContain("setCandidates");
    expect(page).toContain("next.candidates");

    const form = fs.readFileSync("src/app/(discovery)/components/DiscoveryCriteriaForm.tsx", "utf8");
    expect(form).toContain("Start Discovery Run");
  });

  it("contains stop action label", () => {
    const panel = fs.readFileSync("src/app/(discovery)/components/RunStatusPanel.tsx", "utf8");
    const list = fs.readFileSync("src/app/(discovery)/components/CandidateList.tsx", "utf8");
    expect(panel).toContain("Stop discovery run");
    expect(panel).toContain("discovered");
    expect(list).toContain("No candidates yet");
    expect(list).toContain("candidates.map");
  });
});
