# Corrected Gap Register — FERRP (financial-event-radar)

Status: **Supersedes `AUDIT.md`'s "The fix list" (lines 85–99) as the basis for
all downstream `agentos plan` work.** `AUDIT.md` itself remains the trust
baseline (per `CLAUDE.md`) but three of its factual claims are wrong or
understated, and two decorative surfaces it never documented are recorded
here for the first time. This register does not re-litigate the parts of
`AUDIT.md` that were re-verified and found correct (see "Re-verified as
correct" at the end).

Analysis only. No source file was modified to produce this document.
All line numbers were read directly from the repo at the current commit
(imported 2026-08-20); each claim below is tagged **Verified** (read the
code myself, citation given) or **Inferred** (reasoning from verified
facts, flagged explicitly).

---

## Corrected gap A — synthetic-data fraction in `runFullQCValidation`

**AUDIT.md said (line 58–62):** "`runFullQCValidation()` blends 16 real
historical events with 20 fabricated events ... over half the
'validation' sample is invented."

**Correction — Verified:**
- `HISTORICAL_EVENTS` in `src/data/eventDataset.ts:3–638` contains **8**
  top-level event objects (`EVENT-2024-06-12-CPI`, `EVENT-2024-07-31-BOJ`,
  `EVENT-2024-03-08-NFP`, `EVENT-2024-09-18-FOMC`, `EVENT-2024-05-22-NVDA`,
  `EVENT-2024-01-11-CPI-CONFOUNDED`, `EVENT-2023-11-14-CPI`,
  `EVENT-2024-04-10-CPI-HOT`). Counted directly off the array.
- A grep for `event_id:` over that file returns 16 hits
  (`src/data/eventDataset.ts`, `grep -c` = 16) — because each of the 8
  events has a second `event_id` field nested at `reactions.event_id`
  (e.g. line 55, 148, 224, 299 ...). The original audit's "16 real
  historical events" is that grep miscount, not the true event count.
- `generateSyntheticHistory()` (`src/lib/quantEngine.ts:163–239`)
  iterates a `dates` array of **20** literal date strings
  (`src/lib/quantEngine.ts:181–186`), producing exactly 20 synthetic
  `MarketEvent` records via `Math.sin`-seeded pseudo-noise
  (`getPseudoNoise`, `:189–192`).
- `runFullQCValidation()` (`src/lib/backtestValidationEngine.ts:118–121`)
  does `const allEvents = [...primaryEvents, ...syntheticEvents]` — 8 + 20.

**Corrected fact:** the blended validation sample is **n = 28** (8 real +
20 synthetic), i.e. **71.4% fabricated** (20/28), not "16 real ... over
half" (which implied 20/36 ≈ 56%). The true fabricated fraction is larger
than AUDIT.md stated, not smaller — this makes the gap *more* severe, not
less. All downstream statistics in `QCValidationReport` (magnitude model,
directional model, 7-factor multiple-testing panel, Cook's-distance
outlier audit, calibration bins) are computed over this same n=28 blended
array with no synthetic/real flag anywhere in the returned object or in
`MathematicalModelLab.tsx`'s rendering of it.

**Severity: High.** Every "validated" badge in the QC tab
(`MathematicalModelLab.tsx`) is silently 71% synthetic.

---

## Corrected gap B — `shadowValidationEngine.ts` fabrication is far larger than AUDIT.md's "3 hardcoded gates"

**AUDIT.md said (line 47–50):** "3 of 6 'shadow validation' gates are
hardcoded `true`. `shadowValidationEngine.ts:105–128` — gates g2/g5/g6 are
literal `true` ..." This describes only one function and undercounts the
problem by roughly an order of magnitude in record count.

**Correction — Verified**, all from `src/utils/shadowValidationEngine.ts`:

1. **Gate hardcoding is real but the line numbers drifted.** In the
   current file, `generateNoAlertLedger()`'s per-real-event gate block is
   at lines 119–124 (not 105–128 — the function starts at line 69 and the
   gate assignments are ~14 lines later than cited). Confirmed still:
   `g2 = true` (line 120), `g5 = true` (line 123), `g6 = true` (line 124),
   commented as "ECE = 0.042" / "Clean non-confounding window" / "Official
   BLS/BEA/Fed data credibility" — none of these values are computed
   anywhere in the function. `g1` (line 119) and `g4` (line 122) are
   genuinely computed from `pPred`/`preY2`/`preDxy`/`z`; `g3` (line 121) is
   genuinely computed from `ev.overallStatus === "VERIFIED"`.

2. **180 additional records are fabricated into the same output array as
   the 70 real cohort rows, undocumented by AUDIT.md.**
   `generateNoAlertLedger()` first pushes one record per row of
   `FULL_70_EVENT_RESEARCH_COHORT` (`:90–157`, 70 records, real cohort
   data from `src/data/verifiedCohort.ts`). It then runs a second loop,
   `for (let idx = 71; idx <= 250; idx++)` (`:173–211`), that fabricates
   **180 more records** by cycling through an inline 10-entry template
   array `additionalScenarios` (`:161–171`, `idx % additionalScenarios.length`)
   and perturbing `predictedProbability`/`gates`/mover-flag with `idx`
   arithmetic (`idx % 7`, `idx % 5`, `idx % 2`, `idx % 9`) — not sampled
   from any real data source. These 180 synthetic rows are pushed into
   the **same `records` array** as the 70 real rows (`records.push(...)`
   inside both loops), so any consumer of `generateNoAlertLedger().records`
   or `.summaryStats` cannot distinguish real from fabricated rows without
   reading source — the object has no `isSynthetic` field.
   - Total: 70 real + 180 fabricated = 250, matching the function's own
     comment "`250 items simulated: 40 alerts, 210 no-alerts`" (`:67`) and
     the returned `totalEligibleEvents` field. **The "simulated" label in
     that comment is itself a partial admission the audit missed** — the
     comment says 250 are simulated when only 180 of the 250 (72%) are;
     the other 70 are the real cohort.
   - Within the synthetic loop, gate 2 (`g2_calibrationValid`) and gate 5
     (`g5_noConflict`) are unconditionally `true` (`:201, 204`), same as
     the real-cohort function — **and gate 3 (`g3_pitProvenance`) is also
     unconditionally `true` here** (`:202`), unlike the real-cohort
     function where g3 is at least computed from `overallStatus`. So the
     synthetic block has one additional hardcoded-true gate (g3) beyond
     what AUDIT.md documented for the real block.

3. **Precision-at-gate-count metrics are hardcoded beside genuinely
   computed ones, in the same summary object.**
   `:213–222` genuinely compute `alertsTriggered`, `noAlertDecisions`,
   `truePositives`, `falsePositives`, `trueNegatives`,
   `falseNegativesMissed`, `missedMoveRateInNoAlerts`, and
   `negativePredictiveValue` by filtering/reducing over the (70-real +
   180-fabricated) `records` array. But `:235–237` return
   `precisionAt6_6: 91.3, precisionAt5_6: 83.7, precisionAt4_6: 68.4` as
   **literal constants**, not derived from `records` at all — despite
   sitting in the same returned object as the genuinely computed NPV two
   fields above them. These same three literals (91.3/83.7/68.4) also
   reappear verbatim in `PRE_REGISTERED_SUCCESS_TARGETS`
   (`:59`, `realizedCurrent: "91.3%"`) and `getLiveScorecardMetrics()`
   (`:940`, `precisionAt6_6: 91.3`), i.e. the same fabricated number is
   presented in three different "verification" surfaces as if each were
   an independent confirmation.

**Corrected fact:** AUDIT.md's gap 3 is not "3 hardcoded gates in one
function" — it is (a) 3–4 hardcoded gates depending on which of two
record-generation blocks you're in, applied across (b) 180 wholly
fabricated records silently merged with 70 real ones into a single
array presented as N=250 "eligible events," with (c) three headline
precision metrics hardcoded as literals and echoed across three separate
UI-facing surfaces as independent evidence.

**Severity: Critical.** This is the platform's single largest fabrication
surface — larger by record count than every other gap in AUDIT.md
combined (180 fabricated rows vs. the 20 synthetic events in gap A, the
11-row hardcoded audit catalog in gap C's PIT audit, etc.).

---

## Corrected gap C — two decorative surfaces AUDIT.md never documented

### C1 — `MathematicalModelLab.tsx` hardcodes a "VALIDATED" badge; the real computed flag is dead

**Verified:**
- `src/components/MathematicalModelLab.tsx:276–278` renders a static
  badge:
  ```
  <span ...>VALIDATED</span>
  ```
  with no data binding — it is not `{qcReport.magnitude_model.is_validated
  ? "VALIDATED" : ...}` or any conditional; it is literal JSX text that
  renders unconditionally whenever this card renders.
- `src/lib/backtestValidationEngine.ts:57` declares
  `is_validated: boolean` on `QCValidationReport.magnitude_model`, and
  `:392` computes it for real: `isOLS.pValue < 0.05 && oosOLS.rSquared >
  0.25` — a genuine two-part statistical gate over the (partly synthetic,
  see gap A) magnitude model.
- Grepping `is_validated` across `src/` returns exactly two hits: the
  interface declaration (`:57`) and the assignment (`:392`). **Nothing in
  `src/` ever reads `magnitude_model.is_validated`** — not
  `MathematicalModelLab.tsx`, not any other component. The computed value
  is discarded; the badge the user sees is unconditional.
- Note this compounds gap A: even if the badge *were* wired to
  `is_validated`, the underlying OLS it gates is fit over the 71%-synthetic
  n=28 sample.

**Severity: Medium-High.** This is structurally identical to AUDIT.md's
gap 1 (`PointInTimeLeakageAuditView.tsx` computing a result and never
displaying it) but in the opposite direction — here a real result is
computed and ignored while a static "pass" is shown regardless. AUDIT.md
documented the leakage-view case but missed this one, in the same file
family (QC/validation dashboards).

### C2 — `pointInTimeLeakageAudit.ts` certification hash always claims "CERTIFIED-ZERO-LEAKAGE," even when violations exist

**Verified**, `src/utils/pointInTimeLeakageAudit.ts`:
- `runPointInTimeLeakageAudit()` (`:179–214`) does real comparison logic:
  it computes `violations` by comparing each feature's
  `allowedPredictionCutoff` category against the requested
  `predictionCutoff` via an ordinal hierarchy (`:182–203`), and correctly
  derives `is100PctLeakageFree: violations.length === 0` (`:211`). This
  part is a genuine (if category-based, not timestamp-based — AUDIT.md's
  original point 2 about category labels vs. real timestamps still holds)
  computation.
- But the same return object's `auditCertificationHash` field (`:212`) is:
  ```
  auditCertificationHash: `PIT-AUDIT-${predictionCutoff}-CERTIFIED-ZERO-LEAKAGE`
  ```
  This template string is **unconditional** — it does not branch on
  `violations.length` or `is100PctLeakageFree`. If `runPointInTimeLeakageAudit`
  is ever called with a `predictionCutoff` that produces violations (e.g.
  `"T_MINUS_1M"`, which is stricter than the default `"T_PLUS_1M"` selected
  in the view and would flag `FEAT-008/009/010` at minimum, since their
  `allowedPredictionCutoff` is `"T_PLUS_1M"` — level 2 vs. level 0), the
  function still returns a hash string containing the literal substring
  `"CERTIFIED-ZERO-LEAKAGE"` alongside `is100PctLeakageFree: false`.
- **Currently not rendered:** grepping `auditCertificationHash` across
  `src/` finds only its declaration (`:172`) and assignment (`:212`) —
  `PointInTimeLeakageAuditView.tsx` does not currently display this field
  (confirmed via read of the view's JSX and a targeted grep). So today
  this is a **latent** defect, not a currently-visible false claim to a
  user — but it sits in the same object as `is100PctLeakageFree`, is named
  as if it were a certification artifact, and would mislead the moment
  anyone (a future component, an API consumer, a report export) surfaces
  it without separately checking `is100PctLeakageFree`.

**Severity: Medium (latent).** Not user-visible today; becomes a false
"certified zero-leakage" claim the instant the field is displayed or
exported, with no code change required to trigger it — just picking a
stricter `predictionCutoff`.

---

## Re-verified as correct (spot-checked, not re-argued in full)

These AUDIT.md claims were checked against current source and hold:
- `PointInTimeLeakageAuditView.tsx:28` computes `auditResult` via
  `useMemo` and it is the only occurrence of that identifier in the file
  (grep confirms 1 hit) — the banner at `:59–66` is static JSX, unbound.
- `POINT_IN_TIME_FEATURE_CATALOG` (`pointInTimeLeakageAudit.ts:8–163`) has
  11 entries, every one with `leakageStatus: "PASS_ZERO_LEAKAGE"` as a
  literal.
- `shadowValidationEngine.ts` real gate logic operates on category labels
  (`allowedPredictionCutoff` ordinal hierarchy), not parsed timestamps —
  same character as AUDIT.md's point-in-time audit criticism.
- No test runner: `package.json` has no `"test"` script and no
  `vitest`/`jest` dependency (grep, zero hits); `alfred.cpi.golden.test.ts`
  is not imported/referenced by any other file in the repo.
- `.env.example` documents `APP_URL` but it is never read anywhere in
  `.ts`/`.tsx` (grep, zero hits); `server.ts` reads
  `ALLOWED_ORIGINS`, `ALERT_EMAIL_APP_PASSWORD`/`ALERT_EMAIL_USER`/
  `ALERT_EMAIL_DEFAULT_TO`, `APP_SECRET`, `FASTAPI_BRIDGE_ALLOWED_HOSTS` —
  none documented in `.env.example`.
- `dangerouslySetInnerHTML` at `Next24hEventTimeline.tsx:193`, on a static
  tab label — confirmed, low risk as described.
- `src/lib/dataIngestion.ts` / `ingestionPipeline.ts`: `dataIngestion.ts`
  is only imported by `ingestionPipeline.ts` (`:2`), and neither file is
  imported from anywhere else in the repo (grep across `.ts`/`.tsx`,
  outside the pair itself, zero hits) — confirmed dead code.
- 18 of 46 files in `src/components/` import directly from `../data/`
  (`grep -rl 'from "\.\./data/' src/components | wc -l` = 18; `find
  src/components -maxdepth 1 -name '*.tsx' | wc -l` = 46) — matches
  AUDIT.md's "18 of 46 (~39%)" exactly.
- `meanRateRepricingPerZScore: 12.4` hardcoded literal at
  `eventStudyStatistics.ts:301`, adjacent to genuinely computed
  `correlation2yToNq` on the line above — confirmed.
- `FULL_70_EVENT_RESEARCH_COHORT` (`verifiedCohort.ts:35–38`) is real
  structured data (20 verified positive + 50 control = 70), assembled
  from separate per-family files (`cohortData/cpiEvents.ts` etc.), not a
  single monolithic hardcoded blob — consistent with AUDIT.md calling it
  "hand-typed" but real (as opposed to the fabricated rows in gap B).

---

## Net effect on "The fix list"

`AUDIT.md`'s fix list items 1–5 (lines 87–99) remain directionally valid
but item 2 and item 3 understate scope:

| # | AUDIT.md fix item | Correction |
|---|---|---|
| 1 | Wire leakage audit result into the view | Unchanged, confirmed correct. Add: also gate `auditCertificationHash` (gap C2) on `is100PctLeakageFree` before any future surface displays it. |
| 2 | Remove/flag `generateSyntheticHistory()` blend | Scope was "16 real + 20 fake"; actual is **8 real + 20 fake = 71% fabricated** (gap A), not "over half." Higher priority than originally ranked. |
| 3 | Replace hardcoded gates g2/g5/g6 in `shadowValidationEngine.ts` | Scope understated by ~10x: this is not one function's 3 gates, it's 3–4 hardcoded gates applied across **180 fully fabricated records** silently merged with 70 real ones (N=250), plus 3 hardcoded precision literals echoed across 3 UI surfaces (gap B). Should be the **top-priority** fix item, not #3. |
| 4 | Wire ingestion pipeline | Unchanged, confirmed dead code. |
| 5 | Add test runner | Unchanged, confirmed no runner exists. |
| **new** | — | **Add:** wire or remove the `MathematicalModelLab.tsx:276–278` VALIDATED badge to actually read `magnitude_model.is_validated` (gap C1). |
| **new** | — | **Add:** make `auditCertificationHash` in `pointInTimeLeakageAudit.ts:212` conditional on `violations.length === 0` (gap C2), or drop the field until it's wired to a real signing/certification process. |

## Confidence

**High** on all six corrected/new items — each is backed by direct code
reads with line citations and, where relevant, grep counts reproduced
above (all commands re-runnable against the current commit). The one
**Inferred** judgment call in this register is severity ranking (High /
Critical / Medium) — that is my assessment of user-facing impact, not a
measured fact; a reviewer may reasonably rank differently.
