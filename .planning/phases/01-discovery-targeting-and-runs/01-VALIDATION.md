---
phase: 1
slug: discovery-targeting-and-runs
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 1 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 (+ Playwright 1.59.1 for browser flows) |
| **Config file** | none - Wave 0 installs |
| **Quick run command** | `npx vitest run --passWithNoTests tests/discovery tests/api/discovery-runs` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --passWithNoTests tests/discovery tests/api/discovery-runs`
- **After every plan wave:** Run `npx vitest run`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | DISC-01 | T-1-01 | Reject invalid required/optional criteria payloads | unit | `npx vitest run tests/discovery/input-schema.test.ts -t "validates required fields"` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | DISC-02 | T-1-02 | Enforce platform enum (`wordpress|shopify|both`) | unit | `npx vitest run tests/discovery/platform-filter.test.ts -t "accepts wordpress shopify both"` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | DISC-03 | T-1-03 | Start run persists metadata and enqueues async job once | integration | `npx vitest run tests/api/discovery-runs.start.test.ts` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | DISC-04 | T-1-04 | Progress endpoint yields increasing discovered counters | integration | `npx vitest run tests/api/discovery-runs.progress.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` scripts: `test`, `test:quick`, `test:e2e`
- [ ] `vitest.config.ts` baseline config
- [ ] `playwright.config.ts` baseline config
- [ ] `tests/discovery/input-schema.test.ts`
- [ ] `tests/discovery/platform-filter.test.ts`
- [ ] `tests/api/discovery-runs.start.test.ts`
- [ ] `tests/api/discovery-runs.progress.test.ts`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live progress stream perceived as real-time in UI | DISC-04 | SSE UX quality and timing are browser/runtime dependent | Start a run, keep monitor open 2+ minutes, confirm progressive counter updates and no frozen state |
| Stop-run control latency under active load | DISC-03, DISC-04 | Requires realistic queue/worker timing and infra behavior | Start run with high candidate volume, trigger stop, verify status transitions and no new candidate writes post-stop |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
