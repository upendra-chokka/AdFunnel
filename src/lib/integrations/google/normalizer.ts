/**
 * Normalizes Google Ads cost_micros to standard currency units.
 * Google Ads API reports financial values multiplied by 1,000,000.
 */
export function normalizeGoogleMicros(costMicros: string | number): number {
  const micros = typeof costMicros === "string" ? parseFloat(costMicros) : costMicros;
  if (isNaN(micros) || micros <= 0) return 0.0;
  return Number((micros / 1_000_000).toFixed(2));
}

export function parseGoogleMetrics(metrics: {
  costMicros: string | number;
  impressions: string | number;
  clicks: string | number;
  ctr?: string | number;
  averageCpc?: string | number;
}) {
  const spend = normalizeGoogleMicros(metrics.costMicros);
  const impressions = Number(metrics.impressions) || 0;
  const clicks = Number(metrics.clicks) || 0;

  const cpc = clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0.0;
  const ctr = impressions > 0 ? Number((clicks / impressions).toFixed(4)) : 0.0;

  return {
    spend,
    impressions,
    clicks,
    cpc,
    ctr,
  };
}
