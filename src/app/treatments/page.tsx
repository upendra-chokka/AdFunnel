"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Plus, Syringe, Target, Sparkles, Edit3, Check } from "lucide-react";
import { formatCurrency, formatRoas } from "@/lib/utils";

export default function TreatmentsPage() {
  const { selectedClient, clients } = useApp();
  const effectiveClient = selectedClient || clients[0];

  const [treatments, setTreatments] = useState(effectiveClient.treatments);
  const [editingTreatment, setEditingTreatment] = useState<any>(null);
  const [newCpl, setNewCpl] = useState<number>(25);
  const [newRoas, setNewRoas] = useState<number>(2.5);

  const handleSaveTargets = () => {
    if (!editingTreatment) return;
    setTreatments((prev) =>
      prev.map((t) =>
        t.id === editingTreatment.id
          ? { ...t, targetCpl: newCpl, targetRoas: newRoas }
          : t
      )
    );
    setEditingTreatment(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Treatments & Procedure Targets
            </h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              Unit Economics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure clinic service offers, allowable Cost Per Lead (CPL) benchmarks, and target ROAS goals.
          </p>
        </div>

        <button
          onClick={() => {
            const name = prompt("Enter new treatment offer name:");
            if (name) {
              setTreatments((prev) => [
                ...prev,
                {
                  id: `t_new_${Date.now()}`,
                  clientId: effectiveClient.id,
                  name,
                  category: "Aesthetics",
                  targetCpl: 30.0,
                  targetRoas: 2.5,
                },
              ]);
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Treatment Offer</span>
        </button>
      </div>

      {/* Treatments Table */}
      <div className="glass-panel rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Active Procedures for <span className="text-blue-700 font-extrabold">{effectiveClient.name}</span>
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {treatments.length} Configured Offers
          </span>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
            <tr>
              <th className="py-3 px-5">Treatment Offer</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Target CPL (Max)</th>
              <th className="py-3 px-4 text-right">Target ROAS</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {treatments.map((treatment) => (
              <tr key={treatment.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-5 font-bold text-slate-900 flex items-center gap-2.5">
                  <div className="p-1 rounded-md bg-rose-100 text-rose-700">
                    <Syringe className="h-3.5 w-3.5" />
                  </div>
                  <span>{treatment.name}</span>
                </td>
                <td className="py-3 px-4 text-slate-600 font-semibold">{treatment.category}</td>
                <td className="py-3 px-4 text-right font-black text-slate-900">
                  {formatCurrency(treatment.targetCpl)}
                </td>
                <td className="py-3 px-4 text-right font-black text-emerald-700">
                  {formatRoas(treatment.targetRoas)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Active
                  </span>
                </td>
                <td className="py-3 px-5 text-right">
                  <button
                    onClick={() => {
                      setEditingTreatment(treatment);
                      setNewCpl(treatment.targetCpl);
                      setNewRoas(treatment.targetRoas);
                    }}
                    className="flex items-center gap-1 ml-auto text-blue-600 hover:text-blue-800 font-bold text-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Targets</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Targets Modal */}
      {editingTreatment && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-black text-slate-900 mb-1">
              Edit Benchmark Targets
            </h3>
            <p className="text-xs text-slate-500 mb-4">{editingTreatment.name}</p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target CPL ($ Maximum)</label>
                <input
                  type="number"
                  value={newCpl}
                  onChange={(e) => setNewCpl(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target ROAS Goal</label>
                <input
                  type="number"
                  step="0.1"
                  value={newRoas}
                  onChange={(e) => setNewRoas(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditingTreatment(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTargets}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
