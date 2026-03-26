import React from "react";
import { ArrowRightLeft, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function LineupManager({ activePlayers, benchPlayers, onSub, classificationSum }) {
  const [selectedActive, setSelectedActive] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const isOverLimit = classificationSum > 14.0;

  const handleSub = (benchPlayer) => {
    if (selectedActive) {
      onSub(selectedActive, benchPlayer);
      setSelectedActive(null);
      setOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm transition-colors",
        isOverLimit
          ? "border-destructive bg-destructive/15 text-destructive animate-pulse"
          : "border-border bg-secondary text-foreground"
      )}>
        {isOverLimit && <AlertTriangle className="w-4 h-4" />}
        <span>CLASS: {classificationSum.toFixed(1)} / 14.0</span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:bg-accent/80 transition-all active:scale-95">
            <ArrowRightLeft className="w-4 h-4" />
            SUB
          </button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Make Substitution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                Select player to remove
              </p>
              <div className="grid grid-cols-1 gap-2">
                {activePlayers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedActive(p)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                      selectedActive?.id === p.id
                        ? "border-destructive bg-destructive/10"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <span className="text-lg font-black text-primary">#{p.number}</span>
                    <span className="font-semibold text-sm">{p.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{p.classification}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedActive && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Sub in from bench
                </p>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {benchPlayers.map(p => {
                    const newSum = classificationSum - selectedActive.classification + p.classification;
                    const wouldExceed = newSum > 14.0;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSub(p)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border-2 border-border transition-all text-left",
                          wouldExceed
                            ? "hover:border-destructive"
                            : "hover:border-primary"
                        )}
                      >
                        <span className="text-lg font-black text-primary">#{p.number}</span>
                        <span className="font-semibold text-sm">{p.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{p.classification}</span>
                        {wouldExceed && <AlertTriangle className="w-3 h-3 text-destructive" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}