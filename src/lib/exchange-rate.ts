export type Trend = "up" | "down" | "stable";

export type ExchangeRateSnapshot = {
  currentRate: number;
  previousRate: number;
  updatedAt: string;
  sparkline: number[];
};

export const TREND_STABLE_THRESHOLD = 0.35;

export const mockExchangeRate: ExchangeRateSnapshot = {
  currentRate: 512.4,
  previousRate: 508.9,
  updatedAt: "2026-03-28T13:30:00-06:00",
  sparkline: [506.7, 507.4, 507.2, 508.3, 509.4, 510.2, 511.1, 512.4],
};

export function getTrend(currentRate: number, previousRate: number): Trend {
  const difference = currentRate - previousRate;

  if (Math.abs(difference) < TREND_STABLE_THRESHOLD) {
    return "stable";
  }

  return difference > 0 ? "up" : "down";
}

export function getRateChange(currentRate: number, previousRate: number): number {
  return Number((currentRate - previousRate).toFixed(2));
}

export function formatSparklineValues(values: number[], fallbackValue: number): number[] {
  const normalized = values
    .filter((value) => Number.isFinite(value))
    .map((value) => Number(value.toFixed(2)));

  if (normalized.length > 1) {
    return normalized;
  }

  return [fallbackValue, fallbackValue];
}
