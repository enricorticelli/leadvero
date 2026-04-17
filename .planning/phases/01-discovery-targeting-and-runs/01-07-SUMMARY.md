---
phase: 01-discovery-targeting-and-runs
plan: 07
subsystem: ui
tags: [nextjs,sse,ui,regression-test]
requires:
  - phase: 01-discovery-targeting-and-runs
    provides: discovery SSE and page wiring from prior plans
provides:
  - Candidate list included in SSE payload
  - UI retains candidate list visibility after terminal states
affects: [01-discovery-targeting-and-runs]
tech-stack:
  added: []
  patterns: [stream payload includes display-ready collection, client keeps terminal state data]
key-files:
  created: []
  modified:
    - src/app/api/discovery-runs/[id]/events/route.ts
    - src/app/(discovery)/page.tsx
    - src/app/(discovery)/components/CandidateList.tsx
    - tests/api/discovery-runs.progress.test.ts
    - tests/ui/discovery-flow.smoke.test.ts
key-decisions:
  - "Expose candidates in SSE payload and consume them directly in page state updates."
patterns-established:
  - "Keep client-side candidate state when EventSource closes on terminal status."
requirements-completed: [DISC-03, DISC-04]
duration: 10min
completed: 2026-04-17
---

# Phase 1 Plan 07 Summary

**Closed candidate visibility gap by emitting candidates in SSE payload and validating client rendering hooks.**

## Performance
- **Duration:** 10 min
- **Started:** 2026-04-17T12:48:00Z
- **Completed:** 2026-04-17T12:48:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Updated discovery events endpoint to include `candidates` and `stoppedAt` in stream data.
- Preserved client candidate state update path (`next.candidates` -> `setCandidates`) for UI visibility.
- Extended API/UI regression checks to assert candidate payload and rendering markers.

## Task Commits
1. **Task 1: Emit candidates in discovery run SSE payload** - not committed in this run
2. **Task 2: Keep candidates visible in UI during and after terminal states** - not committed in this run

## Files Created/Modified
- `src/app/api/discovery-runs/[id]/events/route.ts` - adds `listCandidates(run.id)` and emits `candidates` in SSE payload
- `tests/api/discovery-runs.progress.test.ts` - validates stream response contains `"candidates":`
- `tests/ui/discovery-flow.smoke.test.ts` - validates candidate rendering markers in discovery page/components
- `src/app/(discovery)/page.tsx` - existing candidate state update path validated
- `src/app/(discovery)/components/CandidateList.tsx` - existing render/fallback paths validated

## Decisions Made
- Candidate visibility is solved in the existing event channel rather than adding separate polling APIs.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
- Local test execution in this shell is still blocked by environment dependency mismatch (`Cannot find module @rollup/rollup-linux-x64-gnu`).

## User Setup Required
- Reinstall dependencies in a single runtime context (PowerShell Windows or Linux shell, not mixed) before rerunning tests.

## Next Phase Readiness
- Candidate visibility fix is implemented and ready for UAT re-check.
- Re-run `$gsd-verify-work 1` and validate Test 6 candidate rendering.
