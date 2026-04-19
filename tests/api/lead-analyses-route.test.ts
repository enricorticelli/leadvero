import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const prismaMock = {
  lead: {
    findUnique: vi.fn(),
  },
  leadAnalysisRun: {
    create: vi.fn(),
  },
};

vi.mock("@/server/db/prisma", () => ({
  prisma: prismaMock,
}));

describe("POST /api/leads/[id]/analyses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for malformed JSON", async () => {
    const { POST } = await import("@/app/api/leads/[id]/analyses/route");
    const req = {
      json: async () => {
        throw new Error("bad json");
      },
    } as unknown as NextRequest;

    const res = await POST(req, { params: Promise.resolve({ id: "lead_1" }) });
    expect(res.status).toBe(400);
  });

  it("returns 422 for invalid schema", async () => {
    const { POST } = await import("@/app/api/leads/[id]/analyses/route");
    const req = new NextRequest("http://localhost/api/leads/x/analyses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        preset: "standard",
        advanced: { maxPages: 1 },
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "lead_1" }) });
    expect(res.status).toBe(422);
  });

  it("returns 404 for missing lead", async () => {
    const { POST } = await import("@/app/api/leads/[id]/analyses/route");
    prismaMock.lead.findUnique.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/leads/x/analyses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preset: "light" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "lead_404" }) });
    expect(res.status).toBe(404);
  });

  it("returns 201 and creates run", async () => {
    const { POST } = await import("@/app/api/leads/[id]/analyses/route");
    prismaMock.lead.findUnique.mockResolvedValueOnce({ id: "lead_ok" });
    prismaMock.leadAnalysisRun.create.mockResolvedValueOnce({ id: "run_1" });

    const req = new NextRequest("http://localhost/api/leads/x/analyses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preset: "deep" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "lead_ok" }) });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.runId).toBe("run_1");
    expect(prismaMock.leadAnalysisRun.create).toHaveBeenCalled();
  });
});
