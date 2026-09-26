import { describe, it, expect } from "vitest";
import { calculateDerivedMetrics, aggregateFunnelMetrics } from "../lib/metrics";

describe("Metrics Engine & Zero-Division Defense", () => {
  it("calculates correct metrics with typical positive values", () => {
    const metrics = calculateDerivedMetrics({
      spend: 500,
      leads: 60,
      apptsSelf: 15,
      apptsSetter: 5,
      sales: 2,
      revenue: 150,
    });

    expect(metrics.totalAppts).toBe(20);
    expect(metrics.cpl).toBe(8.33); // 500 / 60
    expect(metrics.leadToApptPct).toBe(33.3); // 20 / 60 * 100
    expect(metrics.apptToSalePct).toBe(10.0); // 2 / 20 * 100
    expect(metrics.roas).toBe(0.3); // 150 / 500
  });

  it("safely handles 0 leads without NaN or Infinity", () => {
    const metrics = calculateDerivedMetrics({
      spend: 500,
      leads: 0,
      apptsSelf: 0,
      apptsSetter: 0,
      sales: 0,
      revenue: 0,
    });

    expect(metrics.cpl).toBe(0.0);
    expect(metrics.leadToApptPct).toBe(0.0);
    expect(metrics.apptToSalePct).toBe(0.0);
    expect(metrics.roas).toBe(0.0);
  });

  it("safely handles 0 spend without dividing by zero on ROAS", () => {
    const metrics = calculateDerivedMetrics({
      spend: 0,
      leads: 10,
      apptsSelf: 2,
      apptsSetter: 1,
      sales: 1,
      revenue: 1200,
    });

    expect(metrics.cpl).toBe(0.0);
    expect(metrics.roas).toBe(0.0);
    expect(metrics.leadToApptPct).toBe(30.0);
    expect(metrics.apptToSalePct).toBe(33.3);
  });

  it("correctly aggregates multiple daily rows", () => {
    const rows = [
      { spend: 500, leads: 60, apptsSelf: 15, apptsSetter: 5, sales: 2, revenue: 150 },
      { spend: 500, leads: 50, apptsSelf: 1, apptsSetter: 1, sales: 0, revenue: 150 },
      { spend: 500, leads: 55, apptsSelf: 15, apptsSetter: 5, sales: 2, revenue: 150 },
    ];

    const agg = aggregateFunnelMetrics(rows);

    expect(agg.spend).toBe(1500);
    expect(agg.leads).toBe(165);
    expect(agg.apptsSelf).toBe(31);
    expect(agg.apptsSetter).toBe(11);
    expect(agg.totalAppts).toBe(42);
    expect(agg.sales).toBe(4);
    expect(agg.revenue).toBe(450);
    expect(agg.cpl).toBe(9.09); // 1500 / 165
    expect(agg.leadToApptPct).toBe(25.5); // 42 / 165 * 100
    expect(agg.apptToSalePct).toBe(9.5); // 4 / 42 * 100
    expect(agg.roas).toBe(0.3); // 450 / 1500
  });
});
