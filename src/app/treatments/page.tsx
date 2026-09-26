"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Plus, Syringe, Target, Sparkles } from "lucide-react";
import { formatCurrency, formatRoas } from "@/lib/utils";

export default function TreatmentsPage() {
  const { selectedClient, clients } = useApp();
  const effectiveClient = selectedClient || clients[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Treatments & Service Offers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure medical spa procedures, category groupings, and performance benchmark targets.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Add Treatment Offer</span>
        </button>
      </div>

      {/* Treatments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Active Procedures for <span className="text-blue-700 font-bold">{effectiveClient.name}</span>
          </span>
          <span className="text-xs text-slate-400">
            {effectiveClient.treatments.length} Configured Offers
          </span>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-4">Treatment Offer</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Target CPL</th>
              <th className="py-3 px-4 text-right">Target ROAS</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {effectiveClient.treatments.map((treatment) => (
              <tr key={treatment.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <Syringe className="h-4 w-4 text-blue-600" />
                  <span>{treatment.name}</span>
                </td>
                <td className="py-3 px-4 text-slate-600">{treatment.category}</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">
                  {formatCurrency(treatment.targetCpl)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">
                  {formatRoas(treatment.targetRoas)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs">
                    Edit Targets
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
