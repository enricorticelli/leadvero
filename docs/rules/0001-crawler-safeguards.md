# R-0001: Crawler safeguards are mandatory

- Status: enforced
- Date: 2026-04-17

## Rule

All outbound crawl requests must respect `robots.txt`, apply per-host throttling, enforce request timeouts, and cap HTML body size.

## Why

Leadvero scans public websites at scale. Safety limits reduce operational risk, avoid abusive request patterns, and keep scans bounded.

## Enforcement

Runtime behavior in `src/server/crawl/fetcher.ts`; code review for any crawler changes.

## Evidence

- `src/server/crawl/fetcher.ts:4-7` defines timeout, body cap, redirect cap, and rate-limit constants.
- `src/server/crawl/fetcher.ts:12-17` throttles by host.
- `src/server/crawl/fetcher.ts:20-35` fetches and caches `robots.txt`.
- `src/server/crawl/fetcher.ts:67-69` blocks disallowed URLs.
- `src/server/crawl/fetcher.ts:79` applies the request timeout.
- `src/server/crawl/fetcher.ts:122` enforces the body-size cap.
- `README.md:124` documents the same compliance constraints.
