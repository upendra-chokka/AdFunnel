"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  KeyRound,
  ShieldCheck,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Database,
  Lock,
  Zap,
} from "lucide-react";

export default function SettingsPage() {
  const { userRole, refreshDbStatus, dbStatus } = useApp();
  const isAdmin = userRole === "super_admin" || userRole === "agency_admin";

  // Provider states
  const [metaToken, setMetaToken] = useState("");
  const [metaAccountId, setMetaAccountId] = useState("");
  const [metaAppSecret, setMetaAppSecret] = useState("");

  const [googleDevToken, setGoogleDevToken] = useState("");
  const [googleCustomerId, setGoogleCustomerId] = useState("");
  const [googleRefreshToken, setGoogleRefreshToken] = useState("");

  const [ghlApiKey, setGhlApiKey] = useState("");
  const [ghlLocationId, setGhlLocationId] = useState("");
  const [ghlWebhookSecret, setGhlWebhookSecret] = useState("");

  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseServiceKey, setSupabaseServiceKey] = useState("");

  // UI status states
  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const [originUrl, setOriginUrl] = useState("https://ad-funnel-gamma.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);
    }

    // Fetch existing configured integration state
    fetch("/api/integrations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.integrations) {
          const i = data.integrations;
          if (i.meta?.systemUserToken) setMetaToken(i.meta.systemUserToken);
          if (i.meta?.adAccountId) setMetaAccountId(i.meta.adAccountId);

          if (i.google?.developerToken) setGoogleDevToken(i.google.developerToken);
          if (i.google?.customerId) setGoogleCustomerId(i.google.customerId);

          if (i.ghl?.apiKey) setGhlApiKey(i.ghl.apiKey);
          if (i.ghl?.locationId) setGhlLocationId(i.ghl.locationId);

          if (i.supabase?.url) setSupabaseUrl(i.supabase.url);
        }
      })
      .catch(() => {});
  }, []);

  const webhookUrl = `${originUrl}/api/webhooks/ghl`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleTestConnection = async (provider: string, credentials: Record<string, string>) => {
    setTestingProvider(provider);
    setTestResults((prev) => ({ ...prev, [provider]: { success: false, message: "Testing..." } }));

    try {
      const res = await fetch("/api/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, credentials }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          success: data.success,
          message: data.message || data.error || "Connection test failed",
        },
      }));
      if (provider === "supabase" && data.success) {
        await refreshDbStatus();
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { success: false, message: err.message || "Failed to reach test endpoint" },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta: {
            systemUserToken: metaToken.includes("...") ? undefined : metaToken || undefined,
            adAccountId: metaAccountId || undefined,
            appSecret: metaAppSecret || undefined,
          },
          google: {
            developerToken: googleDevToken.includes("...") ? undefined : googleDevToken || undefined,
            customerId: googleCustomerId || undefined,
            refreshToken: googleRefreshToken || undefined,
          },
          ghl: {
            apiKey: ghlApiKey.includes("...") ? undefined : ghlApiKey || undefined,
            locationId: ghlLocationId || undefined,
            webhookSecret: ghlWebhookSecret || undefined,
          },
          supabase: {
            url: supabaseUrl || undefined,
            anonKey: supabaseAnonKey || undefined,
            serviceRoleKey: supabaseServiceKey || undefined,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        await refreshDbStatus();
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch {
      // Error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header & Explanatory Banner */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              API Keys & Provider Integrations
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Connect Meta Marketing API, Google Ads GAQL, GoHighLevel CRM, and Supabase directly in this portal.
            </p>
          </div>

          <button
            onClick={() => setShowSecrets(!showSecrets)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors cursor-pointer"
          >
            {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSecrets ? "Hide Tokens" : "Show Tokens"}</span>
          </button>
        </div>

        {/* Live Zero-Redeploy Banner */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-start gap-3">
          <div className="p-1 rounded-lg bg-blue-600 text-white mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-xs text-blue-900 space-y-1">
            <p className="font-bold">
              No Vercel Redeployment Required!
            </p>
            <p className="text-blue-800">
              Any API keys saved in this portal are immediately activated across the daily sync routines, webhooks, and attribution calculators. You do not need to edit Vercel environment variables or trigger a rebuild every time you rotate a token or add a client.
            </p>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>You are currently signed in as Viewer. Switch to Super Admin or Agency Admin in the top-right menu to edit API credentials.</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">All API keys saved successfully! Active runtime engines are now using updated credentials.</span>
        </div>
      )}

      {/* 1. Supabase Database Connection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Supabase PostgreSQL Connection</h2>
              <p className="text-xs text-slate-500">
                Primary relational database backend for agencies, clients, campaigns, and lead journeys.
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              dbStatus.connected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {dbStatus.connected ? "● Connected" : "○ Not Connected"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Supabase Anon / Service Key
            </label>
            <input
              type={showSecrets ? "text" : "password"}
              disabled={!isAdmin}
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {testResults.supabase ? (
            <div
              className={`text-xs flex items-center gap-1.5 ${
                testResults.supabase.success ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {testResults.supabase.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{testResults.supabase.message}</span>
            </div>
          ) : <div />}

          <button
            type="button"
            disabled={testingProvider === "supabase"}
            onClick={() => handleTestConnection("supabase", { url: supabaseUrl, anonKey: supabaseAnonKey })}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {testingProvider === "supabase" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Test Supabase Connection</span>
          </button>
        </div>
      </div>

      {/* 2. GoHighLevel CRM Gateway */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
              GHL
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">GoHighLevel CRM (API v2)</h2>
              <p className="text-xs text-slate-500">
                Inbound contact events, self/setter booked appointment classification, and opportunity values.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            API v2 Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Private Integration Token / API Key
            </label>
            <input
              type={showSecrets ? "text" : "password"}
              disabled={!isAdmin}
              value={ghlApiKey}
              onChange={(e) => setGhlApiKey(e.target.value)}
              placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Sub-Account Location ID
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={ghlLocationId}
              onChange={(e) => setGhlLocationId(e.target.value)}
              placeholder="e.g. loc_aura_nyc_01"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Webhook endpoint box */}
        <div className="pt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">Inbound Webhook URL (Paste into HighLevel Workflow):</span>
            <button
              onClick={handleCopyWebhook}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              {copiedWebhook ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedWebhook ? "Copied" : "Copy Webhook"}</span>
            </button>
          </div>
          <div className="font-mono text-slate-700 bg-white p-2 rounded border border-slate-200 select-all break-all">
            {webhookUrl}
          </div>
          <p className="text-[11px] text-slate-500">
            Signatures are cryptographically validated using TweetNaCl Ed25519 headers (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">X-GHL-Signature</code>).
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          {testResults.ghl ? (
            <div
              className={`text-xs flex items-center gap-1.5 ${
                testResults.ghl.success ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {testResults.ghl.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{testResults.ghl.message}</span>
            </div>
          ) : <div />}

          <button
            type="button"
            disabled={testingProvider === "ghl"}
            onClick={() => handleTestConnection("ghl", { apiKey: ghlApiKey })}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {testingProvider === "ghl" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Test GHL Credentials</span>
          </button>
        </div>
      </div>

      {/* 3. Meta Marketing API */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              META
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Meta Marketing API (v21.0)</h2>
              <p className="text-xs text-slate-500">
                Automated daily campaign spend, impressions, CTR, CPC, and ad-level breakdown.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Graph v21.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Meta System User Token
            </label>
            <input
              type={showSecrets ? "text" : "password"}
              disabled={!isAdmin}
              value={metaToken}
              onChange={(e) => setMetaToken(e.target.value)}
              placeholder="EAABwz..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Ad Account ID
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={metaAccountId}
              onChange={(e) => setMetaAccountId(e.target.value)}
              placeholder="act_1234567890"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {testResults.meta ? (
            <div
              className={`text-xs flex items-center gap-1.5 ${
                testResults.meta.success ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {testResults.meta.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{testResults.meta.message}</span>
            </div>
          ) : <div />}

          <button
            type="button"
            disabled={testingProvider === "meta"}
            onClick={() => handleTestConnection("meta", { systemUserToken: metaToken })}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {testingProvider === "meta" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Test Meta API Connection</span>
          </button>
        </div>
      </div>

      {/* 4. Google Ads API */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
              GADS
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Google Ads API (GAQL SearchStream)</h2>
              <p className="text-xs text-slate-500">
                Daily cost micros normalization ($1 = 1,000,000 micros) and keyword attribution.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            GAQL v18
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Developer Token
            </label>
            <input
              type={showSecrets ? "text" : "password"}
              disabled={!isAdmin}
              value={googleDevToken}
              onChange={(e) => setGoogleDevToken(e.target.value)}
              placeholder="e.g. dev_token_xyz..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Google Ads Customer ID
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={googleCustomerId}
              onChange={(e) => setGoogleCustomerId(e.target.value)}
              placeholder="123-456-7890"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {testResults.google ? (
            <div
              className={`text-xs flex items-center gap-1.5 ${
                testResults.google.success ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {testResults.google.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{testResults.google.message}</span>
            </div>
          ) : <div />}

          <button
            type="button"
            disabled={testingProvider === "google"}
            onClick={() => handleTestConnection("google", { developerToken: googleDevToken })}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {testingProvider === "google" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Test Google Ads Token</span>
          </button>
        </div>
      </div>

      {/* Save Action Floating Bar */}
      {isAdmin && (
        <div className="sticky bottom-6 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-slate-800">
          <div>
            <span className="font-bold text-sm block">Save Changes to Runtime Engine</span>
            <span className="text-xs text-slate-400">Keys are applied immediately without restarting or rebuilding Vercel.</span>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>{isSaving ? "Saving..." : "Save & Activate Keys"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
