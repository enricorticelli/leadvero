import { describe, expect, it } from "vitest";
import { POST as START } from "../../src/app/api/discovery-runs/route";
import { POST as STOP } from "../../src/app/api/discovery-runs/[id]/route";

describe("stop run", () => {
  it("marks run aborted and keeps metadata", async () => {
    const create = await START(
      new Request("http://localhost/api/discovery-runs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ keyword: "seo", country: "IT", platform: "both" })
      })
    );
    const payload = await create.json();

    const stop = await STOP(
      new Request(`http://localhost/api/discovery-runs/${payload.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "stop" })
      }),
      { params: { id: payload.id } }
    );

    const stopped = await stop.json();
    expect(stopped.status).toBe("aborted");
    expect(stopped.stoppedAt).toBeTruthy();
  });
});
