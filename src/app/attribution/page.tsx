"use client";

import React from "react";
import { GitFork, CheckCircle, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function AttributionPage() {
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
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Attribution Studio
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Inspect individual customer conversion journeys from raw click identifier to clinic cash collection.
        </p>
      </div>

      <div className="space-y-4">
        {journeys.map((j) => (
          <div
            key={j.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow transition-shadow"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {j.leadName.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{j.leadName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{j.campaign}</span>
                    <span>•</span>
                    <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded text-slate-700">
                      {j.clickId}
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Confidence: {j.confidence}</span>
              </div>
            </div>

            {/* Visual Touchpoint Path */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  1. Lead Acquired
                </span>
                <div className="font-bold text-slate-900">{j.treatment}</div>
                <div className="text-slate-500 mt-0.5">{j.leadDate}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  2. Appointment Booked
                </span>
                <div className="font-bold text-blue-700">{j.bookedType}</div>
                <div className="text-slate-500 mt-0.5">{j.apptDate}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  3. Opportunity Stage
                </span>
                <div className="font-bold text-slate-900">{j.stage}</div>
                <div className="text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Closed Won
                </div>
              </div>

              <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] block mb-1">
                  4. Attributed Revenue
                </span>
                <div className="text-lg font-extrabold text-emerald-900">{j.revenue}</div>
                <div className="text-emerald-700 text-[11px] font-medium">Stripe / GHL Paid</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
