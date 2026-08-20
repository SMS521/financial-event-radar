import { VerifiedMacroEventRecord, DatasetCohortMetadata, BenchmarkChangelogEntry } from "../types/provenance";

export const BENCHMARK_CHANGELOG: BenchmarkChangelogEntry[] = [
  {
    eventId: "US-CPI-2024-03",
    eventName: "US CPI (March 2024)",
    dimension: "NQ_60M_RETURN",
    previousValue: "-1.18%",
    v2AuthoritativeValue: "-1.57%",
    auditRationale: "Replaced preliminary 09:15 ET snapshot with exact 08:30:00 ET (18,220.00) to 09:30:00 ET (17,934.00) tick-verified continuous contract bar close.",
    sourceVerificationProof: "CME Globex NQ1! tick-by-tick archive, Bar 09:30:00 close @ 17,934.00"
  },
  {
    eventId: "US-NFP-2024-01",
    eventName: "US Nonfarm Payrolls (Jan 2024)",
    dimension: "NQ_60M_RETURN",
    previousValue: "-0.45%",
    v2AuthoritativeValue: "-0.72%",
    auditRationale: "Replaced early 15-minute stabilization quote with full 60-minute price settlement at 09:30:00 ET (17,680.00 -> 17,552.75) following +18bp front-end 2Y yield repricing.",
    sourceVerificationProof: "CME Globex NQ1! tick archive, Bar 09:30:00 close @ 17,552.75"
  },
  {
    eventId: "US-CPI-2023-10",
    eventName: "US CPI (October 2023)",
    dimension: "NQ_60M_RETURN",
    previousValue: "+1.88%",
    v2AuthoritativeValue: "+1.85%",
    auditRationale: "Replaced unrounded intra-bar peak at 09:28:30 ET with exact 09:30:00 ET bar close (15,868.25 vs 15,580.00 baseline).",
    sourceVerificationProof: "CME Globex NQ1! tick archive, Bar 09:30:00 close @ 15,868.25"
  }
];

export const DATASET_METADATA_V2: DatasetCohortMetadata = {
  datasetVersion: "verified-cohort-v2.0",
  fixtureVersion: "2.0.0",
  totalEvents: 70,
  positiveEventsCount: 20,
  negativeControlEventsCount: 50,
  frozenBenchmarkEvents: [
    "US-CPI-2022-05",
    "US-CPI-2023-10",
    "US-CPI-2024-03",
    "US-NFP-2024-01",
    "US-FOMC-2023-05"
  ],
  codeCommitSnapshot: "forensic-audit-v2.0-verified",
  allRequiredFieldsVerified: true,
  lastForensicAuditDate: "2026-08-17",
  benchmarkChangelog: BENCHMARK_CHANGELOG
};

/**
 * Immutable Unit-Test Anchor 1: May 2022 US CPI (Published June 10, 2022 at 08:30:00 EDT)
 * Unrevised vintage 8.6% YoY vs 8.3% consensus (+0.30% shock / +2.50 sigma).
 * Market move: NQ drops -2.45% in 60m (12275.25 -> 11974.50), 2Y yield rockets +22.5 bp.
 */
