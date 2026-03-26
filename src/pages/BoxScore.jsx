import React, { useState, useMemo } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { computePlayerStats } from "@/lib/statUtils";
import { generateGameReport } from "@/lib/pdfExport";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import StatsTable from "@/components/stats/StatsTable";
import CourtMap from "@/components/court/CourtMap";

export default function BoxScore() {
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const { data: games = [] } = useQuery({
    queryKey: ["games"],
    queryFn: () => api.entities.Game.list("-date"),
  });

  const { data: players = [] } = useQuery({
    queryKey: ["players"],
    queryFn: () => api.entities.Player.list(),
  });

  const activeGame = games.find(g => g.id === selectedGameId) || games[0];

  const { data: events = [] } = useQuery({
    queryKey: ["events", activeGame?.id],
    queryFn: () => activeGame ? api.entities.Event.filter({ game_id: activeGame.id }) : [],
    enabled: !!activeGame,
  });

  const ourEvents = events.filter(e => !e.is_opponent);
  const playerIdsInGame = [...new Set(ourEvents.map(e => e.player_id))];
  const gamePlayers = players.filter(p => playerIdsInGame.includes(p.id));

  const tableRows = useMemo(() => gamePlayers.map(p => ({
    id: p.id, number: p.number, name: p.name, classification: p.classification,
    stats: computePlayerStats(ourEvents, p.id),
  })).sort((a, b) => b.stats.points - a.stats.points), [gamePlayers, ourEvents]);

  const selectedRow = tableRows.find(r => r.id === selectedPlayer?.id);
  const playerShots = selectedPlayer
    ? ourEvents.filter(e => e.player_id === selectedPlayer.id && e.shot_x != null)
    : ourEvents.filter(e => e.shot_x != null);

  const handleExport = async () => {
    if (!activeGame) return;
    setExporting(true);
    try { generateGameReport(activeGame, players, events); }
    finally { setExporting(false); }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-black tracking-tight">Box Score</h1>
        <div className="flex items-center gap-2">
          <Select value={activeGame?.id || ""} onValueChange={setSelectedGameId}>
            <SelectTrigger className="w-52 bg-card border-border">
              <SelectValue placeholder="Select game" />
            </SelectTrigger>
            <SelectContent>
              {games.map(g => (
                <SelectItem key={g.id} value={g.id}>vs {g.opponent} — {g.date}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeGame && (
            <Link to={`/GameDetail?id=${activeGame.id}`} className="text-xs font-bold text-primary hover:text-primary/80 px-3 py-2 rounded-xl border border-primary/30 hover:bg-primary/10 transition-colors whitespace-nowrap">
              Full Analytics →
            </Link>
          )}
          <Button onClick={handleExport} disabled={exporting || !activeGame} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold gap-2">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            PDF
          </Button>
        </div>
      </div>

      {activeGame && (
        <div className="text-sm text-muted-foreground">
          vs <span className="font-bold text-foreground">{activeGame.opponent}</span> · {activeGame.date} · {activeGame.location || "—"}
        </div>
      )}

      <p className="text-xs text-muted-foreground">Click a player row to see their shot chart</p>

      <StatsTable
        rows={tableRows}
        onRowClick={(row) => setSelectedPlayer(selectedPlayer?.id === row.id ? null : row)}
      />

      {/* Player shot chart drill-down */}
      {selectedPlayer && selectedRow && (
        <div className="bg-card border border-primary/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-lg">
              <span className="text-primary">#{selectedPlayer.number}</span> {selectedPlayer.name}
            </h2>
            <div className="flex items-center gap-3">
              <Link to={`/PlayerDetail?id=${selectedPlayer.id}`} className="text-xs font-bold text-primary hover:text-primary/80">
                Full Profile →
              </Link>
              <button onClick={() => setSelectedPlayer(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
            </div>
          </div>
          {/* Mini stats */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {[
              { label: "PTS", val: selectedRow.stats.points },
              { label: "FG", val: `${selectedRow.stats.fgMade}/${selectedRow.stats.fgAttempted}` },
              { label: "3PT", val: `${selectedRow.stats.fg3Made}/${selectedRow.stats.fg3Attempted}` },
              { label: "FT", val: `${selectedRow.stats.ftMade}/${selectedRow.stats.ftAttempted}` },
              { label: "REB", val: selectedRow.stats.rebounds },
              { label: "AST", val: selectedRow.stats.assists },
              { label: "STL", val: selectedRow.stats.steals },
              { label: "BLK", val: selectedRow.stats.blocks },
              { label: "TO", val: selectedRow.stats.turnovers },
              { label: "PF", val: selectedRow.stats.fouls },
            ].map(s => (
              <div key={s.label} className="bg-secondary rounded-xl p-2 text-center">
                <p className="text-[9px] uppercase text-muted-foreground">{s.label}</p>
                <p className="text-base font-black">{s.val}</p>
              </div>
            ))}
          </div>
          {/* Shot chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Shot Zones (Heat Map)</p>
              <CourtMap shots={playerShots} showHeatMap={true} readOnly={true} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">All Shots</p>
              <CourtMap shots={playerShots} showHeatMap={false} readOnly={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}