# Phase 01: discovery-targeting-and-runs - Pattern Map

**Mapped:** 2026-04-17  
**Files analyzed:** 24 planned files + 1 explicit exclusion  
**Analogs found:** 0 / 24 planned files

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/(discovery)/page.tsx` | component | request-response | None in repo | none |
| `src/app/(discovery)/components/DiscoveryCriteriaForm.tsx` | component | request-response | None in repo | none |
| `src/app/(discovery)/components/RunStatusPanel.tsx` | component | streaming | None in repo | none |
| `src/app/(discovery)/components/CandidateList.tsx` | component | streaming | None in repo | none |
| `src/app/api/discovery-runs/route.ts` | route | request-response | None in repo | none |
| `src/app/api/discovery-runs/[id]/route.ts` | route | request-response | None in repo | none |
| `src/app/api/discovery-runs/[id]/events/route.ts` | route | streaming | None in repo | none |
| `src/server/discovery/schema.ts` | utility | transform | None in repo | none |
| `src/server/discovery/orchestrator.ts` | service | event-driven | None in repo | none |
| `src/server/discovery/providers/index.ts` | provider | file-I/O | None in repo | none |
| `src/server/discovery/quality-gate.ts` | service | transform | None in repo | none |
| `src/server/discovery/platform-filter.ts` | service | transform | None in repo | none |
| `src/server/queue/client.ts` | config | event-driven | None in repo | none |
| `src/server/queue/worker.ts` | service | event-driven | None in repo | none |
| `src/server/db/repositories/discovery-runs.repository.ts` | model | CRUD | None in repo | none |
| `src/server/db/repositories/discovery-candidates.repository.ts` | model | CRUD | None in repo | none |
| `prisma/schema.prisma` | migration | CRUD | None in repo | none |
| `package.json` | config | batch | None in repo | none |
| `vitest.config.ts` | config | batch | None in repo | none |
| `tests/discovery/input-schema.test.ts` | test | transform | None in repo | none |
| `tests/discovery/platform-filter.test.ts` | test | transform | None in repo | none |
| `tests/api/discovery-runs.start.test.ts` | test | request-response | None in repo | none |
| `tests/api/discovery-runs.progress.test.ts` | test | streaming | None in repo | none |
| `tests/api/discovery-runs.stop.test.ts` | test | request-response | None in repo | none |

## Explicit Exclusions

- `playwright.config.ts` is intentionally excluded from Phase 01 plan file targets. `tests/e2e/discovery-flow.spec.ts` runs with Playwright defaults; add a config file only if execution reveals concrete overrides (e.g., baseURL/projects/retries) are required.

## Pattern Assignments

No in-repo implementation analogs exist yet. Use these research-backed fallbacks as seed patterns until real code analogs are created.

### `src/server/discovery/schema.ts` (utility, transform)

**Analog:** none in codebase  
**Fallback source:** `.planning/phases/01-discovery-targeting-and-runs/01-RESEARCH.md:152-161`

**Validation contract pattern**:
```typescript
import { z } from "zod";

export const DiscoveryRunInput = z.object({
  keyword: z.string().min(2),
  country: z.string().min(2),
  city: z.string().optional(),
  language: z.string().optional(),
  platform: z.enum(["wordpress", "shopify", "both"])
});
```

### `src/app/api/discovery-runs/route.ts` and `src/app/api/discovery-runs/[id]/route.ts` (route, request-response)

**Analog:** none in codebase  
**Fallback source:** `.planning/phases/01-discovery-targeting-and-runs/01-RESEARCH.md:272-275`

**API boundary validation pattern**:
```typescript
const result = DiscoveryRunInput.safeParse(payload);
if (!result.success) {
  return { status: 400, errors: result.error.issues };
}
```

### `src/app/api/discovery-runs/[id]/events/route.ts` (route, streaming)

**Analog:** none in codebase  
**Fallback source:** `.planning/phases/01-discovery-targeting-and-runs/01-RESEARCH.md:232-245`

**SSE route pattern**:
```typescript
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("event: ready\\ndata: ok\\n\\n"));
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
```

### `src/server/queue/client.ts` and `src/server/queue/worker.ts` (config/service, event-driven)

**Analog:** none in codebase  
**Fallback source:** `.planning/phases/01-discovery-targeting-and-runs/01-RESEARCH.md:252-266`

**Queue event subscription pattern**:
```typescript
import { QueueEvents } from "bullmq";

const queueEvents = new QueueEvents("discovery-runs");

queueEvents.on("completed", ({ jobId }) => {
  // mark run complete
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  // mark run failed
});

queueEvents.on("progress", ({ jobId, data }) => {
  // update progress counters
});
```

### `src/server/discovery/quality-gate.ts` and `src/server/db/repositories/discovery-candidates.repository.ts` (service/model, transform + CRUD)

**Analog:** none in codebase  
**Fallback source:** `.planning/phases/01-discovery-targeting-and-runs/01-RESEARCH.md:181-186`

**Canonical domain key pattern**:
```typescript
import { parse } from "tldts";

export function canonicalDomainKey(input: string): string | null {
  const parsed = parse(input, { allowPrivateDomains: true });
  return parsed.domain ?? null;
}
```

### Remaining Files

Apply the shared patterns below by role:
- UI components/pages: consume SSE stream and render incremental counters/results.
- Orchestrator/providers/platform-filter: event-driven queue workflow + deterministic filtering.
- Repositories/schema: durable counters and dedupe keys based on canonical domain.
- Tests/config: align with Wave 0 test files and commands in research (`01-RESEARCH.md:340-359`).

## Shared Patterns

### Input Validation
**Source:** `.planning/phases/01-discovery-targeting-and-runs/01-RESEARCH.md:152-161`, `:272-275`  
**Apply to:** all POST/PATCH discovery routes (`start`, `stop`, filters)
```typescript
import { z } from "zod";
// shared schema + safeParse at request boundary
```

### Event-Driven Run Lifecycle
**Source:** `.planning/phases/01-discovery-targeting-and-runs/01-RESEARCH.md:252-266`  
**Apply to:** orchestrator, queue client, worker, progress updates
```typescript
import { QueueEvents } from "bullmq";
queueEvents.on("progress", ({ jobId, data }) => {
  // persist counters, then expose to stream
});
```

### Streaming Progress Transport
**Source:** `.planning/phases/01-discovery-targeting-and-runs/01-RESEARCH.md:232-245`  
**Apply to:** `src/app/api/discovery-runs/[id]/events/route.ts`, run monitor UI
```typescript
return new Response(stream, {
  headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
});
```

### Domain Normalization + Dedupe Gate
**Source:** `.planning/phases/01-discovery-targeting-and-runs/01-RESEARCH.md:181-186`  
**Apply to:** provider outputs before candidate insert/upsert
```typescript
const parsed = parse(input, { allowPrivateDomains: true });
return parsed.domain ?? null;
```

## No Analog Found

All 24 planned files currently have no in-repo code analog because the repository has no implementation source files yet (only planning/docs artifacts).

Planner should use:
1. The fallback snippets above (from `01-RESEARCH.md`).
2. The recommended project structure in `01-RESEARCH.md:118-145`.
3. Locked behavior decisions in `01-CONTEXT.md:16-35`.

## Metadata

**Analog search scope:** repository root (`.`), attempted source domains: `src/**`, `app/**`, `server/**`, `tests/**`  
**Files scanned:** 14 tracked non-git files (`rg --files --hidden -g '!.git'`)  
**Pattern extraction date:** 2026-04-17
