import React, { useMemo, useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { computePlayerStats, calcPossessions, calcTotalPoints } from "@/lib/statUtils";
import CourtMap from "@/components/court/CourtMap";
import StatsTable from "@/components/stats/StatsTable";
import KPICard from "@/components/dashboard/KPICard";
import { generateGameReport } from "@/lib/pdfExport";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, ArrowLeft, Target, Zap, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GameDetail() {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get("id");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [exporting, setExporting] = useState(false);

  const { data: game } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => api.entities.Game.list().then(gs => gs.find(g => g.id === gameId)),
    enabled: !!gameId,
  });

  const { data: players = [] } = useQuery({
    queryKey: ["players"],
    queryFn: () => api.entities.Player.list(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events", gameId],
    queryFn: () => api.entities.Event.filter({ game_id: gameId }),
    enabled: !!gameId,
  });

  const ourEvents = events.filter(e => !e.is_opponent);
  const oppEvents = events.filter(e => e.is_opponent);

  const playerIdsInGame = [...new Set(ourEvents.map(e => e.player_id))];
  const gamePlayers = players.filter(p => playerIdsInGame.includes(p.id));

  const tableRows = useMemo(() => gamePlayers.map(p => ({
    id: p.id, number: p.number, name: p.name, classification: p.classification,
    stats: computePlayerStats(ourEvents, p.id),
  })).sort((a, b) => b.stats.points - a.stats.points), [gamePlayers, ourEvents]);

  const kpis = useMemo(() => {
    const possessions = calcPossessions(ourEvents);
    const totalPoints = calcTotalPoints(ourEvents);
    const ppp = possessions > 0 ? (totalPoints / possessions).toFixed(2) : "0.00";
    const turnovers = ourEvents.filter(e => e.action_type === "to").length;
    const turnoverRate = possessions > 0 ? ((turnovers / possessions) * 100).toFixed(1) : "0.0";
    const fgMade = ourEvents.filter(e => ["made_2pt","made_3pt"].includes(e.action_type)).length;
    const fgAtt = fgMade + ourEvents.filter(e => ["missed_2pt","missed_3pt"].includes(e.action_type)).length;
    const fgPct = fgAtt > 0 ? ((fgMade / fgAtt) * 100).toFixed(1) : "0.0";
    const oppPts = oppEvents.reduce((s, e) => s + (e.points || 0), 0);
    return { ppp, turnoverRate, totalPoints, possessions: Math.round(possessions), fgPct, oppPts };
  }, [ourEvents, oppEvents]);

  const selectedPlayerRow = tableRows.find(r => r.id === selectedPlayer?.id);
  const playerShotEvents = selectedPlayer
    ? ourEvents.filter(e => e.player_id === selectedPlayer.id && e.shot_x != null)
    : ourEvents.filter(e => e.shot_x != null);

  const handleExport = async () => {
    if (!game) return;
    setExporting(true);
    try { generateGameReport(game, players, events); }
    finally { setExporting(false); }
  };

  if (!gameId) return <div className="p-8 text-muted-foreground">No game selected.</div>;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              vs {game?.opponent || "..."}
            </h1>
            <p className="text-sm text-muted-foreground">{game?.date} · {game?.location || "—"}</p>
          </div>
        </div>
        <Button onClick={handleExport} disabled={exporting || !game} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold gap-2">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          Export PDF
        </Button>
      </div>

      {/* Score banner */}
      {game && (
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Us</p>
            <p className="text-5xl font-black text-primary">{kpis.totalPoints}</p>
          </div>
          <div className="text-3xl font-bold text-muted-foreground">–</div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{game.opponent}</p>
            <p className="text-5xl font-black text-foreground">{kpis.oppPts}</p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Pts Per Possession" value={kpis.ppp} subtitle={`${kpis.totalPoints} pts / ${kpis.possessions} poss`} icon={Zap} />
        <KPICard label="FG%" value={`${kpis.fgPct}%`} icon={Target} />
        <KPICard label="Turnover Rate" value={`${kpis.turnoverRate}%`} icon={TrendingDown} />
        <KPICard label="Players Used" value={gamePlayers.length} icon={BarChart3} />
      </div>

      {/* Box Score Table — clickable rows */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
          Box Score — click a player to drill down
        </p>
        <StatsTable
          rows={tableRows}
          onRowClick={(row) => setSelectedPlayer(selectedPlayer?.id === row.id ? null : { id: row.id, number: row.number, name: row.name })}
        />
      </div>

      {/* Player drill-down */}
      {selectedPlayer && selectedPlayerRow && (
        <div className="bg-card border border-primary/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">
              <span className="text-primary">#{selectedPlayer.number}</span> {selectedPlayer.name} — This Game
            </h2>
            <button onClick={() => setSelectedPlayer(null)} className="text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
          </div>
          {/* Mini stat grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-2">
            {[
              { label: "PTS", val: selectedPlayerRow.stats.points },
              { label: "FGM", val: `${selectedPlayerRow.stats.fgMade}/${selectedPlayerRow.stats.fgAttempted}` },
              { label: "FG%", val: `${selectedPlayerRow.stats.fgPct}%` },
              { label: "3PTM", val: `${selectedPlayerRow.stats.fg3Made}/${selectedPlayerRow.stats.fg3Attempted}` },
              { label: "3PT%", val: `${selectedPlayerRow.stats.fg3Pct}%` },
              { label: "FTM", val: `${selectedPlayerRow.stats.ftMade}/${selectedPlayerRow.stats.ftAttempted}` },
              { label: "FT%", val: `${selectedPlayerRow.stats.ftPct}%` },
              { label: "REB", val: selectedPlayerRow.stats.rebounds },
              { label: "AST", val: selectedPlayerRow.stats.assists },
              { label: "STL", val: selectedPlayerRow.stats.steals },
              { label: "BLK", val: selectedPlayerRow.stats.blocks },
              { label: "TO", val: selectedPlayerRow.stats.turnovers },
              { label: "PF", val: selectedPlayerRow.stats.fouls },
              { label: "TECH", val: selectedPlayerRow.stats.techs },
            ].map(item => (
              <div key={item.label} className="bg-secondary rounded-xl p-2 text-center">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{item.label}</p>
                <p className="text-base font-black text-foreground mt-0.5">{item.val}</p>
              </div>
            ))}
          </div>
          {/* Shot chart */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Shot Chart</p>
            <CourtMap shots={playerShotEvents} showHeatMap={false} readOnly={true} />
          </div>
        </div>
      )}

      {/* Court Maps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            {selectedPlayer ? `${selectedPlayer.name} Shot Chart` : "Team Shot Map"}
          </p>
          <CourtMap shots={playerShotEvents} showHeatMap={true} readOnly={true} />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Opponent Shot Map</p>
          <CourtMap opponentShots={oppEvents.filter(e => e.shot_x != null)} showHeatMap={false} readOnly={true} />
        </div>
      </div>
    </div>
  );
}