# GL-0002: Validate API inputs with local Zod schemas

- Status: active
- Date: 2026-04-17

## Scope

App Router request handlers that accept JSON payloads.

## Rule

Define a route-local Zod schema, parse the request body once, return `400` for malformed JSON, and return `422` for schema validation failures.

## Rationale

The repository already distinguishes transport errors from shape validation errors. Keeping that pattern consistent simplifies client behavior and test coverage.

## Examples

Good:

```ts
const parsed = schema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
}
```

Avoid:

```ts
const body = await req.json();
// use body directly without validation
```

## Evidence

- `src/app/api/searches/route.ts:5-15` declares a route-local Zod schema.
- `src/app/api/searches/route.ts:25` returns `400` for malformed JSON.
- `src/app/api/searches/route.ts:28-32` validates with `safeParse` and returns `422` on schema errors.
- `src/app/api/leads/[id]/status/route.ts:5-8` defines a route-local schema for lead updates.
- `src/app/api/leads/[id]/status/route.ts:16-18` repeats the `safeParse` plus `422` pattern.
