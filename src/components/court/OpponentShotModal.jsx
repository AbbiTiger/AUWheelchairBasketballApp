import React from "react";
import { Check, X } from "lucide-react";
import { getZoneLabel } from "./CourtMap";

export default function OpponentShotModal({ shotLocation, onResult, onCancel }) {
  if (!shotLocation) return null;
  const isThree = shotLocation.zone && (shotLocation.zone.startsWith("three") || shotLocation.zone.startsWith("corner"));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-purple-500/40 rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border bg-purple-900/20">
          <p className="text-xs text-purple-400 uppercase tracking-wider font-semibold">Opponent Shot from</p>
          <p className="text-lg font-black text-purple-300 mt-0.5">{getZoneLabel(shotLocation.zone)}</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onResult(isThree ? "opp_made_3pt" : "opp_made_2pt", isThree ? 3 : 2)}
              className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-purple-700 hover:bg-purple-600 active:scale-95 transition-all"
            >
              <Check className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-sm">MADE</span>
            </button>
            <button
              onClick={() => onResult(isThree ? "opp_missed_3pt" : "opp_missed_2pt", 0)}
              className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-orange-800 hover:bg-orange-700 active:scale-95 transition-all"
            >
              <X className="w-8 h-8 text-white" />
              <span className="text-white font-bold text-sm">MISSED</span>
            </button>
          </div>
          <button onClick={onCancel} className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}