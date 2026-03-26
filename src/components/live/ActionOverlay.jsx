import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { type: "made_2pt", label: "Made 2PT", points: 2, color: "bg-emerald-600 hover:bg-emerald-500", category: "scoring" },
  { type: "missed_2pt", label: "Miss 2PT", points: 0, color: "bg-red-700 hover:bg-red-600", category: "scoring" },
  { type: "made_3pt", label: "Made 3PT", points: 3, color: "bg-emerald-600 hover:bg-emerald-500", category: "scoring" },
  { type: "missed_3pt", label: "Miss 3PT", points: 0, color: "bg-red-700 hover:bg-red-600", category: "scoring" },
  { type: "ft_made", label: "FT Made", points: 1, color: "bg-emerald-600 hover:bg-emerald-500", category: "scoring" },
  { type: "ft_missed", label: "FT Miss", points: 0, color: "bg-red-700 hover:bg-red-600", category: "scoring" },
  { type: "orb", label: "ORB", points: 0, color: "bg-sky-700 hover:bg-sky-600", category: "other" },
  { type: "drb", label: "DRB", points: 0, color: "bg-sky-700 hover:bg-sky-600", category: "other" },
  { type: "ast", label: "AST", points: 0, color: "bg-violet-700 hover:bg-violet-600", category: "other" },
  { type: "stl", label: "STL", points: 0, color: "bg-violet-700 hover:bg-violet-600", category: "other" },
  { type: "to", label: "TO", points: 0, color: "bg-amber-700 hover:bg-amber-600", category: "other" },
  { type: "foul", label: "FOUL", points: 0, color: "bg-amber-700 hover:bg-amber-600", category: "other" },
];

export default function ActionOverlay({ player, onAction, onClose }) {
  if (!player) return null;

  const scoringActions = actions.filter(a => a.category === "scoring");
  const otherActions = actions.filter(a => a.category === "other");

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end lg:items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Recording for</p>
            <p className="text-xl font-black text-primary">
              #{player.number} {player.name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Scoring</p>
            <div className="grid grid-cols-3 gap-2">
              {scoringActions.map(action => (
                <button
                  key={action.type}
                  onClick={() => onAction(action.type, action.points)}
                  className={cn(
                    "rounded-xl py-4 text-sm font-bold text-white transition-all active:scale-95",
                    action.color
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Stats</p>
            <div className="grid grid-cols-3 gap-2">
              {otherActions.map(action => (
                <button
                  key={action.type}
                  onClick={() => onAction(action.type, action.points)}
                  className={cn(
                    "rounded-xl py-4 text-sm font-bold text-white transition-all active:scale-95",
                    action.color
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}