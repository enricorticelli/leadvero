# Phase 1: Discovery Targeting and Runs - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the discovery entrypoint: users define targeting criteria and launch discovery runs that return candidate public business domains with visible progress. It does not include scanning, signal extraction, scoring, or outreach generation.

</domain>

<decisions>
## Implementation Decisions

### Input scope
- **D-01:** Discovery requires `keyword/niche` and `country`; `city` and `language` remain optional filters.
- **D-02:** Target platform filter is explicit and required at run setup: `WordPress`, `Shopify`, or `Both`.

### Source mix
- **D-03:** v1 uses a blended internal set of public sources; the UI does not expose per-source toggles.
- **D-04:** Discovery should prioritize relevance over volume and avoid low-value bulk expansion behavior.

### Quality gate
- **D-05:** Candidate output applies a basic quality gate before display: domain deduplication, canonical root normalization, and obvious non-business/parked domain suppression.
- **D-06:** Near-duplicate domains should be collapsed when they represent the same business target.

### Run workflow
- **D-07:** Discovery runs execute asynchronously with live progress updates and incremental result visibility.
- **D-08:** User can stop an in-flight run; completed/aborted run metadata remains visible for traceability.

### the agent's Discretion
- Exact provider weighting and ranking heuristic composition can be decided during planning/research, as long as the quality-first principle is preserved.
- Internal persistence details for run history are open to implementation choice.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and requirements
- `.planning/ROADMAP.md` — Phase 1 goal, requirement mapping, and success criteria
- `.planning/REQUIREMENTS.md` — DISC-01 through DISC-04 definitions and constraints
- `.planning/PROJECT.md` — product principles, non-negotiables, and out-of-scope boundaries

### Product baseline
- `README.md` — MVP behavior expectations and lead-discovery framing

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet. No implementation code or component library exists in the repository at this stage.

### Established Patterns
- Planning-first workflow is established via `.planning/*` artifacts before execution begins.

### Integration Points
- New discovery implementation will define the initial application/module structure for later phases to build on.

</code_context>

<specifics>
## Specific Ideas

- Discovery result rows should prioritize immediate qualification fields: domain, inferred country/location, inferred platform target, and discovery source confidence indicator.
- Progress should expose at least total candidates discovered and current run status state.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 01-discovery-targeting-and-runs*
*Context gathered: 2026-04-17*
