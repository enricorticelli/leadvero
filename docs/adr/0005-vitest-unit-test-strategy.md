# ADR-0005: Use Vitest for server-side unit tests

- Status: accepted
- Date: 2026-04-17

## Context

The repository contains domain logic and integrations that can be exercised independently from the Next.js runtime. Fast unit tests are needed for discovery, crawling heuristics, scoring, and outreach orchestration.

## Decision

Use Vitest as the test runner for Node-based unit tests and mock external boundaries such as providers, database access, and environment access.

## Consequences

Tests run without browser or database bootstrapping.
Subsystems are tested independently with explicit mocks at the edges.
New server modules should remain testable under a plain Node test environment.

## Evidence

- `package.json:17-18` defines the Vitest run and watch scripts.
- `package.json:46` depends on `vitest`.
- `vitest.config.ts:6-7` runs tests in a Node environment and includes `tests/**/*.test.ts`.
- `tests/discovery/discover.test.ts:4-13` exercises discovery behavior with mocked search results.
- `tests/discovery/discover.test.ts:58` injects `existingDomains` instead of relying on a real database.
- `tests/outreach/generator.test.ts:5`, `tests/outreach/generator.test.ts:9`, `tests/outreach/generator.test.ts:41`, and `tests/outreach/generator.test.ts:71` mock Claude, Prisma, and env access and assert validation failures.
