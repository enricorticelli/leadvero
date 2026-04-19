# R-0002: Access runtime configuration through the env module

- Status: enforced
- Date: 2026-04-17

## Rule

Load application configuration and provider keys through `src/server/env.ts`; do not read integration secrets ad hoc from call sites.

## Why

Centralized parsing keeps defaults, validation, and provider-specific failure messages consistent across the codebase.

## Enforcement

Runtime validation in `env()` plus code review for new integrations.

## Evidence

- `src/server/env.ts:3-10` defines the supported environment contract.
- `src/server/env.ts:19-27` validates the environment through a single `safeParse` call.
- `src/server/env.ts:31-39` exposes `requireSerpApi()` and `requireAnthropic()` helpers.
- `src/server/discovery/serpapi.ts:1` and `src/server/discovery/serpapi.ts:47` obtain the SerpAPI key through the env helper.
- `src/server/outreach/claude.ts:1` and `src/server/outreach/claude.ts:8` obtain the Anthropic key through the env helper.
- `.env.example:1-5` publishes the supported local configuration surface.
