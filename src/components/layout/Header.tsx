"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Calendar,
  Building2,
  Sparkles,
  UserCheck,
  ChevronDown,
  Database,
  KeyRound,
  LogOut,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { PRECONFIGURED_USERS } from "@/lib/auth/users";

export function Header() {
  const router = useRouter();
  const {
    clients,
    selectedClientId,
    setSelectedClientId,
    dateRange,
    setDateRange,
    demoMode,
    setDemoMode,
    userRole,
    setUserRole,
    currentUser,
    logout,
    dbStatus,
    refreshDbStatus,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [isRefreshingDb, setIsRefreshingDb] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleManualDbRefresh = async () => {
    setIsRefreshingDb(true);
    await refreshDbStatus();
    setIsRefreshingDb(false);
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shadow-sm">
      {/* Client Filter Switcher & Horizon */}
      <div className="flex items-center gap-4">
        {/* Client selector with badge */}
        <div className="flex items-center gap-2.5 bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200/90 px-3.5 py-1.5 rounded-xl text-xs text-slate-700 transition-all shadow-sm">
          <div className="p-1 rounded-md bg-blue-100/80 text-blue-700">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Client:
          </span>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none cursor-pointer pr-1"
          >
            <option value="all">All Clients (Agency Aggregate)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.treatments.length} treatments)
              </option>
            ))}
          </select>
        </div>

        {/* Date Horizon Selector */}
        <div className="flex items-center gap-2.5 bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200/90 px-3.5 py-1.5 rounded-xl text-xs text-slate-700 transition-all shadow-sm">
          <div className="p-1 rounded-md bg-indigo-100/80 text-indigo-700">
            <Calendar className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Period:
          </span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none cursor-pointer"
          >
            <option value="sep_23_27">Sep 23 – Sep 27, 2026 (Sheet Window)</option>
            <option value="last_7">Last 7 Days</option>
            <option value="last_30">Last 30 Days</option>
            <option value="this_month">September 2026</option>
          </select>
        </div>
      </div>

      {/* Right Controls: Database Status, Demo Toggle, User Menu */}
      <div className="flex items-center gap-3">
        {/* Live Database / Demo Mode Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowDbModal(!showDbModal)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-sm ${
              dbStatus.connected
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
            }`}
            title="Click to view database connection status"
          >
            <span className="relative flex h-2 w-2">
              {dbStatus.connected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  dbStatus.connected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </span>

            <span>
              {dbStatus.connected ? "Supabase Connected" : "Demo Preview"}
            </span>

            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {/* Database Connection Dropdown Modal */}
          {showDbModal && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl z-30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-xs">
                    Backend Connection
                  </span>
                </div>
                <button
                  onClick={handleManualDbRefresh}
                  disabled={isRefreshingDb}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isRefreshingDb ? "animate-spin text-blue-600" : ""}`}
                  />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Database Engine:</span>
                  <span className="font-semibold text-slate-800">
                    PostgreSQL 15 (Supabase)
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Status:</span>
                  <span
                    className={`font-bold ${
                      dbStatus.connected ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {dbStatus.connected ? "Active & Healthy" : "Offline / Mocked"}
                  </span>
                </div>

                {dbStatus.url && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Host:</span>
                    <span className="font-mono text-slate-700 truncate max-w-[150px]">
                      {dbStatus.url}
                    </span>
                  </div>
                )}

                {dbStatus.latencyMs > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Query Latency:</span>
                    <span className="font-mono text-slate-700">{dbStatus.latencyMs}ms</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Data Source Mode:</span>
                  <button
                    onClick={() => setDemoMode(!demoMode)}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-all ${
                      demoMode
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    {demoMode ? "Using Demo Data" : "Using Live DB"}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <Link
                  href="/settings"
                  onClick={() => setShowDbModal(false)}
                  className="w-full text-center block py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-blue-600 transition-colors"
                >
                  Manage API Keys & DB Credentials →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {currentUser?.fullName?.charAt(0) || "U"}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser?.fullName || "Admin"}
              </div>
              <div className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider">
                {userRole.replace("_", " ")}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xl z-30 space-y-3">
              {/* Current user info */}
              <div className="px-2 py-1 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">
                  {currentUser?.fullName}
                </p>
                <p className="text-[11px] font-mono text-slate-500">
                  {currentUser?.email}
                </p>
                <div className="mt-1 inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {userRole.replace("_", " ")}
                </div>
              </div>

              {/* Switch Role Quick Pick */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Switch Active Role
                </span>
                {(["super_admin", "agency_admin", "viewer"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setUserRole(r);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      userRole === r
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{r.replace("_", " ").toUpperCase()}</span>
                    {userRole === r && <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>

              {/* Action Links */}
              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                  <span>API Keys & Integrations</span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium transition-colors text-left"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
