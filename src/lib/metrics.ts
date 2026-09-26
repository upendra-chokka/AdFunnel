export interface FunnelMetrics {
  spend: number;
  leads: number;
  apptsSelf: number;
  apptsSetter: number;
  sales: number;
  revenue: number;
}

export interface DerivedMetrics {
  totalAppts: number;
  cpl: number;
  leadToApptPct: number;
  apptToSalePct: number;
  roas: number;
}

export interface FullMetrics extends FunnelMetrics, DerivedMetrics {}

/**
 * Centrally calculates derived metrics from raw funnel totals.
 * Defends strictly against division-by-zero, returning 0.0 rather than NaN or Infinity.
 */
export function calculateDerivedMetrics(m: FunnelMetrics): DerivedMetrics {
  const totalAppts = (m.apptsSelf || 0) + (m.apptsSetter || 0);

  // CPL = Ad Spend / Leads
  const cpl = m.leads > 0 ? Number(((m.spend || 0) / m.leads).toFixed(2)) : 0.0;

  // Lead -> Appt % = Total Appointments / Leads * 100
  const leadToApptPct =
    m.leads > 0 ? Number(((totalAppts / m.leads) * 100).toFixed(1)) : 0.0;

  // Appt -> Sale % = Sales / Total Appointments * 100
  const apptToSalePct =
    totalAppts > 0 ? Number((((m.sales || 0) / totalAppts) * 100).toFixed(1)) : 0.0;

  // ROAS = Revenue / Ad Spend
  const roas = m.spend > 0 ? Number(((m.revenue || 0) / m.spend).toFixed(2)) : 0.0;

  return {
    totalAppts,
    cpl,
    leadToApptPct,
    apptToSalePct,
    roas,
  };
}

export function aggregateFunnelMetrics(metricsList: FunnelMetrics[]): FullMetrics {
  const rawSum = metricsList.reduce(
    (acc, curr) => ({
      spend: acc.spend + (curr.spend || 0),
      leads: acc.leads + (curr.leads || 0),
      apptsSelf: acc.apptsSelf + (curr.apptsSelf || 0),
      apptsSetter: acc.apptsSetter + (curr.apptsSetter || 0),
      sales: acc.sales + (curr.sales || 0),
      revenue: acc.revenue + (curr.revenue || 0),
    }),
    { spend: 0, leads: 0, apptsSelf: 0, apptsSetter: 0, sales: 0, revenue: 0 }
  );

  const derived = calculateDerivedMetrics(rawSum);

  return {
    ...rawSum,
    ...derived,
  };
}
