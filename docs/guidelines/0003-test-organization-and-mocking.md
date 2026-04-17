# GL-0003: Organize tests by subsystem and mock external boundaries

- Status: active
- Date: 2026-04-17

## Scope

Unit tests under `tests/` for discovery, crawl, scoring, and outreach modules.

## Rule

Place tests under `tests/<subsystem>/...` and mock databases, providers, and environment access instead of depending on live infrastructure.

## Rationale

The current suite is structured around server subsystems and keeps tests deterministic by mocking unstable or paid dependencies.

## Examples

Good:

```ts
vi.mock("@/server/outreach/claude", () => ({ generateOutreach: mockGenerate }));
vi.mock("@/server/db/prisma", () => ({ prisma: mockedPrisma }));
```

Avoid:

```ts
it("hits the real provider", async () => {
  // depends on external API credentials and network
});
```

## Evidence

- `vitest.config.ts:7` includes `tests/**/*.test.ts` as the test suite root.
- `README.md:82-94` documents tests grouped by subsystem.
- `tests/discovery/discover.test.ts:4-13` drives discovery with mocked search results.
- `tests/discovery/discover.test.ts:58` passes explicit existing domains instead of touching the database.
- `tests/outreach/generator.test.ts:5`, `tests/outreach/generator.test.ts:9`, and `tests/outreach/generator.test.ts:41` mock Claude, Prisma, and env access.
