# Leadvero

Lead discovery and qualification tool for freelancers selling SEO, WordPress, and Shopify services.

Leadvero compresses the manual prospecting workflow (search → open site → inspect CMS → check SEO → write message) into a repeatable system: enter a niche and location, get a scored shortlist of companies worth contacting, with AI-generated outreach drafts in Italian.

## Setup

### Prerequisites

- Node.js 20+
- SerpAPI account ([serpapi.com](https://serpapi.com)) — free tier: 100 searches/month

### First-time setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in SERPAPI_KEY

# 3. Create the database and seed fixture data
npx prisma migrate dev
```

### Run everything with one command

```bash
npm run dev:up
```

This single command:
1. Syncs the database schema to `leadvero.db` (`prisma db push`)
2. Seeds 3 fixture leads if the DB is empty
3. Starts Next.js dev server at [http://localhost:3000](http://localhost:3000)
4. Starts the background job worker

Stop with `Ctrl+C`.

### Manual startup (alternative)

```bash
npm run db:push   # sync schema (idempotent)
npm run db:seed   # optional fixture data
npm run dev       # Next.js
npm run worker    # job worker (second terminal)
```

## Usage

1. Open [http://localhost:3000](http://localhost:3000)
2. Fill in the search form (niche, city, platform target)
3. Click **Lancia ricerca** — the worker picks up the job in the background
4. Watch progress on the status page — redirects to lead list when done
5. Browse `/leads`, filter by score / CMS / email availability
6. Click a lead → generate AI outreach → mark status → export CSV

## Project structure

```
src/
  app/                   Next.js App Router pages + API routes
    api/searches/        POST create search job, GET list/status
    api/leads/           GET list with filters, GET detail, POST status, POST outreach, GET export CSV
    page.tsx             Search form
    searches/[id]/       Job progress page
    leads/               Lead list with filters
    leads/[id]/          Lead detail + outreach generator
  server/
    discovery/           SerpAPI client, query builder, domain normalizer
    crawl/               Fetcher, parser, CMS/SEO/contact/quality detectors, site-scan orchestrator
    scoring/             Fit, opportunity, commercial, contactability — configurable weights
    outreach/            Claude API wrapper + prompt-cached generator
    jobs/                Runner (per-job logic) + worker (polling loop)
    db/                  Prisma singleton
    env.ts               Zod-validated env
prisma/
  schema.prisma          SearchJob · Lead · ScanResult · LeadAnalysisRun
tests/
  discovery/             normalize, query-builder, discover orchestrator
  crawl/detect/          cms, seo, contact, quality
  scoring/               fit, opportunity, contactability, aggregate
  outreach/              Claude contract test (mocked)
```

## Scoring model

Each lead receives a score 0–100 weighted as:

| Component | Weight | What it measures |
|---|---|---|
| Fit | 30% | CMS match, language, country |
| Opportunity | 35% | Missing/weak SEO signals |
| Commercial | 20% | Signs of an active real business |
| Contactability | 15% | Email, phone, form, contact page |

Weights are editable in [src/server/scoring/config.ts](src/server/scoring/config.ts).

## Development

```bash
npm test          # run all unit tests
npm run typecheck # TypeScript check
npm run lint      # ESLint
npm run db:studio # Prisma Studio (visual DB browser)
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | No | SQLite file path — defaults to `file:./leadvero.db` |
| `SERPAPI_KEY` | Yes | SerpAPI key for Google search |
| `LEADVERO_USER_AGENT` | No | Crawler User-Agent string |
| `SESSION_SECRET` | No | JWT signing secret — auto-generated in desktop app |

## Desktop distribution

To build the macOS `.dmg` installer (requires a Mac):

```bash
npm run dist
```

See [docs/runbook/0003-build-macos-dmg.md](docs/runbook/0003-build-macos-dmg.md) for the full procedure.

## Compliance notes

Leadvero crawls only publicly accessible pages, respects `robots.txt`, applies a 1 req/sec per-host rate limit, and caps body reads at 2MB. It does not bypass login walls, gated content, or platform ToS restrictions. The user is responsible for outreach compliance with applicable regulations (GDPR, CAN-SPAM, etc.).
