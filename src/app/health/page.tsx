"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { DEMO_WEBHOOK_LOGS } from "@/lib/demo-data";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function DataHealthPage() {
  const { unattributedLeads, resolveLeadAttribution } = useApp();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Data Health & Reconciliation Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor real-time webhook ingestion health, API synchronization statuses, and resolve unattributed touchpoints.
        </p>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-900 text-sm">GoHighLevel (CRM)</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connected
            </span>
          </div>
          <div className="text-xs text-slate-500 space-y-1.5">
            <div>
              Webhook Security: <span className="font-semibold text-slate-700">Ed25519 Verified</span>
            </div>
            <div>
              Last Webhook Received: <span className="font-semibold text-slate-700">2 minutes ago</span>
            </div>
            <div>
              Reconciliation: <span className="font-semibold text-emerald-600">Nightly 02:00 UTC (Synced)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-900 text-sm">Meta Marketing API</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connected
            </span>
          </div>
          <div className="text-xs text-slate-500 space-y-1.5">
            <div>
              API Version: <span className="font-semibold text-slate-700">Graph API v21.0</span>
            </div>
            <div>
              Rate Limit Quota: <span className="font-semibold text-slate-700">12% used (Healthy)</span>
            </div>
            <div>
              Last Spend Sync: <span className="font-semibold text-emerald-600">11 minutes ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-900 text-sm">Google Ads API</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connected
            </span>
          </div>
          <div className="text-xs text-slate-500 space-y-1.5">
            <div>
              Protocol: <span className="font-semibold text-slate-700">Google Ads API v17 (GAQL)</span>
            </div>
            <div>
              Micro-Spend Normalizer: <span className="font-semibold text-slate-700">Active</span>
            </div>
            <div>
              Last Spend Sync: <span className="font-semibold text-emerald-600">13 minutes ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unattributed Leads Quarantine Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Unattributed Leads Quarantine Queue ({unattributedLeads.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Leads received without complete UTM parameters or click IDs. Link them below to retroactively attribute downstream revenue.
            </p>
          </div>
        </div>

        {unattributedLeads.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            Zero unattributed leads! All incoming contacts have verified marketing attribution.
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Raw Source / Campaign</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Suggested Treatment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {unattributedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{lead.contactName}</div>
                    <div className="text-slate-500 text-[11px]">{lead.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <span className="font-semibold">{lead.source}</span>
                    <span className="text-slate-400 block text-[11px]">raw: {lead.campaignRaw}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{lead.createdAt}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      {lead.suggestedTreatmentId.replace("t_", "").toUpperCase()} (Confidence: {(lead.confidence * 100).toFixed(0)}%)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        resolveLeadAttribution(
                          lead.id,
                          lead.suggestedCampaignId,
                          lead.suggestedTreatmentId
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Attribute Lead
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Webhook Delivery Log Stream */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Webhook Ingestion Events</h3>
          <span className="text-xs text-slate-400">Idempotency deduplication active</span>
        </div>
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px]">
            <tr>
              <th className="py-2.5 px-4">Provider</th>
              <th className="py-2.5 px-4">Event Type</th>
              <th className="py-2.5 px-4">Client</th>
              <th className="py-2.5 px-4">Cryptographic Signature</th>
              <th className="py-2.5 px-4">Received</th>
              <th className="py-2.5 px-4 text-right">Delivery Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {DEMO_WEBHOOK_LOGS.map((wh) => (
              <tr key={wh.id} className="hover:bg-slate-50/50">
                <td className="py-2.5 px-4 font-semibold text-slate-900 uppercase">{wh.provider}</td>
                <td className="py-2.5 px-4 font-medium text-slate-800">{wh.eventType}</td>
                <td className="py-2.5 px-4 text-slate-600">{wh.clientName}</td>
                <td className="py-2.5 px-4">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Ed25519 Verified
                  </span>
                </td>
                <td className="py-2.5 px-4 text-slate-500">{wh.receivedAt}</td>
                <td className="py-2.5 px-4 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      wh.status === "processed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {wh.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
