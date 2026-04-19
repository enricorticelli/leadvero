# ADR-0007: Cookie-based JWT session auth with role flags

- Status: accepted
- Date: 2026-04-19

## Context

Leadvero is a single-operator tool that is starting to be shared with occasional collaborators. We need to gate access to the app and distinguish administrators (who manage users) from regular users (who work on leads). There is no external identity provider, no multi-tenant model, and no requirement for SSO or password recovery flows at this stage.

## Decision

Authentication is handled in-app with an HTTP-only cookie carrying a JWT (HS256, signed via `jose`). Passwords are hashed with `bcryptjs` at cost 10. Sessions carry `userId`, `username`, `role` and `mustChangePassword`, and expire after 7 days.

Authorization is expressed by a single enum `role ∈ {admin, user}`. Admins can manage users. All non-public routes are protected by `src/middleware.ts`, which verifies the JWT on the edge. Server-side helpers (`requireSession`, `requireAdmin`) enforce the contract at route-handler level and allow DB-backed user lookups.

A default `admin/admin` user is seeded on first run with `mustChangePassword = true`. The middleware forces any user with that flag to `/profile` until they rotate their password.

## Alternatives considered

- **NextAuth/Auth.js**: heavier dependency surface and database adapters for features we don't need (OAuth, email flows). Not worth the footprint for one admin plus a handful of users.
- **Server-side session store (DB-backed sessions)**: more flexible (revocation, server-controlled lifetime) but adds a session table, polling cost, and migration effort. JWT with a 7-day window is acceptable while the user count is small; we can switch later without changing callers because `getSession()` is the only entry point.
- **Granular permissions**: the product scope today only distinguishes "can manage users" from "cannot". A single boolean role is enough and avoids premature abstraction; a `permissions: string[]` upgrade can replace it without API changes if needs grow.

## Consequences

- `SESSION_SECRET` becomes a required configuration value (via `src/server/env.ts`); the default is an insecure dev placeholder flagged in `.env.example`.
- Sessions cannot be revoked server-side before expiry; password change re-issues the cookie but old tokens remain valid for their TTL. Acceptable risk at current scope.
- The Prisma client is not imported from the edge middleware: an edge-safe module (`src/server/auth/jwt.ts`) holds the JWT primitives; Node-only helpers (`src/server/auth/session.ts`, `password.ts`) stay in route handlers and server components.
- Default credentials (`admin/admin`) are convenient for first boot but require `mustChangePassword` enforcement to avoid leaving a trivially-guessable production admin.
