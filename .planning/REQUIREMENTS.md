# Requirements: Leadvero

**Defined:** 2026-04-17
**Core Value:** Surface high-opportunity leads from public data with enough evidence to send personalized outreach confidently.

## v1 Requirements

### Discovery

- [ ] **DISC-01**: User can define lead discovery criteria by niche/keyword, country, city, and language
- [ ] **DISC-02**: User can filter target stack as WordPress, Shopify, or both
- [ ] **DISC-03**: User can start a discovery run that returns candidate public business domains
- [ ] **DISC-04**: User can view discovery run progress and total discovered domains

### Scanning

- [ ] **SCAN-01**: User can run a lightweight scan limited to approved public page types (homepage, contact, about, blog index, and limited service/product pages)
- [ ] **SCAN-02**: User can see per-domain scan status including successes, partials, and failures
- [ ] **SCAN-03**: User can scan domains with polite rate limits and bounded retries to avoid aggressive crawling behavior

### Signals

- [ ] **SIG-01**: User can view detected CMS/ecommerce platform (WordPress, Shopify, or other)
- [ ] **SIG-02**: User can view core SEO and technical signals (title, meta description, H1, sitemap, robots, schema)
- [ ] **SIG-03**: User can view quality and contactability signals (blog presence, analytics/tag manager presence, contact page/form/public email)
- [ ] **SIG-04**: User can view concise opportunity notes derived from extracted signals

### Scoring

- [ ] **SCORE-01**: User can view lead subscores for fit, opportunity, commercial potential, and contactability
- [ ] **SCORE-02**: User can view a total score from 0-100 with factor-level explanation
- [ ] **SCORE-03**: User can sort and filter leads by total score and score dimensions

### Lead Workspace

- [ ] **LEAD-01**: User can view a lead dashboard with domain, location, platform, score, and review status
- [ ] **LEAD-02**: User can open a lead detail view with extracted signals, notes, and scoring rationale
- [ ] **LEAD-03**: User can mark leads as reviewed, qualified, or rejected
- [ ] **LEAD-04**: User can add private notes to each lead

### Outreach Assistance

- [ ] **OUTR-01**: User can generate a personalized outreach hook based on detected opportunity signals
- [ ] **OUTR-02**: User can generate a suggested service offer aligned to the lead's likely needs
- [ ] **OUTR-03**: User can generate a first-draft outreach message for email or LinkedIn
- [ ] **OUTR-04**: User can regenerate outreach drafts while preserving previous generated variants for review

### Export

- [ ] **EXPT-01**: User can export selected leads to CSV including scoring and core lead metadata
- [ ] **EXPT-02**: User can include outreach fields (hook, offer, draft) in CSV export
- [ ] **EXPT-03**: User can view export history metadata (who, when, and record count)

## v2 Requirements

### Integrations and Scale

- **INTG-01**: User can sync qualified leads to external CRM tools
- **INTG-02**: User can run team collaboration workflows with assignments and comments
- **INTG-03**: User can define reusable saved search templates and recurring scans
- **INTG-04**: User can track outreach outcomes and basic conversion analytics

## Out of Scope

| Feature | Reason |
|---------|--------|
| Automatic mass email sending | Conflicts with quality-first positioning and anti-spam intent |
| Full CRM replacement | Expands scope beyond MVP qualification workflow |
| Deep full-site crawling | Not required for MVP signal extraction and increases risk/cost |
| Private or gated data scraping | Outside legal/ethical boundaries for this product |
| Paid third-party enrichment dependency | Unnecessary cost and operational dependency for first release |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DISC-01 | TBD | Pending |
| DISC-02 | TBD | Pending |
| DISC-03 | TBD | Pending |
| DISC-04 | TBD | Pending |
| SCAN-01 | TBD | Pending |
| SCAN-02 | TBD | Pending |
| SCAN-03 | TBD | Pending |
| SIG-01 | TBD | Pending |
| SIG-02 | TBD | Pending |
| SIG-03 | TBD | Pending |
| SIG-04 | TBD | Pending |
| SCORE-01 | TBD | Pending |
| SCORE-02 | TBD | Pending |
| SCORE-03 | TBD | Pending |
| LEAD-01 | TBD | Pending |
| LEAD-02 | TBD | Pending |
| LEAD-03 | TBD | Pending |
| LEAD-04 | TBD | Pending |
| OUTR-01 | TBD | Pending |
| OUTR-02 | TBD | Pending |
| OUTR-03 | TBD | Pending |
| OUTR-04 | TBD | Pending |
| EXPT-01 | TBD | Pending |
| EXPT-02 | TBD | Pending |
| EXPT-03 | TBD | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 0
- Unmapped: 25 ⚠

---
*Requirements defined: 2026-04-17*
*Last updated: 2026-04-17 after initial definition*
