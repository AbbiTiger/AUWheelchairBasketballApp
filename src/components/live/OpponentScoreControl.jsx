import React from "react";
import { Minus, Plus } from "lucide-react";

export default function OpponentScoreControl({ score, onChange }) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Opp Score</span>
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => onChange(Math.max(0, score - 1))}
          className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-destructive/20 active:scale-95 transition-all"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-xl font-black w-10 text-center">{score}</span>
        <button
          onClick={() => onChange(score + 1)}
          className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}