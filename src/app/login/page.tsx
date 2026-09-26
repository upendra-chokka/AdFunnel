"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { PRECONFIGURED_USERS, PRECONFIGURED_CREDENTIALS } from "@/lib/auth/users";

export default function LoginPage() {
  const router = useRouter();
  const { login, dbStatus, currentUser } = useApp();

  const [email, setEmail] = useState("admin@adfunnel.ai");
  const [password, setPassword] = useState("Admin@AdFunnel2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Login failed");
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    const pwd = PRECONFIGURED_CREDENTIALS[userEmail];
    setEmail(userEmail);
    setPassword(pwd);
    setIsLoading(true);
    setError(null);

    const result = await login(userEmail, pwd);
    setIsLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorative glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AdFunnel Intelligence Enterprise</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Sign in to Portal
          </h1>
          <p className="text-sm text-slate-400">
            Multi-client marketing analytics & deterministic attribution
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@adfunnel.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick One-Click Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              ⚡ Quick 1-Click Access (Pre-Configured Credentials)
            </span>

            <div className="space-y-2">
              {PRECONFIGURED_USERS.map((u) => {
                const isCurrent = currentUser?.email === u.email;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u.email)}
                    type="button"
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 font-bold text-xs flex items-center justify-center">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                          <span>{u.fullName}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-normal">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {u.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {u.role.replace("_", " ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Database & Cloud Health Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Database Backend:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus.connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span
              className={`font-semibold ${
                dbStatus.connected ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {dbStatus.connected ? "Supabase Live DB" : "Demo Preview Mode"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
