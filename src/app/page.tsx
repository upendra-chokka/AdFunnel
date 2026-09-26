"use client";

import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { DEMO_DAILY_RECORDS, DEMO_CLIENTS } from "@/lib/demo-data";
import { aggregateFunnelMetrics, calculateDerivedMetrics } from "@/lib/metrics";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FunnelVisualizer } from "@/components/dashboard/FunnelVisualizer";
import { TreatmentTable, TreatmentSummaryRow } from "@/components/dashboard/TreatmentTable";
import {
  DollarSign,
  Users,
  CalendarCheck,
  Award,
  TrendingUp,
  Percent,
  Table as TableIcon,
  ArrowRight,
  Sparkles,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function ExecutiveDashboard() {
  const { selectedClientId, selectedClient } = useApp();

  // Filter records by client
  const filteredRecords = useMemo(() => {
    if (selectedClientId === "all") {
      return DEMO_DAILY_RECORDS;
    }
    return DEMO_DAILY_RECORDS.filter((r) => r.clientId === selectedClientId);
  }, [selectedClientId]);

  // Aggregate metrics
  const fullMetrics = useMemo(() => {
    return aggregateFunnelMetrics(filteredRecords);
  }, [filteredRecords]);

  // Daily Chart Data (Spend vs Revenue & Leads)
  const chartData = useMemo(() => {
    const map = new Map<string, { date: string; displayDate: string; spend: number; revenue: number; leads: number }>();
    filteredRecords.forEach((r) => {
      if (!map.has(r.displayDate)) {
        map.set(r.displayDate, {
          date: r.date,
          displayDate: r.displayDate,
          spend: 0,
          revenue: 0,
          leads: 0,
        });
      }
      const entry = map.get(r.displayDate)!;
      entry.spend += r.spend;
      entry.revenue += r.revenue;
      entry.leads += r.leads;
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRecords]);

  // Generate treatment breakdown rows
  const treatmentRows = useMemo<TreatmentSummaryRow[]>(() => {
    const map = new Map<string, typeof filteredRecords>();
    filteredRecords.forEach((r) => {
      const key = `${r.clientId}_${r.treatmentId}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });

    const rows: TreatmentSummaryRow[] = [];
    map.forEach((items, key) => {
      const agg = aggregateFunnelMetrics(items);
      const first = items[0];
      const client = DEMO_CLIENTS.find((c) => c.id === first.clientId);
      const treatment = client?.treatments.find((t) => t.id === first.treatmentId);

      rows.push({
        ...agg,
        id: key,
        treatmentName: first.treatmentName,
        clientName: client?.name || "Unknown Client",
        targetCpl: treatment?.targetCpl || 25.0,
        targetRoas: treatment?.targetRoas || 2.5,
      });
    });

    return rows;
  }, [filteredRecords]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {selectedClient ? selectedClient.name : "Agency-Wide Executive Overview"}
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time marketing ROI across Meta Ads, Google Ads, and GoHighLevel CRM.
          </p>
        </div>

        <Link
          href="/daily"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <TableIcon className="h-4 w-4" />
          <span>Open Daily Sheet Matrix</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard
          title="Ad Spend"
          value={formatCurrency(fullMetrics.spend)}
          subtitle="Meta + Google Ads"
          icon={DollarSign}
          trend={{ value: "+8.4%", isPositive: true }}
          accentColor="text-blue-600 bg-blue-50/80 border-blue-200/50"
          borderColor="border-t-blue-500"
        />
        <KpiCard
          title="Leads (CPL)"
          value={formatNumber(fullMetrics.leads)}
          subtitle={`Avg CPL: ${formatCurrency(fullMetrics.cpl)}`}
          icon={Users}
          trend={{ value: "-12.1% CPL", isPositive: true }}
          accentColor="text-indigo-600 bg-indigo-50/80 border-indigo-200/50"
          borderColor="border-t-indigo-500"
        />
        <KpiCard
          title="Appointments"
          value={formatNumber(fullMetrics.totalAppts)}
          subtitle={`${fullMetrics.apptsSelf} Self • ${fullMetrics.apptsSetter} Setter`}
          icon={CalendarCheck}
          trend={{ value: "+14.8%", isPositive: true }}
          accentColor="text-violet-600 bg-violet-50/80 border-violet-200/50"
          borderColor="border-t-violet-500"
        />
        <KpiCard
          title="Lead \(\to\) Appt"
          value={formatPercent(fullMetrics.leadToApptPct)}
          subtitle="Benchmark: >30.0%"
          icon={Percent}
          accentColor="text-amber-600 bg-amber-50/80 border-amber-200/50"
          borderColor="border-t-amber-500"
        />
        <KpiCard
          title="Sales Closed"
          value={formatNumber(fullMetrics.sales)}
          subtitle={`Close: ${formatPercent(fullMetrics.apptToSalePct)}`}
          icon={Award}
          trend={{ value: "+22.5%", isPositive: true }}
          accentColor="text-emerald-600 bg-emerald-50/80 border-emerald-200/50"
          borderColor="border-t-emerald-500"
        />
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(fullMetrics.revenue)}
          subtitle={`ROAS: ${formatRoas(fullMetrics.roas)}`}
          icon={TrendingUp}
          trend={{ value: `${formatRoas(fullMetrics.roas)} ROAS`, isPositive: true }}
          accentColor="text-emerald-700 bg-emerald-100/80 border-emerald-300/50"
          borderColor="border-t-emerald-600"
        />
      </div>

      {/* Visual Funnel */}
      <FunnelVisualizer metrics={fullMetrics} />

      {/* Analytics Trend Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend vs Revenue Area Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-sm border border-slate-200/90">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Daily Revenue vs. Ad Spend Velocity
              </h3>
              <p className="text-xs text-slate-500">
                Pacing comparison across active advertising accounts
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                Ad Spend
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
                Cash Revenue
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), ""]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    border: "none",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendGrad)"
                  name="Ad Spend"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revGrad)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Leads Volume Bar Chart */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm border border-slate-200/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Lead Ingestion Volume
                </h3>
                <p className="text-xs text-slate-500">Daily CRM contacts acquired</p>
              </div>
              <BarChart3 className="h-4 w-4 text-indigo-600" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="leads" fill="#6366f1" radius={[6, 6, 0, 0]} name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Treatment Performance Breakdown */}
      <TreatmentTable rows={treatmentRows} />
    </div>
  );
}
