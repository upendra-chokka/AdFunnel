"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Syringe,
  Megaphone,
  Table,
  GitFork,
  Activity,
  Settings,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Database,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const navigation = [
  { name: "Executive Overview", href: "/", icon: LayoutDashboard },
  { name: "Daily Matrix (Sheet)", href: "/daily", icon: Table, highlight: true },
  { name: "Clients", href: "/clients", icon: Building2 },
  { name: "Treatments", href: "/treatments", icon: Syringe },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone },
  { name: "Attribution Studio", href: "/attribution", icon: GitFork },
  { name: "Data Health Center", href: "/health", icon: Activity, alertBadge: true },
  { name: "Integrations & Setup", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userRole, unattributedLeads, demoMode } = useApp();

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-30 select-none border-r border-slate-800/80 shadow-2xl">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 font-black text-sm tracking-wider">
            AF
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              <span>AdFunnel</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              Attribution Platform
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
          <span>Navigation</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30 font-bold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/90"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </div>

              {item.highlight && (
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  Sheet
                </span>
              )}

              {item.alertBadge && unattributedLeads.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  {unattributedLeads.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Database & Tenant Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 space-y-3">
        {/* Phase 2 Database Indicator */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Database className="h-3.5 w-3.5 text-blue-400" />
            PostgreSQL:
          </span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Supabase Ready
          </span>
        </div>

        {/* User Role & Agency */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
              U
            </div>
            <div>
              <div className="font-semibold text-slate-200 text-xs truncate w-24">
                Upendra (Agency)
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {userRole.replace("_", " ")}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            v1.2
          </span>
        </div>
      </div>
    </aside>
  );
}
