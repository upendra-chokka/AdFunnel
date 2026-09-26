import React from "react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string;
  borderColor?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "text-blue-600 bg-blue-50/80 border-blue-200/50",
  borderColor = "border-t-blue-500",
}: KpiCardProps) {
  return (
    <div
      className={`glass-panel glass-card-hover rounded-2xl p-5 border-t-4 ${borderColor} relative overflow-hidden flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {title}
          </span>
          <div className={`p-2 rounded-xl border ${accentColor} shadow-sm`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
          {trend && (
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>

      {subtitle && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