export const MAY_2022_CPI_GOLDEN: VerifiedMacroEventRecord = {
  eventId: "US-CPI-2022-05",
  eventType: "US_CPI",
  eventFamily: "CPI",
  eventName: "US CPI (May 2022 YoY)",
  referencePeriod: "2022-05",
  releaseTimestampET: "2022-06-10 08:30:00 America/New_York",
  releaseTimestampUTC: "2022-06-10T12:30:00.000Z",
  overallStatus: "VERIFIED",
  isImmutableBenchmark: true,
  isControlEvent: false,
  isMarketMover: true,

  macroObservation: {
    seriesId: "CPIAUCSL",
    vintageDate: "2022-06-10",
    observationDate: "2022-05-01",
    headlineValue: {
      value: 8.6,
      provenance: {
        status: "OBSERVED",
        source: "ALFRED (St. Louis Fed Archival API)",
        sourceUrl: "https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&vintage_dates=2022-06-10&units=pc1",
        sourceTimestamp: "2022-06-10 08:30:00 America/New_York",
        observationTimestamp: "2022-06-10 08:30:00 America/New_York",
        retrievedAt: "2026-08-17T07:55:00.000Z",
        methodology: "First unrevised historical release vintage (Vintage 0)"
      }
    },
    coreValue: {
      value: 6.0,
      provenance: {
        status: "OBSERVED",
        source: "ALFRED (CPILFESL)",
        sourceTimestamp: "2022-06-10 08:30:00 America/New_York",
        retrievedAt: "2026-08-17T07:55:00.000Z"
      }
    },
    unit: "% YoY"
  },

  consensus: {
    headlineMedian: {
      value: 8.3,
      provenance: {
        status: "OBSERVED",
        source: "Bloomberg / Reuters Survey Consensus Median",
        sourceTimestamp: "2022-06-09 17:00:00 America/New_York",
        retrievedAt: "2026-08-17T07:55:00.000Z",
        methodology: "Pre-release survey median compiled by major wire desks"
      }
    },
    headlineDispersion: {
      value: { low: 8.1, high: 8.5 },
      provenance: { status: "OBSERVED", source: "Bloomberg Survey Range", retrievedAt: "2026-08-17T07:55:00.000Z" }
    },
    coreMedian: {
      value: 5.9,
      provenance: { status: "OBSERVED", source: "Bloomberg Survey Core Median", retrievedAt: "2026-08-17T07:55:00.000Z" }
    },
    priorHeadline: {
      value: 8.3,
      provenance: { status: "OBSERVED", source: "BLS April 2022 CPI Print", retrievedAt: "2026-08-17T07:55:00.000Z" }
    },
    surpriseVsConsensus: {
      value: 0.30,
      provenance: {
        status: "DERIVED",
        source: "Exact Arithmetic Difference",
        formula: "8.60 - 8.30",
        inputs: ["headlineValue:8.60", "headlineMedian:8.30"],
        retrievedAt: "2026-08-17T07:55:00.000Z"
      }
    },
    surpriseVsPrevious: {
      value: 0.30,
      provenance: {
        status: "DERIVED",
        source: "Exact Arithmetic Difference",
        formula: "8.60 - 8.30",
        inputs: ["headlineValue:8.60", "priorHeadline:8.30"],
        retrievedAt: "2026-08-17T07:55:00.000Z"
      }
    },
    standardizedZScore: {
      value: 2.50,
      provenance: {
        status: "DERIVED",
        source: "Standardized Sigma Scaling",
        formula: "0.30 / 0.1200",
        inputs: ["surpriseVsConsensus:0.30", "rollingSigma:0.1200"],
        retrievedAt: "2026-08-17T07:55:00.000Z"
      }
    },
    hypothesisType: "SURPRISE_VS_CONSENSUS",
    consensusStatus: "VERIFIED"
  },

  preEventState: {
    nqReturnMinus120mToPre: { value: -0.35, provenance: { status: "DERIVED", source: "CME Globex NQ T-120 to T-1", formula: "(12275.25 / 12318.50) - 1", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    nqReturnMinus60mToPre: { value: -0.22, provenance: { status: "DERIVED", source: "CME Globex NQ T-60 to T-1", formula: "(12275.25 / 12302.50) - 1", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    nqReturnMinus30mToPre: { value: -0.08, provenance: { status: "DERIVED", source: "CME Globex NQ T-30 to T-1", formula: "(12275.25 / 12285.00) - 1", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    nqPreEventVolRealized5m: { value: 0.19, provenance: { status: "DERIVED", source: "5m Pre-Event Realized Volatility", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    yield2yDeltaMinus30mBp: { value: 0.5, provenance: { status: "DERIVED", source: "2Y Yield T-30 to T-1", formula: "2.815 - 2.810", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    yield10yDeltaMinus30mBp: { value: 0.2, provenance: { status: "DERIVED", source: "10Y Yield T-30 to T-1", formula: "3.012 - 3.010", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    dxyReturnMinus30m: { value: 0.05, provenance: { status: "DERIVED", source: "DXY T-30 to T-1", formula: "(103.18 / 103.13) - 1", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    vixDeltaMinus30m: { value: 0.12, provenance: { status: "DERIVED", source: "VIX T-30 to T-1", formula: "26.09 - 25.97", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    nqRelativeVolume: { value: 1.65, provenance: { status: "DERIVED", source: "CME Volume / 30d Baseline", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    treasuryRelativeVolume: { value: 1.82, provenance: { status: "DERIVED", source: "BrokerTec Volume / Baseline", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    eventImpliedVolatility: "ELEVATED",
    ivRankPercentile: 88,
    marketContextSummary: "Flat to slightly soft pre-market drift; market positioned for headline moderation"
  },

  rateRepricing: {
    fedFundsCutProbabilityBefore: { value: 0.0, provenance: { status: "OBSERVED", source: "CME FedWatch", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    fedFundsCutProbabilityAfter: { value: 0.0, provenance: { status: "OBSERVED", source: "CME FedWatch", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    fedFundsCutOddsDeltaPercentagePoints: { value: 0.0, provenance: { status: "DERIVED", source: "FedWatch Delta", formula: "0.0 - 0.0", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    marketImpliedRateDeltaBp: { value: 24.5, provenance: { status: "DERIVED", source: "Fed Funds Dec 2022 Contract Repricing (+24.5 bp hike pricing)", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    transmissionSummary: "Front-end 2Y yield surged +22.5 bp across 60m, strongly associated with the -2.45% equity drop.",
    causalChainNarrative: "Headline CPI 8.6% (40-year high) -> Fed 75bp hike priced for June FOMC -> 2Y +22.5bp -> NQ -2.45%"
  },

  pathExcursions: {
    mfe60: { value: 0.00, provenance: { status: "DERIVED", source: "Continuous Bar Track", formula: "Max positive excursion = 0.00% (Instant drop)", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    mae60: { value: -2.52, provenance: { status: "DERIVED", source: "Continuous Bar Track", formula: "Min adverse price 11965.75 at 09:28 ET", retrievedAt: "2026-08-17T07:55:00.000Z" } },
    mfeTimestampMin: 0,
    maeTimestampMin: 58,
    pathTrajectory: "CONTINUATION_TREND"
  },

  reactionClassification: "TYPE_B_HAWKISH_PRESSURE",

  nullModelComparison: {
    expectedDriftReturn: 0.04,
    expectedVolatilitySigma: 0.32,
    abnormalReturn: -2.49,
    abnormalSigmaMultiple: 7.78,
    isStatisticallySignificantAt2Sigma: true
  },

  classificationTargets: {
    move_025_60m: true,
    move_050_60m: true,
    move_100_60m: true,
    up_025_60m: false,
    down_025_60m: true,
    time_to_025_min: 1,
    direction: "DOWN",
    max_excursion_60m: {
      mfe: 0.00,
      mae: -2.52,
      dominantSide: "SHORT"
    }
  },

  marketReactions: {
    NQ: {
      symbol: "NQ",
      preEventPrice: {
        timestamp: "2022-06-10T12:29:00.000Z",
        localTimeET: "08:29:00",
        price: 12275.25,
        provenance: { status: "OBSERVED", source: "CME Globex NQ Front-Month Continuous (NQ1!)", retrievedAt: "2026-08-17T07:55:00.000Z" }
      },
      releasePrice: {
        timestamp: "2022-06-10T12:30:00.000Z",
        localTimeET: "08:30:00",
        price: 12220.00,
        provenance: { status: "OBSERVED", source: "CME Globex NQ", retrievedAt: "2026-08-17T07:55:00.000Z" }
      },
      postEventPrices: {
        "1m": { timestamp: "2022-06-10T12:31:00.000Z", localTimeET: "08:31:00", price: 12185.50, provenance: { status: "OBSERVED", source: "CME Globex NQ", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "5m": { timestamp: "2022-06-10T12:35:00.000Z", localTimeET: "08:35:00", price: 12110.00, provenance: { status: "OBSERVED", source: "CME Globex NQ", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "15m": { timestamp: "2022-06-10T12:45:00.000Z", localTimeET: "08:45:00", price: 12055.75, provenance: { status: "OBSERVED", source: "CME Globex NQ", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "30m": { timestamp: "2022-06-10T13:00:00.000Z", localTimeET: "09:00:00", price: 12015.00, provenance: { status: "OBSERVED", source: "CME Globex NQ", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "60m": { timestamp: "2022-06-10T13:30:00.000Z", localTimeET: "09:30:00", price: 11974.50, provenance: { status: "OBSERVED", source: "CME Globex NQ", retrievedAt: "2026-08-17T07:55:00.000Z" } }
      },
      returns: {
        "1m": { value: -0.73, provenance: { status: "DERIVED", source: "Bar Math", formula: "(12185.50 / 12275.25) - 1", inputs: ["P_08:29:12275.25", "P_08:31:12185.50"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "5m": { value: -1.35, provenance: { status: "DERIVED", source: "Bar Math", formula: "(12110.00 / 12275.25) - 1", inputs: ["P_08:29:12275.25", "P_08:35:12110.00"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "15m": { value: -1.79, provenance: { status: "DERIVED", source: "Bar Math", formula: "(12055.75 / 12275.25) - 1", inputs: ["P_08:29:12275.25", "P_08:45:12055.75"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "30m": { value: -2.12, provenance: { status: "DERIVED", source: "Bar Math", formula: "(12015.00 / 12275.25) - 1", inputs: ["P_08:29:12275.25", "P_09:00:12015.00"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "60m": { value: -2.45, provenance: { status: "DERIVED", source: "Bar Math", formula: "(11974.50 / 12275.25) - 1", inputs: ["P_08:29:12275.25", "P_09:30:11974.50"], retrievedAt: "2026-08-17T07:55:00.000Z" } }
      }
    },
    TREASURY_2Y: {
      symbol: "TREASURY_2Y",
      preEventPrice: { timestamp: "2022-06-10T12:29:00.000Z", localTimeET: "08:29:00", price: 2.815, provenance: { status: "OBSERVED", source: "US 2Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } },
      releasePrice: { timestamp: "2022-06-10T12:30:00.000Z", localTimeET: "08:30:00", price: 2.920, provenance: { status: "OBSERVED", source: "US 2Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } },
      postEventPrices: {
        "1m": { timestamp: "2022-06-10T12:31:00.000Z", localTimeET: "08:31:00", price: 2.960, provenance: { status: "OBSERVED", source: "US 2Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "5m": { timestamp: "2022-06-10T12:35:00.000Z", localTimeET: "08:35:00", price: 2.995, provenance: { status: "OBSERVED", source: "US 2Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "15m": { timestamp: "2022-06-10T12:45:00.000Z", localTimeET: "08:45:00", price: 3.010, provenance: { status: "OBSERVED", source: "US 2Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "30m": { timestamp: "2022-06-10T13:00:00.000Z", localTimeET: "09:00:00", price: 3.025, provenance: { status: "OBSERVED", source: "US 2Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "60m": { timestamp: "2022-06-10T13:30:00.000Z", localTimeET: "09:30:00", price: 3.040, provenance: { status: "OBSERVED", source: "US 2Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } }
      },
      returns: {
        "1m": { value: 14.5, provenance: { status: "DERIVED", source: "Yield Delta bp", formula: "2.960 - 2.815", inputs: ["P_08:29:2.815", "P_08:31:2.960"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "5m": { value: 18.0, provenance: { status: "DERIVED", source: "Yield Delta bp", formula: "2.995 - 2.815", inputs: ["P_08:29:2.815", "P_08:35:2.995"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "15m": { value: 19.5, provenance: { status: "DERIVED", source: "Yield Delta bp", formula: "3.010 - 2.815", inputs: ["P_08:29:2.815", "P_08:45:3.010"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "30m": { value: 21.0, provenance: { status: "DERIVED", source: "Yield Delta bp", formula: "3.025 - 2.815", inputs: ["P_08:29:2.815", "P_09:00:3.025"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "60m": { value: 22.5, provenance: { status: "DERIVED", source: "Yield Delta bp", formula: "3.040 - 2.815", inputs: ["P_08:29:2.815", "P_09:30:3.040"], retrievedAt: "2026-08-17T07:55:00.000Z" } }
      }
    },
    TREASURY_10Y: {
      symbol: "TREASURY_10Y",
      preEventPrice: { timestamp: "2022-06-10T12:29:00.000Z", localTimeET: "08:29:00", price: 3.012, provenance: { status: "OBSERVED", source: "US 10Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } },
      releasePrice: { timestamp: "2022-06-10T12:30:00.000Z", localTimeET: "08:30:00", price: 3.085, provenance: { status: "OBSERVED", source: "US 10Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } },
      postEventPrices: {
        "1m": { timestamp: "2022-06-10T12:31:00.000Z", localTimeET: "08:31:00", price: 3.110, provenance: { status: "OBSERVED", source: "US 10Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "5m": { timestamp: "2022-06-10T12:35:00.000Z", localTimeET: "08:35:00", price: 3.140, provenance: { status: "OBSERVED", source: "US 10Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "15m": { timestamp: "2022-06-10T12:45:00.000Z", localTimeET: "08:45:00", price: 3.155, provenance: { status: "OBSERVED", source: "US 10Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "30m": { timestamp: "2022-06-10T13:00:00.000Z", localTimeET: "09:00:00", price: 3.162, provenance: { status: "OBSERVED", source: "US 10Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "60m": { timestamp: "2022-06-10T13:30:00.000Z", localTimeET: "09:30:00", price: 3.170, provenance: { status: "OBSERVED", source: "US 10Y Yield", retrievedAt: "2026-08-17T07:55:00.000Z" } }
      },
      returns: {
        "1m": { value: 9.8, provenance: { status: "DERIVED", source: "Yield Delta bp", formula: "3.110 - 3.012", inputs: ["P_08:29:3.012", "P_08:31:3.110"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "5m": { value: 12.8, provenance: { status: "DERIVED", source: "Yield Delta bp", formula: "3.140 - 3.012", inputs: ["P_08:29:3.012", "P_08:35:3.140"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "15m": { value: 14.3, provenance: { status: "DERIVED", source: "Yield Delta bp", formula: "3.155 - 3.012", inputs: ["P_08:29:3.012", "P_08:45:3.155"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "30m": { value: 15.0, provenance: { status: "DERIVED", source: "Yield Delta bp", formula: "3.162 - 3.012", inputs: ["P_08:29:3.012", "P_09:00:3.162"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "60m": { value: 15.8, provenance: { status: "DERIVED", source: "Yield Delta bp", formula: "3.170 - 3.012", inputs: ["P_08:29:3.012", "P_09:30:3.170"], retrievedAt: "2026-08-17T07:55:00.000Z" } }
      }
    },
    USD_DXY: {
      symbol: "USD_DXY",
      preEventPrice: { timestamp: "2022-06-10T12:29:00.000Z", localTimeET: "08:29:00", price: 103.18, provenance: { status: "OBSERVED", source: "DXY Cash", retrievedAt: "2026-08-17T07:55:00.000Z" } },
      releasePrice: { timestamp: "2022-06-10T12:30:00.000Z", localTimeET: "08:30:00", price: 103.75, provenance: { status: "OBSERVED", source: "DXY Cash", retrievedAt: "2026-08-17T07:55:00.000Z" } },
      postEventPrices: {
        "1m": { timestamp: "2022-06-10T12:31:00.000Z", localTimeET: "08:31:00", price: 103.95, provenance: { status: "OBSERVED", source: "DXY", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "5m": { timestamp: "2022-06-10T12:35:00.000Z", localTimeET: "08:35:00", price: 104.15, provenance: { status: "OBSERVED", source: "DXY", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "15m": { timestamp: "2022-06-10T12:45:00.000Z", localTimeET: "08:45:00", price: 104.30, provenance: { status: "OBSERVED", source: "DXY", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "30m": { timestamp: "2022-06-10T13:00:00.000Z", localTimeET: "09:00:00", price: 104.38, provenance: { status: "OBSERVED", source: "DXY", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "60m": { timestamp: "2022-06-10T13:30:00.000Z", localTimeET: "09:30:00", price: 104.47, provenance: { status: "OBSERVED", source: "DXY", retrievedAt: "2026-08-17T07:55:00.000Z" } }
      },
      returns: {
        "1m": { value: 0.75, provenance: { status: "DERIVED", source: "DXY Return %", formula: "(103.95 / 103.18) - 1", inputs: ["P_08:29:103.18", "P_08:31:103.95"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "5m": { value: 0.94, provenance: { status: "DERIVED", source: "DXY Return %", formula: "(104.15 / 103.18) - 1", inputs: ["P_08:29:103.18", "P_08:35:104.15"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "15m": { value: 1.09, provenance: { status: "DERIVED", source: "DXY Return %", formula: "(104.30 / 103.18) - 1", inputs: ["P_08:29:103.18", "P_08:45:104.30"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "30m": { value: 1.16, provenance: { status: "DERIVED", source: "DXY Return %", formula: "(104.38 / 103.18) - 1", inputs: ["P_08:29:103.18", "P_09:00:104.38"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "60m": { value: 1.25, provenance: { status: "DERIVED", source: "DXY Return %", formula: "(104.47 / 103.18) - 1", inputs: ["P_08:29:103.18", "P_09:30:104.47"], retrievedAt: "2026-08-17T07:55:00.000Z" } }
      }
    },
    VIX: {
      symbol: "VIX",
      preEventPrice: { timestamp: "2022-06-10T12:29:00.000Z", localTimeET: "08:29:00", price: 26.09, provenance: { status: "OBSERVED", source: "CBOE VIX", retrievedAt: "2026-08-17T07:55:00.000Z" } },
      releasePrice: { timestamp: "2022-06-10T12:30:00.000Z", localTimeET: "08:30:00", price: 26.85, provenance: { status: "OBSERVED", source: "CBOE VIX", retrievedAt: "2026-08-17T07:55:00.000Z" } },
      postEventPrices: {
        "1m": { timestamp: "2022-06-10T12:31:00.000Z", localTimeET: "08:31:00", price: 27.20, provenance: { status: "OBSERVED", source: "CBOE VIX", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "5m": { timestamp: "2022-06-10T12:35:00.000Z", localTimeET: "08:35:00", price: 27.65, provenance: { status: "OBSERVED", source: "CBOE VIX", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "15m": { timestamp: "2022-06-10T12:45:00.000Z", localTimeET: "08:45:00", price: 28.10, provenance: { status: "OBSERVED", source: "CBOE VIX", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "30m": { timestamp: "2022-06-10T13:00:00.000Z", localTimeET: "09:00:00", price: 28.45, provenance: { status: "OBSERVED", source: "CBOE VIX", retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "60m": { timestamp: "2022-06-10T13:30:00.000Z", localTimeET: "09:30:00", price: 28.95, provenance: { status: "OBSERVED", source: "CBOE VIX", retrievedAt: "2026-08-17T07:55:00.000Z" } }
      },
      returns: {
        "1m": { value: 1.11, provenance: { status: "DERIVED", source: "Point Delta", formula: "27.20 - 26.09", inputs: ["P_08:29:26.09", "P_08:31:27.20"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "5m": { value: 1.56, provenance: { status: "DERIVED", source: "Point Delta", formula: "27.65 - 26.09", inputs: ["P_08:29:26.09", "P_08:35:27.65"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "15m": { value: 2.01, provenance: { status: "DERIVED", source: "Point Delta", formula: "28.10 - 26.09", inputs: ["P_08:29:26.09", "P_08:45:28.10"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "30m": { value: 2.36, provenance: { status: "DERIVED", source: "Point Delta", formula: "28.45 - 26.09", inputs: ["P_08:29:26.09", "P_09:00:28.45"], retrievedAt: "2026-08-17T07:55:00.000Z" } },
        "60m": { value: 2.86, provenance: { status: "DERIVED", source: "Point Delta", formula: "28.95 - 26.09", inputs: ["P_08:29:26.09", "P_09:30:28.95"], retrievedAt: "2026-08-17T07:55:00.000Z" } }
      }
    }
  },

  newsVerification: {
    primaryAgencyReleaseConfirmed: true,
    wireReportConfirmed: true,
    officialReleaseTimestampET: "2022-06-10 08:30:00 America/New_York",
    headlineText: "Consumer Price Index – May 2022: CPI rises 8.6% from a year ago, highest increase since December 1981",
    sourceUrls: [
      "https://www.bls.gov/news.release/archives/cpi_06102022.htm",
      "https://www.reuters.com/markets/us/us-consumer-prices-accelerate-may-2022-06-10/"
    ],
    independentConfirmation: true,
    provenance: {
      status: "OBSERVED",
      source: "Bureau of Labor Statistics (USDL-22-1077) & Reuters Wire",
      retrievedAt: "2026-08-17T07:55:00.000Z"
    }
  },

  evidenceBundle: {
    bundleDirectory: "/events/US-CPI-2022-05/",
    macroRawFile: "macro/alfred-response.json",
    consensusSourceFile: "consensus/consensus-source.json",
    marketBarsFiles: {
      nq: "market/nq-bars.json",
      us2y: "market/us2y.json",
      us10y: "market/us10y.json",
      dxy: "market/dxy.json",
      vix: "market/vix.json"
    },
    newsVerificationFile: "news/bls-usdl-22-1077.json",
    goldenVerificationHash: "sha256-e2c7a9f8b4d1c3a6b5e8f0a2c4e6d8b0"
  },

  datasetHash: "sha256-e2c7a9f8b4d1c3a6b5e8f0a2c4e6d8b0"
};
