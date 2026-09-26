"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Plus, Building2, CheckCircle2, MapPin, DollarSign, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ClientsPage() {
  const { clients, setSelectedClientId } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Client Accounts & Tenant Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage agency clients, multi-location GoHighLevel mappings, and ad account authorizations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div
            key={client.id}
            className="glass-panel glass-card-hover rounded-2xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
                  {client.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Active Account
                </span>
              </div>

              <h2 className="text-lg font-black text-slate-900 tracking-tight">{client.name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{client.location}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{client.currency}</span>
              </div>

              {/* Connected Integrations Details */}
              <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">GHL Location:</span>
                  <code className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold">
                    {client.ghlLocationId}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Meta Ad Account:</span>
                  <code className="text-[11px] font-mono bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded text-blue-800 font-semibold">
                    {client.metaAccountId}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Google Ads Customer:</span>
                  <code className="text-[11px] font-mono bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded text-amber-800 font-semibold">
                    {client.googleAdsId}
                  </code>
                </div>
              </div>

              {/* Treatments summary pill */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Configured Procedures:</span>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {client.treatments.length} Active Offers
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
              <Link
                href="/daily"
                onClick={() => setSelectedClientId(client.id)}
                className="flex-1 text-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
              >
                Daily Sheet
              </Link>
              <Link
                href="/"
                onClick={() => setSelectedClientId(client.id)}
                className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors"
              >
                <span>Dashboard</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Onboarding Modal Preview */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">Onboard New Client Account</h3>
            <p className="text-xs text-slate-500 mb-5">
              Provision agency client tenant and link CRM & advertising endpoints.
            </p>
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Med Spa or Clinic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Radiance Aesthetics"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Timezone / Location</label>
                <input
                  type="text"
                  defaultValue="America/New_York (EST)"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">GoHighLevel Location ID</label>
                <input
                  type="text"
                  placeholder="loc_rad_nyc_04"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Meta Ad Account ID</label>
                <input
                  type="text"
                  placeholder="act_9918274650"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-2.5">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Client provisioning workflow verified!");
                  setShowAddModal(false);
                }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                Provision Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
