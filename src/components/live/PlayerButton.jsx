import React from "react";
import { cn } from "@/lib/utils";

export default function PlayerButton({ player, stats, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(player)}
      className={cn(
        "relative w-full rounded-2xl p-4 md:p-5 transition-all duration-200 text-left",
        "border-2 active:scale-95",
        isSelected
          ? "bg-primary/20 border-primary shadow-lg shadow-primary/10"
          : "bg-card border-border hover:border-primary/40 hover:bg-card/80"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl md:text-3xl font-black text-primary">
          #{player.number}
        </span>
        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
          {player.classification}
        </span>
      </div>
      <p className="text-sm md:text-base font-bold text-foreground truncate mb-3">
        {player.name}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <StatMini label="PTS" value={stats.points} />
        <StatMini label="REB" value={stats.rebounds} />
        <StatMini label="AST" value={stats.assists} />
      </div>
    </button>
  );
}

function StatMini({ label, value }) {
  return (
    <div className="text-center bg-secondary/60 rounded-lg py-1.5">
      <p className="text-lg md:text-xl font-black text-foreground">{value}</p>
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
    </div>
  );
}