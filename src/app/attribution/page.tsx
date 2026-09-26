"use client";

import React, { useState } from "react";
import { GitFork, CheckCircle, ArrowRight, ShieldCheck, Zap, Layers, Plus, Filter } from "lucide-react";
import { DEFAULT_MAPPING_RULES } from "@/lib/attribution/engine";

export default function AttributionPage() {
  const [rules, setRules] = useState(DEFAULT_MAPPING_RULES);
  const [activeTab, setActiveTab] = useState<"journeys" | "mapping">("journeys");

  const journeys = [
    {
      id: "j_01",
      leadName: "Jessica Miller",
      campaign: "NYC | Botox | Broad Interest | Sept 2026",
      clickId: "fbclid=IwAR28fK9L01...",
      treatment: "Botox (Treatment 1)",
      leadDate: "Sep 23, 2026 (09:14 AM)",
      bookedType: "Self Booked (Online Widget)",
      apptDate: "Sep 24, 2026 (02:00 PM)",
      stage: "Won - Treatment Completed",
      revenue: "$450.00",
      confidence: "1.00 (Exact FBCLID Match)",
      matchedBy: "Tier 1: Click ID",
    },
    {
      id: "j_02",
      leadName: "Amanda Peterson",
      campaign: "NYC | Lip Filler | Plump & Natural | Sept 2026",
      clickId: "utm_campaign=lip_filler_sept",
      treatment: "Lip Filler (Treatment 2)",
      leadDate: "Sep 24, 2026 (11:32 AM)",
      bookedType: "Setter Booked (Outbound SMS)",
      apptDate: "Sep 26, 2026 (11:00 AM)",
      stage: "Won - Package Purchased",
      revenue: "$650.00",
      confidence: "0.95 (UTM Campaign Match)",
      matchedBy: "Tier 2: UTM Campaign",
    },
    {
      id: "j_03",
      leadName: "David Thornton",
      campaign: "Google Search | Laser Hair Removal NYC | Exact",
      clickId: "gclid=Cj0KCQjwmv...",
      treatment: "Laser Hair Removal (Treatment 3)",
      leadDate: "Sep 25, 2026 (04:15 PM)",
      bookedType: "Self Booked (Direct Calendar)",
      apptDate: "Sep 27, 2026 (04:30 PM)",
      stage: "Won - 6-Session Package",
      revenue: "$1,200.00",
      confidence: "1.00 (Exact GCLID Match)",
      matchedBy: "Tier 1: Click ID",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Attribution Studio
            </h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              Multi-Touch Waterfall
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic attribution linking ad click identifiers to GoHighLevel CRM contacts, appointment setters, and paid revenue.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab("journeys")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "journeys"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Customer Journeys
          </button>
          <button
            onClick={() => setActiveTab("mapping")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "mapping"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Campaign \(\to\) Treatment Rules
          </button>
        </div>
      </div>

      {/* Attribution Waterfall Hierarchy Legend */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200/90 shadow-sm">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
          Deterministic Waterfall Resolution Priority
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-center justify-between font-extrabold text-blue-900 text-[11px] mb-1">
              <span>Tier 1: Click ID</span>
              <span className="bg-blue-200/80 px-1.5 py-0.5 rounded text-[10px]">100% Conf</span>
            </div>
            <p className="text-[11px] text-blue-700">Matches FBCLID or GCLID directly to ad platform click log.</p>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
            <div className="flex items-center justify-between font-extrabold text-indigo-900 text-[11px] mb-1">
              <span>Tier 2: UTM Exact</span>
              <span className="bg-indigo-200/80 px-1.5 py-0.5 rounded text-[10px]">95% Conf</span>
            </div>
            <p className="text-[11px] text-indigo-700">Exact match on utm_campaign parameter to campaign name.</p>
          </div>

          <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-200">
            <div className="flex items-center justify-between font-extrabold text-violet-900 text-[11px] mb-1">
              <span>Tier 3: Regex Rules</span>
              <span className="bg-violet-200/80 px-1.5 py-0.5 rounded text-[10px]">85% Conf</span>
            </div>
            <p className="text-[11px] text-violet-700">Configurable regex matching campaign name patterns to treatments.</p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between font-extrabold text-amber-900 text-[11px] mb-1">
              <span>Tier 4: Tags / Forms</span>
              <span className="bg-amber-200/80 px-1.5 py-0.5 rounded text-[10px]">70% Conf</span>
            </div>
            <p className="text-[11px] text-amber-700">Heuristic matching on GHL contact tags and form submissions.</p>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center justify-between font-extrabold text-rose-900 text-[11px] mb-1">
              <span>Tier 5: Quarantine</span>
              <span className="bg-rose-200/80 px-1.5 py-0.5 rounded text-[10px]">0% Conf</span>
            </div>
            <p className="text-[11px] text-rose-700">Queued in Data Health Center for 1-click operator linking.</p>
          </div>
        </div>
      </div>

      {/* Tab 1: Customer Journeys */}
      {activeTab === "journeys" && (
        <div className="space-y-4">
          {journeys.map((j) => (
            <div
              key={j.id}
              className="glass-panel glass-card-hover rounded-2xl p-6 shadow-sm border border-slate-200/90"
            >
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
                    {j.leadName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{j.leadName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{j.campaign}</span>
                      <span>•</span>
                      <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono font-semibold">
                        {j.clickId}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    {j.matchedBy}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-3 py-1 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Confidence: {j.confidence}</span>
                  </div>
                </div>
              </div>

              {/* Visual Journey Touchpoints */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                    1. Lead Acquired
                  </span>
                  <div className="font-bold text-slate-900">{j.treatment}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{j.leadDate}</div>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                    2. Appointment
                  </span>
                  <div className="font-bold text-blue-700">{j.bookedType}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{j.apptDate}</div>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                    3. Opportunity Stage
                  </span>
                  <div className="font-bold text-slate-900">{j.stage}</div>
                  <div className="text-emerald-700 font-extrabold text-[11px] mt-0.5 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                    Closed Won Sale
                  </div>
                </div>

                <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-300">
                  <span className="font-extrabold text-emerald-800 uppercase tracking-wider text-[10px] block mb-1">
                    4. Attributed Revenue
                  </span>
                  <div className="text-xl font-black text-emerald-900">{j.revenue}</div>
                  <div className="text-emerald-700 text-[11px] font-semibold">Stripe / GHL Paid</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Campaign-to-Treatment Mapping Admin Interface */}
      {activeTab === "mapping" && (
        <div className="glass-panel rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Configured Pattern Mapping Rules</h3>
              <p className="text-xs text-slate-500">
                Rule engine automatically binds ad campaigns to specific clinic treatments without relying on strict naming conventions.
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Mapping Rule</span>
            </button>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-5">Rule ID</th>
                <th className="py-3 px-4">Mapped Treatment</th>
                <th className="py-3 px-4">Pattern / Regex</th>
                <th className="py-3 px-4">Match Type</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-5 font-mono text-slate-500">{r.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.treatmentName}</td>
                  <td className="py-3 px-4">
                    <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-700 font-mono font-bold">
                      {r.pattern}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {r.matchType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">{r.priority}</td>
                  <td className="py-3 px-5 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-bold text-xs">
                      Edit Rule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
