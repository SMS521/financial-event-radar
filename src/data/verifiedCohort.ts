import { VerifiedMacroEventRecord, DatasetCohortMetadata } from "../types/provenance";
import { DATASET_METADATA_V2 } from "./goldenFixtures";
import { CPI_EVENTS } from "./cohortData/cpiEvents";
import { NFP_EVENTS } from "./cohortData/nfpEvents";
import { FOMC_EVENTS } from "./cohortData/fomcEvents";
import { PCE_PPI_EVENTS } from "./cohortData/pcePpiEvents";
import { CONTROL_EVENTS } from "./cohortData/controlEvents";

export { DATASET_METADATA_V2 };

/**
 * 20 Verified Real Market-Moving Event Cohort (Historical Positive Examples, |NQ60m| >= 0.25%)
 * Fully meeting the 4-dimension truth contract:
 * - 8 CPI Events
 * - 5 NFP Events
 * - 5 FOMC Events
 * - 2 PCE & PPI Events
 */
export const VERIFIED_REAL_EVENT_COHORT: VerifiedMacroEventRecord[] = [
  ...CPI_EVENTS,
  ...NFP_EVENTS,
  ...FOMC_EVENTS,
  ...PCE_PPI_EVENTS
];

/**
 * 50 Verified Negative/Control Events (|NQ60m| < 0.25%)
 * Strictly distinct historical prints with zero duplicate templates or market-mover date collisions.
 */
export const VERIFIED_CONTROL_EVENTS: VerifiedMacroEventRecord[] = CONTROL_EVENTS;

/**
 * Full 70-Event Authoritative Research Cohort (20 Positive Movers + 50 Negative Controls)
 */
export const FULL_70_EVENT_RESEARCH_COHORT: VerifiedMacroEventRecord[] = [
  ...VERIFIED_REAL_EVENT_COHORT,
  ...VERIFIED_CONTROL_EVENTS
];

export const FULL_50_EVENT_RESEARCH_COHORT = FULL_70_EVENT_RESEARCH_COHORT;

export const VERIFIED_COHORT_BY_FAMILY = {
  ALL: FULL_70_EVENT_RESEARCH_COHORT,
  POSITIVES: VERIFIED_REAL_EVENT_COHORT,
  CONTROLS: VERIFIED_CONTROL_EVENTS,
  CPI: FULL_70_EVENT_RESEARCH_COHORT.filter((e) => e.eventFamily === "CPI"),
  NFP: FULL_70_EVENT_RESEARCH_COHORT.filter((e) => e.eventFamily === "NFP"),
  FOMC: FULL_70_EVENT_RESEARCH_COHORT.filter((e) => e.eventFamily === "FOMC"),
  PCE_PPI: FULL_70_EVENT_RESEARCH_COHORT.filter((e) => e.eventFamily === "PCE_PPI"),
  OTHER_MACRO: FULL_70_EVENT_RESEARCH_COHORT.filter((e) => e.eventFamily === "OTHER_MACRO")
};

export const FROZEN_BENCHMARK_EVENTS: VerifiedMacroEventRecord[] = FULL_70_EVENT_RESEARCH_COHORT.filter(
  (e) => e.isImmutableBenchmark
);

