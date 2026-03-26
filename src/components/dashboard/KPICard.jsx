import React from "react";
import { cn } from "@/lib/utils";

export default function KPICard({ label, value, subtitle, icon: Icon, trend }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      <p className="text-3xl font-black text-foreground">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      {trend !== undefined && (
        <p className={cn(
          "text-xs font-semibold mt-2",
          trend >= 0 ? "text-emerald-400" : "text-red-400"
        )}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
        </p>
      )}
    </div>
  );
}