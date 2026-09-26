"use client";

import React, { useState } from "react";
import { DemoDailyRecord } from "@/lib/demo-data";
import { calculateDerivedMetrics, aggregateFunnelMetrics } from "@/lib/metrics";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils";
import {
  Download,
  FileSpreadsheet,
  Check,
  Sparkles,
  Syringe,
  TrendingUp,
  Share2,
  Copy,
  ExternalLink,
} from "lucide-react";

interface DailyMatrixTableProps {
  records: DemoDailyRecord[];
  clientName: string;
}

export function DailyMatrixTable({ records, clientName }: DailyMatrixTableProps) {
  const [copied, setCopied] = useState(false);
  const [showSheetModal, setShowSheetModal] = useState(false);

  // Group records by treatment
  const treatmentGroups = records.reduce<Record<string, DemoDailyRecord[]>>((acc, item) => {
    if (!acc[item.treatmentName]) {
      acc[item.treatmentName] = [];
    }
    acc[item.treatmentName].push(item);
    return acc;
  }, {});

  // Extract unique sorted dates
  const dates = Array.from(new Set(records.map((r) => r.displayDate)));

  // Calculate cumulative summary across all treatments in window
  const totalSummary = aggregateFunnelMetrics(records);

  const handleExportCSV = () => {
    let csv = `Client,Treatment,Metric,${dates.join(",")}\n`;
    Object.entries(treatmentGroups).forEach(([treatmentName, groupRecords]) => {
      const dateMap = new Map(groupRecords.map((r) => [r.displayDate, r]));

      const getVal = (field: keyof DemoDailyRecord) =>
        dates.map((d) => dateMap.get(d)?.[field] ?? 0).join(",");

      const getDerived = (field: "cpl" | "leadToApptPct" | "apptToSalePct" | "roas") =>
        dates
          .map((d) => {
            const r = dateMap.get(d);
            if (!r) return "0";
            const derived = calculateDerivedMetrics(r);
            return derived[field];
          })
          .join(",");

      csv += `"${clientName}","${treatmentName}","Ad Spend",${getVal("spend")}\n`;
      csv += `"${clientName}","${treatmentName}","Leads",${getVal("leads")}\n`;
      csv += `"${clientName}","${treatmentName}","Appts Self Booked",${getVal("apptsSelf")}\n`;
      csv += `"${clientName}","${treatmentName}","Appts Setter Booked",${getVal("apptsSetter")}\n`;
      csv += `"${clientName}","${treatmentName}","Sales",${getVal("sales")}\n`;
      csv += `"${clientName}","${treatmentName}","Revenue",${getVal("revenue")}\n`;
      csv += `"${clientName}","${treatmentName}","CPL",${getDerived("cpl")}\n`;
      csv += `"${clientName}","${treatmentName}","Lead to Appt",${getDerived("leadToApptPct")}%\n`;
      csv += `"${clientName}","${treatmentName}","Appt to Sale",${getDerived("apptToSalePct")}%\n`;
      csv += `"${clientName}","${treatmentName}","ROAS",${getDerived("roas")}\n\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `AdFunnel_${clientName.replace(/\s+/g, "_")}_Daily_Matrix.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Cumulative Period Summary Banner */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Period Spend
          </span>
          <span className="text-lg font-black text-slate-900">{formatCurrency(totalSummary.spend)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Leads
          </span>
          <span className="text-lg font-black text-slate-900">{formatNumber(totalSummary.leads)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg Period CPL
          </span>
          <span className="text-lg font-black text-blue-700">{formatCurrency(totalSummary.cpl)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Appointments
          </span>
          <span className="text-lg font-black text-slate-900">
            {totalSummary.totalAppts}{" "}
            <span className="text-xs text-slate-400 font-semibold">
              ({totalSummary.apptsSelf}s / {totalSummary.apptsSetter}m)
            </span>
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Sales
          </span>
          <span className="text-lg font-black text-slate-900">{totalSummary.sales} Won</span>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-300 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Period Revenue (ROAS)
          </span>
          <span className="text-lg font-black text-emerald-900">
            {formatCurrency(totalSummary.revenue)}{" "}
            <span className="text-xs font-bold text-emerald-700">({formatRoas(totalSummary.roas)})</span>
          </span>
        </div>
      </div>

      {/* Main Table Glass Panel */}
      <div className="glass-panel rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Top Controls Bar */}
        <div className="p-5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Daily Treatment Funnel Matrix
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                <Sparkles className="h-3 w-3 text-blue-600" />
                Live Sheet Model
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Client: <span className="font-bold text-slate-800">{clientName}</span> • Continuous daily performance breakdown with computed ratios
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSheetModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all shadow-sm"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Google Sheets Sync</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-extrabold">CSV Exported!</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-3.5 w-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Spreadsheet Matrix Content */}
        <div className="overflow-x-auto matrix-scroll">
          <table className="w-full text-xs text-left border-collapse matrix-table">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-5 w-64 sticky left-0 bg-slate-100/95 backdrop-blur-md z-10 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Treatment / Daily Metric
                </th>
                {dates.map((date) => (
                  <th
                    key={date}
                    className="py-3 px-4 min-w-[115px] text-center border-r border-slate-200 font-black text-slate-800 uppercase tracking-wider text-[11px]"
                  >
                    {date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(treatmentGroups).map(([treatmentName, groupRecords]) => {
                const dateMap = new Map(groupRecords.map((r) => [r.displayDate, r]));

                return (
                  <React.Fragment key={treatmentName}>
                    {/* Treatment Hero Row */}
                    <tr className="bg-gradient-to-r from-rose-50/80 via-rose-50/40 to-white border-t-2 border-slate-300">
                      <td
                        colSpan={dates.length + 1}
                        className="py-3 px-5 font-black text-sm text-slate-900 sticky left-0 bg-rose-50/90 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-rose-500 text-white">
                            <Syringe className="h-3.5 w-3.5" />
                          </div>
                          <span>{treatmentName}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Ad Spend */}
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-5 font-semibold text-slate-700 sticky left-0 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        Ad Spend
                      </td>
                      {dates.map((d) => (
                        <td key={d} className="py-2.5 px-4 text-center border-r border-slate-200 text-slate-900 font-bold">
                          {formatCurrency(dateMap.get(d)?.spend ?? 0)}
                        </td>
                      ))}
                    </tr>

                    {/* Leads */}
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-5 font-semibold text-slate-700 sticky left-0 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        Leads
                      </td>
                      {dates.map((d) => (
                        <td key={d} className="py-2.5 px-4 text-center border-r border-slate-200 text-slate-900 font-semibold">
                          {dateMap.get(d)?.leads ?? 0}
                        </td>
                      ))}
                    </tr>

                    {/* Appts Self Booked */}
                    <tr className="hover:bg-slate-50/60 bg-slate-50/30">
                      <td className="py-2 px-5 font-medium text-slate-600 pl-8 sticky left-0 bg-slate-50/80 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-[11px]">
                        ↳ Appts Self Booked
                      </td>
                      {dates.map((d) => (
                        <td key={d} className="py-2 px-4 text-center border-r border-slate-200 text-slate-600 text-[11px]">
                          {dateMap.get(d)?.apptsSelf ?? 0}
                        </td>
                      ))}
                    </tr>

                    {/* Appts Setter Booked */}
                    <tr className="hover:bg-slate-50/60 bg-slate-50/30">
                      <td className="py-2 px-5 font-medium text-slate-600 pl-8 sticky left-0 bg-slate-50/80 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-[11px]">
                        ↳ Appts Setter Booked
                      </td>
                      {dates.map((d) => (
                        <td key={d} className="py-2 px-4 text-center border-r border-slate-200 text-slate-600 text-[11px]">
                          {dateMap.get(d)?.apptsSetter ?? 0}
                        </td>
                      ))}
                    </tr>

                    {/* Sales */}
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-5 font-semibold text-slate-700 sticky left-0 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        Sales
                      </td>
                      {dates.map((d) => (
                        <td key={d} className="py-2.5 px-4 text-center border-r border-slate-200 font-black text-slate-900">
                          {dateMap.get(d)?.sales ?? 0}
                        </td>
                      ))}
                    </tr>

                    {/* Revenue */}
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-5 font-semibold text-slate-700 sticky left-0 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        Revenue
                      </td>
                      {dates.map((d) => (
                        <td key={d} className="py-2.5 px-4 text-center border-r border-slate-200 font-black text-emerald-700">
                          {formatCurrency(dateMap.get(d)?.revenue ?? 0)}
                        </td>
                      ))}
                    </tr>

                    {/* Spacer separator */}
                    <tr className="bg-slate-100/60">
                      <td colSpan={dates.length + 1} className="py-1"></td>
                    </tr>

                    {/* CPL */}
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2 px-5 font-bold text-slate-900 sticky left-0 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        CPL (Calculated)
                      </td>
                      {dates.map((d) => {
                        const r = dateMap.get(d);
                        const derived = r ? calculateDerivedMetrics(r) : { cpl: 0 };
                        return (
                          <td key={d} className="py-2 px-4 text-center border-r border-slate-200 font-extrabold text-slate-900">
                            {formatCurrency(derived.cpl)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Lead to Appt % */}
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2 px-5 font-bold text-slate-900 sticky left-0 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        Lead to Appt %
                      </td>
                      {dates.map((d) => {
                        const r = dateMap.get(d);
                        const derived = r ? calculateDerivedMetrics(r) : { leadToApptPct: 0 };
                        return (
                          <td key={d} className="py-2 px-4 text-center border-r border-slate-200 font-bold text-indigo-700">
                            {formatPercent(derived.leadToApptPct)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Appt to Sale % */}
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2 px-5 font-bold text-slate-900 sticky left-0 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        Appt to Sale %
                      </td>
                      {dates.map((d) => {
                        const r = dateMap.get(d);
                        const derived = r ? calculateDerivedMetrics(r) : { apptToSalePct: 0 };
                        return (
                          <td key={d} className="py-2 px-4 text-center border-r border-slate-200 font-bold text-violet-700">
                            {formatPercent(derived.apptToSalePct)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* ROAS */}
                    <tr className="hover:bg-emerald-50/60 bg-emerald-50/30">
                      <td className="py-2.5 px-5 font-black text-slate-900 sticky left-0 bg-emerald-50/80 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        ROAS (Calculated)
                      </td>
                      {dates.map((d) => {
                        const r = dateMap.get(d);
                        const derived = r ? calculateDerivedMetrics(r) : { roas: 0 };
                        const isHigh = derived.roas >= 2.0;
                        return (
                          <td key={d} className="py-2.5 px-4 text-center border-r border-slate-200">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                                isHigh
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  : "bg-slate-100 text-slate-800 border border-slate-200"
                              }`}
                            >
                              {formatRoas(derived.roas)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Clean row break */}
                    <tr>
                      <td colSpan={dates.length + 1} className="py-3 bg-slate-100/50 border-y border-slate-200"></td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Sheets Export Modal */}
      {showSheetModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Google Sheets Live Sync Destination
                </h3>
                <p className="text-xs text-slate-500">
                  Export or connect real-time spreadsheet webhooks directly to Google Sheets.
                </p>
              </div>
            </div>

            <div className="space-y-4 my-5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Live Webhook Endpoint for Google Sheets AppScript</span>
                <code className="block bg-white p-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 select-all">
                  https://app.adfunnel.io/api/sync/sheets?client={clientName.toLowerCase().replace(/\s+/g, "_")}
                </code>
              </div>

              <div className="text-slate-600 space-y-1.5 leading-relaxed">
                <p>
                  <strong>How it works:</strong> Rather than using Google Sheets as the database (which breaks formulas and loses click identifiers), AdFunnel acts as the PostgreSQL source of truth and continuously publishes clean daily aggregates into your client&apos;s designated Google Sheet tab every morning at 03:00 UTC.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowSheetModal(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleExportCSV();
                  setShowSheetModal(false);
                }}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
              >
                Download Sheet CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
