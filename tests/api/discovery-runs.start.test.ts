import { describe, expect, it } from "vitest";
import { POST } from "../../src/app/api/discovery-runs/route";

describe("POST /api/discovery-runs", () => {
  it("creates async run", async () => {
    const req = new Request("http://localhost/api/discovery-runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ keyword: "seo", country: "IT", platform: "both" })
    });

    const response = await POST(req);
    expect(response.status).toBe(202);
    const payload = await response.json();
    expect(payload.id).toBeTruthy();
    expect(payload.status).toBe("queued");
  });
});
