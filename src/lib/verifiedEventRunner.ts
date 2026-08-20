import { VerifiedMacroEventRecord, OverallEventStatus } from "../types/provenance";
import { MAY_2022_CPI_GOLDEN } from "../data/goldenFixtures";

export interface EventAuditReport {
  eventId: string;
  eventName: string;
  status: OverallEventStatus;
  pass: boolean;
  provenanceCompletenessScore: number; // 0 - 100%
  mathematicalAuditPassed: boolean;
  goldenMatchPassed?: boolean;
  auditLogs: Array<{ level: "INFO" | "PASS" | "WARN" | "FAIL"; message: string }>;
  mathLineageBreakdown: Array<{
    metric: string;
    formula: string;
    calculated: number;
    recorded: number;
    delta: number;
    valid: boolean;
  }>;
}

/**
 * Deterministic Event Verification Runner
 * Validates:
 * 1. Completeness across all 4 independent provenance dimensions
 * 2. Strict mathematical reproducibility of derived returns & surprises from raw bar prices
 * 3. Unit-test anchor consistency for golden fixtures (May 2022 CPI)
 */
export function runVerifiedEvent(event: VerifiedMacroEventRecord): EventAuditReport {
  const logs: Array<{ level: "INFO" | "PASS" | "WARN" | "FAIL"; message: string }> = [];
  const mathLineage: EventAuditReport["mathLineageBreakdown"] = [];

  logs.push({ level: "INFO", message: `Initiating Truth Contract Audit for ${event.eventId} (${event.eventName})` });

  // 1. Check Provenance Completeness
  let totalFields = 0;
  let observedOrDerivedFields = 0;

  // Macro
  totalFields++;
  if (event.macroObservation.headlineValue.provenance.status === "OBSERVED") {
    observedOrDerivedFields++;
    logs.push({ level: "PASS", message: `[Dimension 1 - Macro] Headline (${event.macroObservation.headlineValue.value}${event.macroObservation.unit}) has OBSERVED status from ${event.macroObservation.headlineValue.provenance.source}` });
  } else {
    logs.push({ level: "FAIL", message: `[Dimension 1 - Macro] Non-observed macro headline: ${event.macroObservation.headlineValue.provenance.status}` });
  }

  // Consensus
  totalFields += 2;
  if (event.consensus.headlineMedian.provenance.status === "OBSERVED") {
    observedOrDerivedFields++;
    logs.push({ level: "PASS", message: `[Dimension 2 - Consensus] Survey Median (${event.consensus.headlineMedian.value}) has verified OBSERVED provenance.` });
  } else {
    logs.push({ level: "WARN", message: `[Dimension 2 - Consensus] Survey Median missing explicit OBSERVED provenance.` });
  }

  if (event.consensus.surpriseVsConsensus.provenance.status === "DERIVED") {
    observedOrDerivedFields++;
  }

  // Market Prices & Lineage
  const nq = event.marketReactions.NQ;
  const pPre = nq.preEventPrice.price;
  totalFields += 6; // Pre + 5 horizons

  if (nq.preEventPrice.provenance.status === "OBSERVED") observedOrDerivedFields++;

  (["1m", "5m", "15m", "30m", "60m"] as const).forEach((h) => {
    const postP = nq.postEventPrices[h];
    const recordedRet = nq.returns[h];

    if (postP && postP.provenance.status === "OBSERVED") {
      observedOrDerivedFields++;
    }

    if (postP && recordedRet) {
      const calcReturn = Number(((postP.price / pPre - 1) * 100).toFixed(2));
      const recordedVal = recordedRet.value !== null ? Number(recordedRet.value.toFixed(2)) : NaN;
      const diff = Math.abs(calcReturn - recordedVal);
      const isValid = diff <= 0.01;

      mathLineage.push({
        metric: `NQ Return +${h}`,
        formula: `(P_${postP.localTimeET}: ${postP.price} / P_Pre: ${pPre}) - 1`,
        calculated: calcReturn,
        recorded: recordedVal,
        delta: diff,
        valid: isValid,
      });

      if (isValid) {
        logs.push({ level: "PASS", message: `[Dimension 3 - Market] NQ +${h} return (${recordedVal}%) perfectly derived from observed bar (${postP.price} vs ${pPre}).` });
      } else {
        logs.push({ level: "FAIL", message: `[Dimension 3 - Market] NQ +${h} return math mismatch! Calc: ${calcReturn}%, Recorded: ${recordedVal}%` });
      }
    }
  });

  // News Verification
  totalFields++;
  if (event.newsVerification.primaryAgencyReleaseConfirmed && event.newsVerification.independentConfirmation) {
    observedOrDerivedFields++;
    logs.push({ level: "PASS", message: `[Dimension 4 - News Audit] Official agency publication & timestamp cross-verified.` });
  } else {
    logs.push({ level: "FAIL", message: `[Dimension 4 - News Audit] News release timestamp not independently confirmed.` });
  }

  // Golden Check (if May 2022)
  let goldenPassed = true;
  if (event.eventId === "US-CPI-2022-05") {
    const isExactMacro = event.macroObservation.headlineValue.value === MAY_2022_CPI_GOLDEN.macroObservation.headlineValue.value;
    const isExactNQ60m = event.marketReactions.NQ.returns["60m"].value === MAY_2022_CPI_GOLDEN.marketReactions.NQ.returns["60m"].value;
    goldenPassed = isExactMacro && isExactNQ60m;

    if (goldenPassed) {
      logs.push({ level: "PASS", message: `[Golden Anchor Check] Exact match with frozen May 2022 CPI fixture (8.6% YoY & -2.45% NQ 60m).` });
    } else {
      logs.push({ level: "FAIL", message: `[Golden Anchor Check] Mismatch with frozen May 2022 CPI fixture!` });
    }
  }

  const mathValid = mathLineage.every((m) => m.valid);
  const completeness = Math.round((observedOrDerivedFields / totalFields) * 100);
  const overallPass = completeness >= 90 && mathValid && goldenPassed;
  const status: OverallEventStatus = overallPass ? "VERIFIED" : completeness > 60 ? "PARTIAL" : "REJECTED";

  return {
    eventId: event.eventId,
    eventName: event.eventName,
    status,
    pass: overallPass,
    provenanceCompletenessScore: completeness,
    mathematicalAuditPassed: mathValid,
    goldenMatchPassed: goldenPassed,
    auditLogs: logs,
    mathLineageBreakdown: mathLineage,
  };
}

/**
 * Runs the audit suite on the entire cohort
 */
export function runCohortVerification(events: VerifiedMacroEventRecord[]): EventAuditReport[] {
  return events.map((ev) => runVerifiedEvent(ev));
}
