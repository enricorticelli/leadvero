# ADR-0004: Integrate SerpAPI for discovery and Anthropic for outreach

- Status: accepted
- Date: 2026-04-17

## Context

Leadvero needs a repeatable source of search-engine candidates and an AI provider for personalized outreach generation.

## Decision

Use SerpAPI for Google result acquisition during discovery and Anthropic for outreach draft generation.

## Consequences

Both integrations are optional at startup but required at the point of use.
Discovery and outreach flows must handle upstream failures and malformed provider responses.
Environment configuration must carry external provider credentials and model selection.

## Evidence

- `README.md:13-14` lists SerpAPI and Anthropic as prerequisites.
- `src/server/discovery/index.ts:26-28` defaults discovery queries to `serpSearch`.
- `src/server/discovery/serpapi.ts:30`, `src/server/discovery/serpapi.ts:47`, `src/server/discovery/serpapi.ts:51-61`, and `src/server/discovery/serpapi.ts:80` define the SerpAPI endpoint, credential use, and retry policy.
- `src/server/outreach/claude.ts:8`, `src/server/outreach/claude.ts:13-16`, `src/server/outreach/claude.ts:44-50`, and `src/server/outreach/claude.ts:62-65` define the Anthropic client, prompt contract, prompt caching call, and JSON extraction.
- `src/server/outreach/generator.ts:60-72` validates and persists generated drafts with the configured model and prompt version.
- `src/server/env.ts:5-7` and `.env.example:2-4` define the provider keys and model selection.
