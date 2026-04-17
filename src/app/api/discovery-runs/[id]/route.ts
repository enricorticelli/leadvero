import { getRun } from "../../../../server/db/repositories/discovery-runs.repository";
import { stopRun } from "../../../../server/discovery/orchestrator";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await context.params;
  const run = getRun(id);
  if (!run) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ run });
}

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await context.params;
  const run = stopRun(id);
  if (!run) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ status: run.status, stoppedAt: run.stoppedAt });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const body = await request.json().catch(() => ({}));
  if (body?.action !== "stop") {
    return Response.json({ error: "Unsupported action" }, { status: 400 });
  }
  return PATCH(request, context);
}
