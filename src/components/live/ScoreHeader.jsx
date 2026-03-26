import React from "react";

export default function ScoreHeader({ game, ourScore, opponentScore }) {
  if (!game) return null;

  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 md:p-5">
      <div className="text-center flex-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Home</p>
        <p className="text-4xl md:text-5xl font-black text-primary mt-1">{ourScore}</p>
      </div>
      <div className="px-4 md:px-8 text-center">
        <p className="text-xs text-muted-foreground font-medium">VS</p>
        <p className="text-sm font-bold text-foreground mt-1">{game.opponent}</p>
        <p className="text-[10px] text-muted-foreground">{game.location || "—"}</p>
      </div>
      <div className="text-center flex-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Away</p>
        <p className="text-4xl md:text-5xl font-black text-foreground mt-1">{opponentScore}</p>
      </div>
    </div>
  );
}