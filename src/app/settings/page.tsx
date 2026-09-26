"use client";

import React, { useState } from "react";
import { KeyRound, ShieldAlert, CheckCircle, Copy, Check } from "lucide-react";

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const webhookUrl = "https://app.adfunnel.io/api/webhooks/ghl";

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Integrations & Provider Credentials
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure API keys, OAuth clients, and real-time webhook listeners for GoHighLevel, Meta, and Google Ads.
        </p>
      </div>

      {/* GoHighLevel Webhook Setup */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold">
              GHL
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">GoHighLevel Webhook Gateway</h2>
              <p className="text-xs text-slate-500">
                Supports Ed25519 signature verification via <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">X-GHL-Signature</code>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Active
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Your Universal Ingestion Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800">Subscribed Events:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {["ContactCreate", "ContactUpdate", "AppointmentCreate", "AppointmentUpdate", "OpportunityStageUpdate", "PaymentReceived"].map(
                (evt) => (
                  <span
                    key={evt}
                    className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-800"
                  >
                    {evt}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Meta Marketing API Credentials */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              FB
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Meta Marketing API (v21.0)</h2>
              <p className="text-xs text-slate-500">
                System User Access Token with <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">ads_read</code> and <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">read_insights</code>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Connected
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Meta System User Token
            </label>
            <input
              type="password"
              defaultValue="EAABtesttokenplaceholder2026..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Google Ads API Credentials */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold">
              GA
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Google Ads API (GAQL SearchStream)</h2>
              <p className="text-xs text-slate-500">
                Developer Token and OAuth 2.0 Client credentials
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Connected
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Developer Token
            </label>
            <input
              type="password"
              defaultValue="dev_tok_test_placeholder"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
