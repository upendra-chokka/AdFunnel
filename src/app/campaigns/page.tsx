"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { DEMO_CAMPAIGNS } from "@/lib/demo-data";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils";
import { calculateDerivedMetrics } from "@/lib/metrics";
import { Megaphone, ExternalLink } from "lucide-react";

export default function CampaignsPage() {
  const { selectedClientId } = useApp();

  const campaigns =
    selectedClientId === "all"
      ? DEMO_CAMPAIGNS
      : DEMO_CAMPAIGNS.filter((c) => c.clientId === selectedClientId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Advertising Campaigns
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Meta Marketing API & Google Ads performance with campaign-to-treatment attribution mapping.
          </p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4">Campaign Name</th>
              <th className="py-3 px-4">Mapped Treatment</th>
              <th className="py-3 px-4 text-right">Spend</th>
              <th className="py-3 px-4 text-right">Leads</th>
              <th className="py-3 px-4 text-right">CPL</th>
              <th className="py-3 px-4 text-right">Appts</th>
              <th className="py-3 px-4 text-right">Sales</th>
              <th className="py-3 px-4 text-right">Revenue</th>
              <th className="py-3 px-4 text-right">ROAS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {campaigns.map((camp) => {
              const derived = calculateDerivedMetrics({
                spend: camp.spend,
                leads: camp.leads,
                apptsSelf: camp.appts,
                apptsSetter: 0,
                sales: camp.sales,
                revenue: camp.revenue,
              });

              return (
                <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        camp.platform === "meta"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {camp.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <Megaphone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{camp.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{camp.treatmentName}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatCurrency(camp.spend)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900">{formatNumber(camp.leads)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    {formatCurrency(derived.cpl)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900">{camp.appts}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{camp.sales}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    {formatCurrency(camp.revenue)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block px-2 py-0.5 rounded font-extrabold bg-emerald-100 text-emerald-800">
                      {formatRoas(derived.roas)}
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
