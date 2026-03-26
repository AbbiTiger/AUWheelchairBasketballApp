import React from "react";
import { Check, X } from "lucide-react";
import { getZoneLabel } from "./CourtMap";

export default function ShotResultModal({ shotLocation, player, onResult, onCancel }) {
  if (!shotLocation) return null;
  const isThree = shotLocation.zone && (shotLocation.zone.startsWith("three") || shotLocation.zone.startsWith("corner"));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Shot from</p>
          <p className="text-lg font-black text-primary mt-0.5">{getZoneLabel(shotLocation.zone)}</p>
          {player && <p className="text-sm text-muted-foreground mt-1">#{player.number} {player.name}</p>}
        </div>
        <div className="p-5 space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-center mb-4">
            {isThree ? "3-Point Attempt" : "2-Point Attempt"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onResult(isThree ? "made_3pt" : "made_2pt", isThree ? 3 : 2)}
              className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all"
            >
              <Check className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-sm">MADE</span>
              <span className="text-emerald-200 text-xs">{isThree ? "+3 pts" : "+2 pts"}</span>
            </button>
            <button
              onClick={() => onResult(isThree ? "missed_3pt" : "missed_2pt", 0)}
              className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-red-700 hover:bg-red-600 active:scale-95 transition-all"
            >
              <X className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-sm">MISSED</span>
              <span className="text-red-300 text-xs">No points</span>
            </button>
          </div>
          <button
            onClick={onCancel}
            className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}