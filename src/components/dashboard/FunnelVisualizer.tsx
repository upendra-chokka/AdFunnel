import React from "react";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils";
import { FullMetrics } from "@/lib/metrics";
import { DollarSign, Users, CalendarCheck, Award, TrendingUp, ChevronRight, Zap } from "lucide-react";

interface FunnelVisualizerProps {
  metrics: FullMetrics;
}

export function FunnelVisualizer({ metrics }: FunnelVisualizerProps) {
  const steps = [
    {
      label: "Ad Spend",
      value: formatCurrency(metrics.spend),
      sub: "Meta & Google Ads",
      icon: DollarSign,
      gradient: "from-blue-600 to-blue-700",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      conversionNext: null,
    },
    {
      label: "Leads Acquired",
      value: formatNumber(metrics.leads),
      sub: `Avg CPL: ${formatCurrency(metrics.cpl)}`,
      icon: Users,
      gradient: "from-indigo-600 to-indigo-700",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      conversionNext: {
        label: "Lead \(\to\) Appt",
        pct: formatPercent(metrics.leadToApptPct),
      },
    },
    {
      label: "Appointments",
      value: formatNumber(metrics.totalAppts),
      sub: `${metrics.apptsSelf} Self • ${metrics.apptsSetter} Setter`,
      icon: CalendarCheck,
      gradient: "from-violet-600 to-violet-700",
      badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
      conversionNext: {
        label: "Appt \(\to\) Sale",
        pct: formatPercent(metrics.apptToSalePct),
      },
    },
    {
      label: "Sales (Won)",
      value: formatNumber(metrics.sales),
      sub: `Closing: ${formatPercent(metrics.apptToSalePct)}`,
      icon: Award,
      gradient: "from-emerald-600 to-teal-700",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      conversionNext: null,
    },
    {
      label: "Revenue Collected",
      value: formatCurrency(metrics.revenue),
      sub: `ROAS: ${formatRoas(metrics.roas)}`,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-green-600",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
      conversionNext: null,
    },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-sm border border-slate-200/90 relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Customer Journey Funnel & Value Pipeline
            </h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Live Flow
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full-funnel attribution tracking each prospect from paid ad impression to closed procedure
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs">
            <span className="text-slate-500 font-semibold">Blended ROAS:</span>
            <span className="font-black text-emerald-800 text-sm">{formatRoas(metrics.roas)}</span>
          </div>
        </div>
      </div>

      {/* Visual Funnel Sequence */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="relative flex flex-col justify-between">
              <div className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-sm h-full flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`h-7 w-7 rounded-lg bg-gradient-to-tr ${step.gradient} text-white flex items-center justify-center shadow-md shadow-slate-900/10`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">Step 0{idx + 1}</span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {step.label}
                  </span>
                  <div className="text-xl font-black text-slate-900 tracking-tight my-1 group-hover:text-blue-600 transition-colors">
                    {step.value}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 mt-2">
                  <div className="text-[11px] font-medium text-slate-500">{step.sub}</div>

                  {step.conversionNext && (
                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                      <span>{step.conversionNext.label}</span>
                      <span className="text-blue-700 font-extrabold flex items-center">
                        {step.conversionNext.pct}
                        <ChevronRight className="h-3 w-3 inline text-blue-500 ml-0.5" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
