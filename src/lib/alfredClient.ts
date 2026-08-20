/**
 * St. Louis Fed / ALFRED (Archival Federal Reserve Economic Data) Client.
 *
 * Dedicated client for querying point-in-time initial vintages of macroeconomic series.
 * ALFRED provides the unrevised value of an economic indicator exactly as it was published
 * on a specific historical vintage date.
 */

export interface AlfredObservationRequest {
  /** The FRED/ALFRED series identifier (e.g., 'CPIAUCSL' for CPI, 'PAYEMS' for Nonfarm Payrolls) */
  seriesId: string;
  /** The point-in-time release date when the data became known (YYYY-MM-DD) */
  vintageDate: string;
  /** The target reference month/period for the observation (YYYY-MM-DD) */
  observationDate: string;
  /** Data transformation units: 'pc1' = % YoY, 'pca' = Compounded Annual Rate, 'lin' = Raw Level */
  units?: "pc1" | "pca" | "lin" | "chg" | "pch";
}

export interface AlfredVintageResult {
  seriesId: string;
  vintageDate: string;
  observationDate: string;
  value: number;
  units: string;
  isRevised: boolean;
  rawObservation: {
    realtime_start: string;
    realtime_end: string;
    date: string;
    value: string;
  };
  fetchedAt: string;
}

export interface AlfredRevisionHistoryRequest {
  seriesId: string;
  observationDate: string;
  apiKey?: string;
}

export interface AlfredRevisionItem {
  vintageDate: string;
  value: number;
}

/**
 * Custom error class for ALFRED API exceptions.
 */
export class AlfredApiError extends Error {
  public readonly status?: number;
  public readonly seriesId: string;
  public readonly vintageDate?: string;
  public readonly details?: any;

  constructor(message: string, options: { status?: number; seriesId: string; vintageDate?: string; details?: any }) {
    super(`[ALFRED Client Error] ${message}`);
    this.name = "AlfredApiError";
    this.status = options.status;
    this.seriesId = options.seriesId;
    this.vintageDate = options.vintageDate;
    this.details = options.details;
  }
}

/**
 * Fetches a single point-in-time observation vintage from ALFRED via the secure proxy endpoint.
 *
 * Example: To fetch the unrevised initial print of March 2024 CPI as published on April 10, 2024:
 * fetchPointInTimeObservation({
 *   seriesId: 'CPIAUCSL',
 *   vintageDate: '2024-04-10',
 *   observationDate: '2024-03-01',
 *   units: 'pc1'
 * })
 */
export async function fetchPointInTimeObservation(
  params: AlfredObservationRequest
): Promise<AlfredVintageResult> {
  const { seriesId, vintageDate, observationDate, units = "pc1" } = params;

  if (!seriesId || !vintageDate || !observationDate) {
    throw new AlfredApiError("Missing required parameters: seriesId, vintageDate, and observationDate are mandatory.", {
      seriesId: seriesId || "UNKNOWN",
      vintageDate,
    });
  }

  const queryParams = new URLSearchParams({
    series_id: seriesId,
    vintage_date: vintageDate,
    observation_start: observationDate,
    observation_end: observationDate,
    units: units,
  });

  const url = `/api/macro/alfred?${queryParams.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (netErr: any) {
    throw new AlfredApiError(`Network failure while requesting ALFRED proxy: ${netErr.message}`, {
      seriesId,
      vintageDate,
      details: netErr,
    });
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || response.statusText || "Request failed";
    throw new AlfredApiError(
      `ALFRED query failed with HTTP ${response.status}: ${errorMsg}${
        data?.documentation ? ` (${data.documentation})` : ""
      }`,
      {
        status: response.status,
        seriesId,
        vintageDate,
        details: data,
      }
    );
  }

  const observations = data?.observations;
  if (!observations || !Array.isArray(observations) || observations.length === 0) {
    throw new AlfredApiError(
      `No observations returned by ALFRED for series ${seriesId} at vintage ${vintageDate} for date ${observationDate}.`,
      {
        status: response.status,
        seriesId,
        vintageDate,
        details: data,
      }
    );
  }

  const obs = observations[0];

  if (!obs.value || obs.value === "." || isNaN(parseFloat(obs.value))) {
    throw new AlfredApiError(
      `ALFRED returned an unpopulated or dot value ('.') for series ${seriesId} on observation ${observationDate} at vintage ${vintageDate}. Data was not yet released or recorded as of this vintage date.`,
      {
        seriesId,
        vintageDate,
        details: obs,
      }
    );
  }

  const parsedValue = parseFloat(obs.value);

  return {
    seriesId,
    vintageDate,
    observationDate,
    value: Number(parsedValue.toFixed(4)),
    units,
    isRevised: obs.realtime_start !== vintageDate,
    rawObservation: obs,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Convenience helper to fetch historical US CPI (% YoY) for standard PIT benchmark dates.
 */
export async function fetchCpiPointInTime(
  vintageDate: "2024-04-10" | "2023-11-14" | "2022-06-10" | string,
  observationDate?: string
): Promise<AlfredVintageResult> {
  // If observationDate is not explicitly supplied, derive reference month (prior month 1st)
  let derivedObsDate = observationDate;
  if (!derivedObsDate) {
    const vDate = new Date(vintageDate);
    const priorMonth = new Date(vDate.getFullYear(), vDate.getMonth() - 1, 1);
    const yyyy = priorMonth.getFullYear();
    const mm = String(priorMonth.getMonth() + 1).padStart(2, "0");
    derivedObsDate = `${yyyy}-${mm}-01`;
  }

  return fetchPointInTimeObservation({
    seriesId: "CPIAUCSL",
    vintageDate,
    observationDate: derivedObsDate,
    units: "pc1", // % YoY
  });
}

/**
 * Fetches the vintage observation value for a specific series, vintage date, and reference date.
 * Explicitly handles 404s/empty observations and normalizes the output value.
 *
 * @param seriesId The FRED/ALFRED series identifier (e.g. 'CPIAUCSL', 'PAYEMS')
 * @param date The vintage date (when the data was published, YYYY-MM-DD)
 * @param realTimeDate The observation/reference period date (e.g. '2024-03-01')
 */
export async function fetchVintageValue(
  seriesId: string,
  date: string,
  realTimeDate: string
): Promise<{
  seriesId: string;
  vintageDate: string;
  observationDate: string;
  value: number | null;
  status: "OK" | "NOT_FOUND" | "NOT_YET_RELEASED";
  units: string;
  raw?: any;
}> {
  try {
    const result = await fetchPointInTimeObservation({
      seriesId,
      vintageDate: date,
      observationDate: realTimeDate,
      units: "pc1",
    });

    return {
      seriesId: result.seriesId,
      vintageDate: result.vintageDate,
      observationDate: result.observationDate,
      value: result.value,
      status: "OK",
      units: result.units,
      raw: result.rawObservation,
    };
  } catch (err: any) {
    if (err instanceof AlfredApiError && (err.status === 404 || err.message.includes("No observations") || err.message.includes("dot value"))) {
      return {
        seriesId,
        vintageDate: date,
        observationDate: realTimeDate,
        value: null,
        status: err.status === 404 ? "NOT_FOUND" : "NOT_YET_RELEASED",
        units: "pc1",
        raw: err.details,
      };
    }
    throw err;
  }
}
