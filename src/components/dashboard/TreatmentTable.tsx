import React from "react";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils";
import { FullMetrics } from "@/lib/metrics";
import { Syringe, ArrowUpRight, TrendingUp } from "lucide-react";

export interface TreatmentSummaryRow extends FullMetrics {
  id: string;
  treatmentName: string;
  clientName: string;
  targetCpl: number;
  targetRoas: number;
}

interface TreatmentTableProps {
  rows: TreatmentSummaryRow[];
  title?: string;
}

export function TreatmentTable({ rows, title = "Treatment Procedure Performance & Unit Economics" }: TreatmentTableProps) {
  return (
    <div className="glass-panel rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated conversion rates, CPL, and target ROAS variance by medical spa procedure
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-5">Treatment Offer</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4 text-right">Ad Spend</th>
              <th className="py-3 px-4 text-right">Leads</th>
              <th className="py-3 px-4 text-right">CPL</th>
              <th className="py-3 px-4 text-right">Appts (Self / Setter)</th>
              <th className="py-3 px-4 text-right">Lead \(\to\) Appt</th>
              <th className="py-3 px-4 text-right">Sales</th>
              <th className="py-3 px-4 text-right">Appt \(\to\) Sale</th>
              <th className="py-3 px-4 text-right">Revenue</th>
              <th className="py-3 px-5 text-right">Blended ROAS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {rows.map((row) => {
              const roasExceeds = row.roas >= row.targetRoas;
              return (
                <tr key={`${row.clientName}-${row.treatmentName}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-rose-100 text-rose-700">
                        <Syringe className="h-3.5 w-3.5" />
                      </div>
                      <span>{row.treatmentName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{row.clientName}</td>
                  <td className="py-3 px-4 text-right text-slate-900 font-bold">{formatCurrency(row.spend)}</td>
                  <td className="py-3 px-4 text-right text-slate-900 font-semibold">{formatNumber(row.leads)}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">{formatCurrency(row.cpl)}</td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    <span className="font-extrabold text-slate-900">{row.totalAppts}</span>{" "}
                    <span className="text-[10px] text-slate-400">({row.apptsSelf}s / {row.apptsSetter}m)</span>
                  </td>
                  <td className="py-3 px-4 text-right text-indigo-700 font-extrabold">{formatPercent(row.leadToApptPct)}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">{row.sales}</td>
                  <td className="py-3 px-4 text-right text-violet-700 font-extrabold">{formatPercent(row.apptToSalePct)}</td>
                  <td className="py-3 px-4 text-right font-black text-emerald-700">{formatCurrency(row.revenue)}</td>
                  <td className="py-3 px-5 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                        roasExceeds
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {formatRoas(row.roas)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
