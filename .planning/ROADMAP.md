# Roadmap: Leadvero

## Overview

Leadvero ships as a qualification-first workflow: discover relevant public business domains, run bounded scans, extract actionable signals, prioritize leads transparently, manage review decisions, then generate and export personalized outreach artifacts.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Discovery Targeting and Runs** - Define who to target and produce candidate public domains.
- [ ] **Phase 2: Lightweight Scan Execution** - Scan discovered domains safely and track per-domain outcomes.
- [ ] **Phase 3: Signal Extraction and Opportunity Notes** - Surface platform, SEO, and contactability evidence for each lead.
- [ ] **Phase 4: Scoring and Prioritization** - Rank leads with transparent factor-based scoring.
- [ ] **Phase 5: Lead Review Workspace** - Let users review, decide, and annotate leads in one workspace.
- [ ] **Phase 6: Outreach Drafting and Export** - Generate outreach variants and export selected leads with audit metadata.

## Phase Details

### Phase 1: Discovery Targeting and Runs
**Goal**: Users can define their target market and generate candidate public domains to evaluate.
**Depends on**: Nothing (first phase)
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04
**Success Criteria** (what must be TRUE):
  1. User can set discovery criteria by niche/keyword, country, city, and language.
  2. User can target WordPress, Shopify, or both before running discovery.
  3. User can start a discovery run and receive candidate public business domains.
  4. User can monitor discovery progress and total discovered domains while the run is active.
**Plans**: 3 plans
Plans:
- [ ] 01-01-PLAN.md - Bootstrap contracts, persistence schema, and quality gate foundation
- [ ] 01-02-PLAN.md - Implement async discovery run lifecycle APIs, worker pipeline, and SSE progress
- [ ] 01-03-PLAN.md - Deliver discovery UI flow with live run monitoring and end-to-end coverage
**UI hint**: yes

### Phase 2: Lightweight Scan Execution
**Goal**: Users can run compliant, bounded scans against discovered domains and see reliable scan outcomes.
**Depends on**: Phase 1
**Requirements**: SCAN-01, SCAN-02, SCAN-03
**Success Criteria** (what must be TRUE):
  1. User can run scans that are limited to approved public page types only.
  2. User can see per-domain scan status as success, partial, or failure.
  3. User can observe that failed scans settle after bounded retries instead of aggressive repeated crawling.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Signal Extraction and Opportunity Notes
**Goal**: Users can inspect evidence-rich technical and business signals for each scanned domain.
**Depends on**: Phase 2
**Requirements**: SIG-01, SIG-02, SIG-03, SIG-04
**Success Criteria** (what must be TRUE):
  1. User can view detected platform type for each lead (WordPress, Shopify, or other).
  2. User can view core SEO and technical signals including title, meta description, H1, sitemap, robots, and schema.
  3. User can view quality and contactability signals including blog presence, analytics/tag manager, and contact channels.
  4. User can view concise opportunity notes derived from extracted signals.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Scoring and Prioritization
**Goal**: Users can understand why leads rank as they do and prioritize who to contact first.
**Depends on**: Phase 3
**Requirements**: SCORE-01, SCORE-02, SCORE-03
**Success Criteria** (what must be TRUE):
  1. User can view subscores for fit, opportunity, commercial potential, and contactability.
  2. User can view a total score from 0-100 with factor-level explanation.
  3. User can sort and filter leads using total score and score dimensions.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Lead Review Workspace
**Goal**: Users can review leads end-to-end, make qualification decisions, and keep internal context per lead.
**Depends on**: Phase 4
**Requirements**: LEAD-01, LEAD-02, LEAD-03, LEAD-04
**Success Criteria** (what must be TRUE):
  1. User can view a lead dashboard showing domain, location, platform, score, and review status.
  2. User can open lead detail to inspect extracted signals, opportunity notes, and scoring rationale.
  3. User can mark leads as reviewed, qualified, or rejected.
  4. User can add private notes per lead and see them when revisiting that lead.
**Plans**: TBD
**UI hint**: yes

### Phase 6: Outreach Drafting and Export
**Goal**: Users can prepare personalized outreach variants and export selected leads with complete context.
**Depends on**: Phase 5
**Requirements**: OUTR-01, OUTR-02, OUTR-03, OUTR-04, EXPT-01, EXPT-02, EXPT-03
**Success Criteria** (what must be TRUE):
  1. User can generate a personalized outreach hook and a suggested service offer based on lead signals.
  2. User can generate a first-draft outreach message for email or LinkedIn.
  3. User can regenerate outreach while preserving earlier generated variants for comparison.
  4. User can export selected leads to CSV with scoring, core metadata, and outreach fields.
  5. User can view export history showing who exported, when, and how many records were included.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Discovery Targeting and Runs | 0/TBD | Not started | - |
| 2. Lightweight Scan Execution | 0/TBD | Not started | - |
| 3. Signal Extraction and Opportunity Notes | 0/TBD | Not started | - |
| 4. Scoring and Prioritization | 0/TBD | Not started | - |
| 5. Lead Review Workspace | 0/TBD | Not started | - |
| 6. Outreach Drafting and Export | 0/TBD | Not started | - |
