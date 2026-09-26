"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { DEMO_DAILY_RECORDS } from "@/lib/demo-data";
import { DailyMatrixTable } from "@/components/daily/DailyMatrixTable";
import { Info, Sparkles } from "lucide-react";

export default function DailyPerformancePage() {
  const { selectedClientId, selectedClient, clients } = useApp();
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>("all");

  const effectiveClient = selectedClient || clients[0];

  const clientRecords = useMemo(() => {
    return DEMO_DAILY_RECORDS.filter((r) => r.clientId === effectiveClient.id);
  }, [effectiveClient.id]);

  const filteredRecords = useMemo(() => {
    if (selectedTreatmentId === "all") return clientRecords;
    return clientRecords.filter((r) => r.treatmentId === selectedTreatmentId);
  }, [clientRecords, selectedTreatmentId]);

  return (
    <div className="space-y-6">
      {/* Header and Explanation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Daily Funnel Performance Matrix
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Spreadsheet View
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic, automated replacement for the manual daily tracking sheet. Every day tracks spend, leads, self/setter booked appointments, sales, and derived ratios.
          </p>
        </div>

        {/* Treatment Filter Pill Switcher */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
          <button
            onClick={() => setSelectedTreatmentId("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              selectedTreatmentId === "all"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            All Treatments
          </button>
          {effectiveClient.treatments.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTreatmentId(t.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                selectedTreatmentId === t.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Reference UI Callout Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Live Spreadsheet Automation:</span> In the legacy Google Sheet, Jamie had to manually record columns 9/23, 9/24, 9/25 and hand-write formulas for CPL, Lead-to-Appt %, Appt-to-Sale %, and ROAS. In AdFunnel Intelligence, these values are populated automatically via real-time webhooks and scheduled reconciliation with zero-denominator error handling.
        </div>
      </div>

      {/* The Daily Matrix Table Component */}
      <DailyMatrixTable records={filteredRecords} clientName={effectiveClient.name} />
    </div>
  );
}
