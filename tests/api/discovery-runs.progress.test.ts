import { describe, expect, it } from "vitest";
import { POST as START } from "../../src/app/api/discovery-runs/route";
import { GET as EVENTS } from "../../src/app/api/discovery-runs/[id]/events/route";

describe("progress stream", () => {
  it("returns sse headers and status payload", async () => {
    const create = await START(
      new Request("http://localhost/api/discovery-runs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ keyword: "seo", country: "IT", platform: "both" })
      })
    );
    const payload = await create.json();

    const response = await EVENTS(new Request("http://localhost"), { params: Promise.resolve({ id: payload.id }) });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    const payloadText = await response.text();
    expect(payloadText).toContain("\"candidates\":");
  });
});
