import { getRun } from "../../../../../server/db/repositories/discovery-runs.repository";
import { listCandidates } from "../../../../../server/db/repositories/discovery-candidates.repository";

function formatSse(data: unknown): string {
  // Use default SSE "message" event so EventSource.onmessage receives updates.
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await context.params;
  const run = getRun(id);
  if (!run) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const emit = () => {
        const current = getRun(id);
        if (!current) {
          controller.close();
          return true;
        }

        const candidates = listCandidates(current.id);
        controller.enqueue(
          encoder.encode(
            formatSse({
              id: current.id,
              status: current.status,
              discovered: current.discoveredCount,
              stoppedAt: current.stoppedAt,
              candidates
            })
          )
        );

        if (current.status === "completed" || current.status === "aborted") {
          controller.close();
          return true;
        }
        return false;
      };

      if (emit()) return;
      const timer = setInterval(() => {
        if (emit()) clearInterval(timer);
      }, 500);
    }
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache"
    }
  });
}
