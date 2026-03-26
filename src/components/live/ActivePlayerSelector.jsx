import React from "react";
import { cn } from "@/lib/utils";

export default function ActivePlayerSelector({ players, selectedPlayer, onSelect, stats }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {players.map(player => {
        const s = stats[player.id] || { points: 0, rebounds: 0, assists: 0 };
        const isSelected = selectedPlayer?.id === player.id;
        return (
          <button
            key={player.id}
            onClick={() => onSelect(isSelected ? null : player)}
            className={cn(
              "rounded-xl p-2 md:p-3 border-2 transition-all active:scale-95 text-center",
              isSelected
                ? "border-primary bg-primary/15 shadow-lg shadow-primary/20"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <div className="text-xl md:text-2xl font-black text-primary">#{player.number}</div>
            <div className="text-[10px] font-bold text-foreground truncate mt-0.5">{player.name.split(" ")[0]}</div>
            <div className="text-[9px] text-muted-foreground mt-1">
              {s.points}p · {s.rebounds}r · {s.assists}a
            </div>
            <div className="text-[9px] text-muted-foreground/70 mt-0.5">
              C:{player.classification}
            </div>
          </button>
        );
      })}
    </div>
  );
}