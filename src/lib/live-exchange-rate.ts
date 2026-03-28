import {
  formatSparklineValues,
  getTrend,
  type ExchangeRateSnapshot,
  type Trend,
} from "@lib/exchange-rate";

type ExchangeRateApiResponse = {
  result?: string;
  documentation?: string;
  provider?: string;
  time_last_update_utc?: string;
  rates?: Record<string, number>;
};

type CachedRatePoint = {
  rate: number;
  updatedAt: string;
};

export type LiveExchangeRateResult = ExchangeRateSnapshot & {
  trend: Trend;
  sourceLabel: string;
  sourceUrl: string;
};

const EXCHANGE_RATE_URL = "https://open.er-api.com/v6/latest/USD";
const RATE_STORAGE_KEY = "dolar-mood-cr:rate-history";
const MAX_HISTORY_POINTS = 10;

export async function fetchLiveExchangeRate(): Promise<LiveExchangeRateResult> {
  const response = await fetch(EXCHANGE_RATE_URL);

  if (!response.ok) {
    throw new Error(`No se pudo cargar la tasa: ${response.status}`);
  }

  const payload = (await response.json()) as ExchangeRateApiResponse;
  const currentRate = payload.rates?.CRC;
  const updatedAt = payload.time_last_update_utc;

  if (payload.result !== "success" || typeof currentRate !== "number" || !updatedAt) {
    throw new Error("La API no devolvio un CRC valido.");
  }

  const nextPoint: CachedRatePoint = {
    rate: Number(currentRate.toFixed(2)),
    updatedAt,
  };

  const history = mergeRatePoint(nextPoint);
  const previousPoint = history.at(-2) ?? history.at(-1) ?? nextPoint;
  const sparkline = formatSparklineValues(
    history.map((point) => point.rate),
    nextPoint.rate,
  );

  return {
    currentRate: nextPoint.rate,
    previousRate: previousPoint.rate,
    updatedAt,
    sparkline,
    trend: getTrend(nextPoint.rate, previousPoint.rate),
    sourceLabel: "ExchangeRate-API",
    sourceUrl: payload.documentation ?? "https://www.exchangerate-api.com/docs/free",
  };
}

function mergeRatePoint(nextPoint: CachedRatePoint): CachedRatePoint[] {
  const history = readHistory();
  const dedupedHistory = history.filter((point) => point.updatedAt !== nextPoint.updatedAt);
  const merged = [...dedupedHistory, nextPoint]
    .sort((left, right) => new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime())
    .slice(-MAX_HISTORY_POINTS);

  writeHistory(merged);
  return merged;
}

function readHistory(): CachedRatePoint[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RATE_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CachedRatePoint[];
    return parsed.filter(
      (point) =>
        typeof point.rate === "number" &&
        Number.isFinite(point.rate) &&
        typeof point.updatedAt === "string",
    );
  } catch {
    return [];
  }
}

function writeHistory(history: CachedRatePoint[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RATE_STORAGE_KEY, JSON.stringify(history));
}
