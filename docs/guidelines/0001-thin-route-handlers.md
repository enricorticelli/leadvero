# GL-0001: Keep App Router handlers thin

- Status: active
- Date: 2026-04-17

## Scope

`src/app/api/**/*.ts` and server-side orchestration modules under `src/server`.

## Rule

Keep route handlers focused on HTTP concerns and delegate business logic, crawling, scoring, and persistence orchestration to `src/server` modules.

## Rationale

This keeps the App Router layer small and makes domain logic reusable from workers and tests.

## Examples

Good:

```ts
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(await generateOutreachForLead(id), { status: 201 });
}
```

Avoid:

```ts
export async function POST(req: NextRequest) {
  // route handler performs crawling, scoring, and multi-step persistence inline
}
```

## Evidence

- `src/app/api/leads/[id]/outreach/route.ts:2` and `src/app/api/leads/[id]/outreach/route.ts:10` delegate to `generateOutreachForLead`.
- `src/app/api/searches/[id]/route.ts:8-23` limits the handler to query and response shaping.
- `src/server/jobs/runner.ts:35-192` contains the multi-step search pipeline outside the route layer.
- `README.md:67-79` documents the split between `src/app` and `src/server`.
