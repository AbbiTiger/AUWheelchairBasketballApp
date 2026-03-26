import React, { useMemo, useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import KPICard from "@/components/dashboard/KPICard";
import ShootingChart from "@/components/dashboard/ShootingChart";
import CourtMap from "@/components/court/CourtMap";
import { calcPossessions, calcTotalPoints } from "@/lib/statUtils";
import { generateGameReport } from "@/lib/pdfExport";
import { Target, TrendingDown, Zap, BarChart3, FileDown, Loader2, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const { data: games = [] } = useQuery({ queryKey: ["games"], queryFn: () => api.entities.Game.list("-date") });
  const { data: players = [] } = useQuery({ queryKey: ["players"], queryFn: () => api.entities.Player.list() });

  const activeGame = games.find(g => g.id === selectedGameId) || games.find(g => g.status === "live") || games[0];

  const { data: events = [] } = useQuery({
    queryKey: ["events", activeGame?.id],
    queryFn: () => activeGame ? api.entities.Event.filter({ game_id: activeGame.id }) : [],
    enabled: !!activeGame,
    refetchInterval: 15000,
  });

  const ourEvents = events.filter(e => !e.is_opponent);
  const oppEvents = events.filter(e => e.is_opponent);

  const kpis = useMemo(() => {
    const possessions = calcPossessions(ourEvents);
    const totalPoints = calcTotalPoints(ourEvents);
    const ppp = possessions > 0 ? (totalPoints / possessions).toFixed(2) : "0.00";
    const turnovers = ourEvents.filter(e => e.action_type === "to").length;
    const turnoverRate = possessions > 0 ? ((turnovers / possessions) * 100).toFixed(1) : "0.0";
    const fgMade = ourEvents.filter(e => ["made_2pt", "made_3pt"].includes(e.action_type)).length;
    const fgAttempted = fgMade + ourEvents.filter(e => ["missed_2pt", "missed_3pt"].includes(e.action_type)).length;
    const fgPct = fgAttempted > 0 ? ((fgMade / fgAttempted) * 100).toFixed(1) : "0.0";
    return { ppp, turnoverRate, totalPoints, possessions: Math.round(possessions), fgPct };
  }, [ourEvents]);

  const activePlayers = players.filter(p => p.status === "active");
  const classificationSum = activePlayers.reduce((sum, p) => sum + (p.classification || 0), 0);
  const isOverLimit = classificationSum > 14.0;

  const lineupPlusMinus = useMemo(() => {
    const activeIds = activePlayers.map(p => p.id);
    if (activeIds.length === 0) return "—";
    const lineupEvents = ourEvents.filter(e => e.lineup_on_court && activeIds.every(id => e.lineup_on_court.includes(id)));
    const pts = lineupEvents.reduce((s, e) => s + (e.points || 0), 0);
    return pts >= 0 ? `+${pts}` : `${pts}`;
  }, [ourEvents, activePlayers]);

  // Danger zones from opponent shots
  const oppShotZones = useMemo(() => {
    const zoneData = {};
    oppEvents.filter(e => e.shot_zone && ["opp_made_2pt", "opp_made_3pt"].includes(e.action_type)).forEach(ev => {
      zoneData[ev.shot_zone] = (zoneData[ev.shot_zone] || 0) + 1;
    });
    const maxVal = Math.max(...Object.values(zoneData), 1);
    return { zoneData, maxVal };
  }, [oppEvents]);

  const topDangerZone = useMemo(() => {
    if (!Object.keys(oppShotZones.zoneData).length) return null;
    return Object.entries(oppShotZones.zoneData).sort((a, b) => b[1] - a[1])[0];
  }, [oppShotZones]);

  const handleExport = async () => {
    if (!activeGame) return;
    setExporting(true);
    try {
      generateGameReport(activeGame, players, events);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-black tracking-tight">Strategy Dashboard</h1>
        <div className="flex items-center gap-2">
          <Select value={activeGame?.id || ""} onValueChange={setSelectedGameId}>
            <SelectTrigger className="w-52 bg-card border-border">
              <SelectValue placeholder="Select game" />
            </SelectTrigger>
            <SelectContent>
              {games.map(g => <SelectItem key={g.id} value={g.id}>vs {g.opponent} — {g.date}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            onClick={handleExport}
            disabled={exporting || !activeGame}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold gap-2"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Export PDF
          </Button>
        </div>
      </div>

      {/* Classification Alert */}
      {isOverLimit && (
        <div className="flex items-center gap-3 px-4 py-3 bg-destructive/15 border border-destructive rounded-xl">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <span className="text-destructive font-bold text-sm">LINEUP VIOLATION — Classification total {classificationSum.toFixed(1)} exceeds 14.0 limit!</span>
        </div>
      )}

      {/* Classification tracker banner */}
      <div className={cn(
        "flex items-center gap-4 px-5 py-3 rounded-xl border-2",
        isOverLimit ? "border-destructive bg-destructive/10" : "border-border bg-card"
      )}>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Current Lineup Class Total</p>
          <p className={cn("text-2xl font-black", isOverLimit ? "text-destructive" : "text-primary")}>
            {classificationSum.toFixed(1)} <span className="text-base font-normal text-muted-foreground">/ 14.0</span>
          </p>
        </div>
        <div className="flex-1">
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", isOverLimit ? "bg-destructive" : "bg-primary")}
              style={{ width: `${Math.min((classificationSum / 14) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {activePlayers.map(p => (
            <span key={p.id} className="text-xs bg-secondary px-2 py-1 rounded-lg font-semibold">
              #{p.number} <span className="text-muted-foreground">{p.classification}</span>
            </span>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Pts Per Possession" value={kpis.ppp} subtitle={`${kpis.totalPoints} pts / ${kpis.possessions} poss`} icon={Zap} />
        <KPICard label="FG%" value={`${kpis.fgPct}%`} icon={Target} />
        <KPICard label="Turnover Rate" value={`${kpis.turnoverRate}%`} icon={TrendingDown} />
        <KPICard label="Lineup +/−" value={lineupPlusMinus} subtitle="Current 5 on floor" icon={BarChart3} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Our shot heat map */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Team Shot Map</p>
          <CourtMap shots={ourEvents.filter(e => e.shot_x != null)} showHeatMap={true} readOnly={true} />
        </div>

        {/* Danger zone map */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Danger Zone — Opponent Shots</p>
            {topDangerZone && (
              <span className="text-[10px] bg-red-900/40 text-red-400 border border-red-700/40 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                Hot: {topDangerZone[0].replace(/_/g, " ")}
              </span>
            )}
          </div>
          <CourtMap
            opponentShots={oppEvents.filter(e => e.shot_x != null)}
            showHeatMap={false}
            readOnly={true}
          />
          {oppEvents.filter(e => e.shot_x != null).length === 0 && (
            <p className="text-xs text-muted-foreground text-center">No opponent shots tracked yet — use "Track Opponent Shot" in the sideline view</p>
          )}
        </div>
      </div>

      {/* Shooting trend + Live feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ShootingChart events={ourEvents} />
        <EventFeed events={events} players={players} />
      </div>
    </div>
  );
}

function EventFeed({ events, players }) {
  const sorted = [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Live Feed</p>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events yet</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sorted.map(ev => {
            const p = players.find(pl => pl.id === ev.player_id);
            return (
              <div key={ev.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-border/50 last:border-0">
                {ev.is_opponent
                  ? <span className="font-bold text-purple-400 text-xs">OPP</span>
                  : <span className="font-black text-primary text-xs">#{p?.number || "?"}</span>
                }
                <span className="text-foreground font-medium capitalize">{ev.action_type.replace(/_/g, " ")}</span>
                {ev.shot_zone && <span className="text-xs text-muted-foreground ml-1">({ev.shot_zone.replace(/_/g, " ")})</span>}
                {ev.points > 0 && <span className="text-emerald-400 font-bold ml-auto">+{ev.points}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}