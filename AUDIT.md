# Trust audit — FERRP (Financial Event Radar / Market Impact Platform)

Built by Google Gemini (AI Studio), imported here on 2026-08-20 for review
before any of its claims are relied on. This file is the record of what an
independent audit actually found — read it before trusting any "PASS",
"verified", or "leakage-free" indicator in the UI.

## Verdict

A real, well-built full-stack prototype — genuine Express backend
(`server.ts`), genuine FRED/Finnhub/Yahoo proxy calls, a genuine Gemini API
call for its "agent council," and real statistics code (`src/lib/statMath.ts`
has a legitimate t-test, Pearson correlation, and OLS with Cook's distance).

But the claims that matter most for trading use — **zero-leakage**,
**100% verified**, **walk-forward validated** — are largely theater sitting
on top of real math applied to a ~70-row hand-typed fixture set, in one case
not even wired to the real computation at all. Treat this as a polished
research-UI prototype, not an analytical platform whose PASS badges mean
anything yet.

## What's real

- Real backend with live external calls: ALFRED/FRED proxy
  (`server.ts:164-227`), Finnhub + Yahoo quote proxy (`server.ts:235-321`),
  a real Gemini completion for the "agent council" (`server.ts:864-910`).
- `src/lib/statMath.ts` — genuine incomplete-beta-function t-test, Pearson
  correlation, OLS with leverage/Cook's distance (`:59-235`).
- `src/utils/walkForwardValidation.ts` — the train/val/holdout chronological
  split mechanics are correctly implemented (`:13-42`).
- `src/lib/eventStudyStatistics.ts:84-304` — real arithmetic (means, OLS,
  correlations), but see "Mixed" below for what it's computed over.

## What's decorative — the important ones

1. **`PointInTimeLeakageAuditView.tsx` never displays its own computed
   result.** It computes `auditResult` at line 28 and then never references
   it again (confirmed: one occurrence in the file). The prominent
   "100% LEAKAGE FREE / 0 Lookahead Violations" banner (`:59-66`) is static
   JSX, completely disconnected from any computation.
2. **The underlying audit is hardcoded.** `src/utils/pointInTimeLeakageAudit.ts:8-163`
   is an 11-row array where every row has `leakageStatus: "PASS_ZERO_LEAKAGE"`
   baked in as a literal, never computed. Timestamps are free-text category
   strings ("T-1m", "08:29:00.001 ET") that are never parsed or compared —
   the "audit" (`:179-213`) just compares a manually-assigned category
   against a hierarchy dict.
3. **3 of 6 "shadow validation" gates are hardcoded `true`.**
   `src/utils/shadowValidationEngine.ts:105-128` — gates g2/g5/g6 are literal
   `true` with comments citing numbers ("ECE = 0.042") that are computed
   nowhere in the function.
4. **The one test file never runs.** `src/tests/alfred.cpi.golden.test.ts`
   is imported by nothing, `package.json` has no test runner (no
   vitest/jest, no `"test"` script), and its core assertion is a fixture
   checked against itself.

## Mixed — real logic, fed synthetic or tiny data

- `src/lib/backtestValidationEngine.ts` — real OLS/FDR/Bonferroni math
  (`:118-121`), but `runFullQCValidation()` blends 16 real historical events
  with **20 fabricated events** from a sine-based pseudo-RNG
  (`src/lib/quantEngine.ts:163-203` `generateSyntheticHistory()`) — over
  half the "validation" sample is invented, silently.
- `src/utils/walkForwardValidation.ts` — correct split mechanics, but
  "Model A/B/C" are hand-coded if/else scoring rules with arbitrary
  constants (`:49-95`), not fitted models.
- `src/lib/eventStudyStatistics.ts` — real math, but exclusively over the
  static `FULL_70_EVENT_RESEARCH_COHORT` (`src/data/verifiedCohort.ts`),
  never live data; `meanRateRepricingPerZScore: 12.4` (`:301`) is a
  hardcoded constant presented alongside computed stats.
- `src/lib/dataIngestion.ts` / `src/lib/ingestionPipeline.ts` — a full
  "point-in-time ingestion pipeline" that is dead code, imported by nothing.
  18 of 46 components (~39%) read directly from static `src/data/*.ts`
  fixtures instead.

## Minor

- `.env.example` documents `APP_URL` (never read); `server.ts` reads
  `ALERT_EMAIL_*`, `ALLOWED_ORIGINS`, `APP_SECRET`,
  `FASTAPI_BRIDGE_ALLOWED_HOSTS`, none of which are documented in
  `.env.example`.
- One low-risk `dangerouslySetInnerHTML` on a static tab label
  (`src/components/Next24hEventTimeline.tsx:193`).
- No hardcoded API keys/secrets found.

## The fix list (tracked as agent-os tasks)

1. Wire `runPointInTimeLeakageAudit`'s actual result into
   `PointInTimeLeakageAuditView`'s banner; give the catalog real comparable
   timestamps instead of category labels.
2. Remove `generateSyntheticHistory()` from `runFullQCValidation`, or
   clearly flag synthetic vs. real events in the UI and the returned stats.
3. Replace the hardcoded `true` gates in `shadowValidationEngine.ts`
   (g2/g5/g6) with real computed conditions, or stop reporting "6/6 gates
   passed."
4. Wire `ingestionPipeline.ts`/`dataIngestion.ts` to actually populate the
   70-event cohort from a real source, or label every stat derived from it
   "n=70 curated sample."
5. Add an actual test runner (vitest) and get `alfred.cpi.golden.test.ts`
   running in CI.

No code in this repo has been changed to fix any of the above yet — this
commit is the import + the audit record only.
