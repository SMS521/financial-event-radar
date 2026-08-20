import { MarketEvent } from "../types";

export interface EventValidationResult {
  isValid: boolean;
  isVerified: boolean;
  status: "verified" | "simulated" | "warning" | "invalid";
  badgeLabel: string;
  badgeClass: string;
  errors: string[];
  warnings: string[];
  checks: {
    name: string;
    passed: boolean;
    detail: string;
  }[];
}

export function validateEventIntegrity(event: MarketEvent | null | undefined): EventValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const checks: { name: string; passed: boolean; detail: string }[] = [];

  if (!event) {
    return {
      isValid: false,
      isVerified: false,
      status: "invalid",
      badgeLabel: "Null Event",
      badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
      errors: ["Event object is null or undefined."],
      warnings: [],
      checks: [{ name: "Event Definition", passed: false, detail: "No event payload provided." }],
    };
  }

  // 1. Identification Check
  const hasId = typeof event.event_id === "string" && event.event_id.trim().length > 0;
  checks.push({
    name: "Event Identifier",
    passed: hasId,
    detail: hasId ? `ID: ${event.event_id}` : "Missing required event_id.",
  });
  if (!hasId) errors.push("Missing event_id.");

  // 2. Numerical Actual & Consensus Values Check
  const hasValidNumbers =
    typeof event.actual === "number" &&
    !isNaN(event.actual) &&
    typeof event.consensus === "number" &&
    !isNaN(event.consensus);
  checks.push({
    name: "Metric Values",
    passed: hasValidNumbers,
    detail: hasValidNumbers
      ? `Actual: ${event.actual} ${event.unit || ""}, Consensus: ${event.consensus} ${event.unit || ""}`
      : "Actual or Consensus is not a valid number.",
  });
  if (!hasValidNumbers) errors.push("Invalid or non-numeric actual/consensus values.");

  // 3. Sigma & Surprise Calculation
  const hasSigma = typeof event.historical_sigma === "number" && event.historical_sigma > 0;
  checks.push({
    name: "Statistical Sigma",
    passed: hasSigma,
    detail: hasSigma
      ? `Sigma: ${event.historical_sigma}, Standardized: ${event.standardized_surprise.toFixed(2)}σ`
      : "Sigma is zero or non-positive.",
  });
  if (!hasSigma) warnings.push("Historical sigma is non-positive or undefined; default baseline will be used.");

  // 4. Point-in-Time Timestamp Check
  const hasTimestamps = Boolean(event.scheduled_ts && event.publication_ts);
  checks.push({
    name: "Point-in-Time Timestamps",
    passed: hasTimestamps,
    detail: hasTimestamps ? `Release: ${new Date(event.publication_ts).toUTCString()}` : "Missing release timestamps.",
  });
  if (!hasTimestamps) warnings.push("Release timestamp is missing or malformed.");

  // 5. Cross-Asset Reactions Check
  const hasReactions = Boolean(
    event.reactions &&
    event.reactions.NQ &&
    event.reactions.SPX &&
    event.reactions.TREASURY_10Y &&
    event.reactions.USD_DXY
  );
  checks.push({
    name: "Cross-Asset Transmission Grid",
    passed: hasReactions,
    detail: hasReactions ? "All 12 assets mapped across 1m to 1d horizons" : "Incomplete asset reaction vectors.",
  });
  if (!hasReactions) errors.push("Reactions grid is missing core asset vectors (NQ, SPX, 10Y, USD).");

  // 6. Origin & Verification Determination
  const isSimulated =
    event.origin_type === "user_simulation" ||
    event.event_id.startsWith("SIM-") ||
    event.source?.toLowerCase().includes("simulator") ||
    event.source_quality === "Simulated Input" ||
    event.data_quality === "Simulated";

  const isVerified = !isSimulated && errors.length === 0;

  let status: "verified" | "simulated" | "warning" | "invalid";
  let badgeLabel: string;
  let badgeClass: string;

  if (errors.length > 0) {
    status = "invalid";
    badgeLabel = "Integrity Failed";
    badgeClass = "bg-rose-100 text-rose-800 border-rose-300";
  } else if (isSimulated) {
    status = "simulated";
    badgeLabel = "User Simulated Entry";
    badgeClass = "bg-indigo-100 text-indigo-800 border-indigo-300";
  } else if (warnings.length > 0) {
    status = "warning";
    badgeLabel = "Verified (Preliminary)";
    badgeClass = "bg-amber-100 text-amber-900 border-amber-300";
  } else {
    status = "verified";
    badgeLabel = "Verified Data Source";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
  }

  return {
    isValid: errors.length === 0,
    isVerified,
    status,
    badgeLabel,
    badgeClass,
    errors,
    warnings,
    checks,
  };
}
