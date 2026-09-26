"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  Calendar,
  Building2,
  Sparkles,
  UserCheck,
  ChevronDown,
  Layers,
} from "lucide-react";

export function Header() {
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
  } = useApp();

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

      {/* Right Controls: Demo Mode Pill, Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 px-3.5 py-1.5 rounded-full text-xs shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-emerald-900 text-xs">Demo Mode</span>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
              demoMode ? "bg-emerald-600 shadow-inner" : "bg-slate-300"
            }`}
            title="Toggle Demo Mode"
          >
            <span
              className={`block w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                demoMode ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Role Quick Selector */}
        <div className="flex items-center gap-2 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/90 px-3 py-1.5 rounded-xl text-xs transition-colors shadow-sm">
          <UserCheck className="h-3.5 w-3.5 text-slate-600" />
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as any)}
            className="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
          >
            <option value="super_admin">Super Admin</option>
            <option value="agency_admin">Agency Admin</option>
            <option value="account_manager">Account Manager</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>
    </header>
  );
}
