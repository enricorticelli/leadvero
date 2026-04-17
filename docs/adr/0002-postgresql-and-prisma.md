# ADR-0002: Use PostgreSQL with Prisma

- Status: accepted
- Date: 2026-04-17

## Context

Leadvero stores search jobs, discovered leads, page scans, and outreach drafts as relational data with lifecycle state and foreign-key relationships.

## Decision

Use PostgreSQL as the primary datastore and Prisma as the application ORM and schema definition layer.

## Consequences

The data model is expressed centrally in `prisma/schema.prisma`.
Development relies on a local PostgreSQL container and Prisma schema sync and seed commands.
Application code reads and writes through a shared Prisma client.

## Evidence

- `prisma/schema.prisma:6-7` configures a PostgreSQL datasource from `DATABASE_URL`.
- `prisma/schema.prisma:43`, `prisma/schema.prisma:68`, `prisma/schema.prisma:121`, and `prisma/schema.prisma:141` define the core persisted models.
- `package.json:11-14` and `package.json:24` and `package.json:42` declare Prisma scripts and dependencies.
- `docker-compose.yml:3` and `docker-compose.yml:7-13` provision local Postgres 16 with a persistent volume.
- `src/server/db/prisma.ts:8-14` instantiates and reuses a Prisma client singleton.
