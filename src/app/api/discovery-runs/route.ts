import { DiscoveryRunInputSchema } from "../../../server/discovery/schema";
import { listDiscoveryRuns, startRun } from "../../../server/discovery/orchestrator";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const parsed = DiscoveryRunInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 });
  }

  const run = await startRun(parsed.data);
  return Response.json({ id: run.id, status: "queued" }, { status: 202 });
}

export async function GET(): Promise<Response> {
  return Response.json({ runs: listDiscoveryRuns() });
}
