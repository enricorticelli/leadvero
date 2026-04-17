# Leadvero

## What This Is

Leadvero is a lead discovery and qualification platform for freelancers and small agencies selling SEO, WordPress, and Shopify services. It discovers public websites, runs lightweight scans, extracts practical technical and content signals, and prioritizes leads by business opportunity. The product helps users move from manual prospecting to repeatable, high-quality outbound with better personalization.

## Core Value

Surface high-opportunity leads from public data with enough evidence to send personalized outreach confidently.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Users can discover relevant business domains from niche and geography filters
- [ ] Users can qualify leads with lightweight technical and SEO signals
- [ ] Users can prioritize leads with transparent scoring and generate outreach drafts

### Out of Scope

- Automatic mass outreach sending — conflicts with quality-first and anti-spam positioning
- Deep full-site crawling — not required for MVP qualification and increases operational risk
- Private or gated data scraping — outside product ethics and compliance guardrails
- Full CRM replacement — not needed for MVP and increases complexity

## Context

Lead generation is currently manual and slow for the target users. Existing workflow requires opening many sites one by one, checking platform and SEO quality manually, and drafting custom outreach from scratch. The project intentionally focuses on public data, lightweight scans, and human-reviewed outreach rather than scraping at scale. MVP scope emphasizes discovery, signal extraction, scoring, lead review, CSV export, and AI-assisted draft generation.

## Constraints

- **Data Policy**: Public web data only — maintain legal and ethical boundaries
- **Crawling Scope**: Lightweight page sampling — keep scans fast and low impact
- **Product Scope**: Qualification-first MVP — avoid CRM-like expansion before validation
- **Outreach Policy**: Human review required — no autonomous bulk outreach
- **Cost Discipline**: Avoid expensive third-party enrichment dependencies in v1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Focus on quality over quantity for leads | Target users need conversion, not large unqualified lists | — Pending |
| Restrict to public signals and lightweight scans | Reduce risk, cost, and operational complexity | — Pending |
| Include AI-assisted outreach drafts in MVP | Personalized first contact is core user workflow | — Pending |
| Exclude mass email automation from MVP | Preserve compliance and positioning as non-spam tool | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-17 after initialization*
