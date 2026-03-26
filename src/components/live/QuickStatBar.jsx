import React from "react";
import { cn } from "@/lib/utils";

const NON_SHOT_ACTIONS = [
  { type: "orb", label: "ORB", color: "bg-sky-700 hover:bg-sky-600" },
  { type: "drb", label: "DRB", color: "bg-sky-700 hover:bg-sky-600" },
  { type: "ast", label: "AST", color: "bg-violet-700 hover:bg-violet-600" },
  { type: "stl", label: "STL", color: "bg-emerald-700 hover:bg-emerald-600" },
  { type: "bs",  label: "BLK", color: "bg-teal-700 hover:bg-teal-600" },
  { type: "to",  label: "TO",  color: "bg-amber-700 hover:bg-amber-600" },
  { type: "foul",label: "FOUL",color: "bg-red-800 hover:bg-red-700" },
  { type: "tech",label: "TECH",color: "bg-orange-800 hover:bg-orange-700" },
  { type: "ft_made",  label: "FT ✓", color: "bg-emerald-600 hover:bg-emerald-500" },
  { type: "ft_missed",label: "FT ✗", color: "bg-red-700 hover:bg-red-600" },
];

export default function QuickStatBar({ selectedPlayer, onAction }) {
  if (!selectedPlayer) {
    return (
      <div className="flex items-center justify-center py-3 text-muted-foreground text-sm">
        Select a player above, then tap the court to record a shot — or use quick stats
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
        Quick Stats for <span className="text-primary">#{selectedPlayer.number} {selectedPlayer.name}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {NON_SHOT_ACTIONS.map(action => (
          <button
            key={action.type}
            onClick={() => onAction(action.type, 0)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95",
              action.color
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}