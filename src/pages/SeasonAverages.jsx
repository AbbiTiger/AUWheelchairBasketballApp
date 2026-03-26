import React, { useMemo, useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { computePlayerStats } from "@/lib/statUtils";
import { Link } from "react-router-dom";
import StatsTable from "@/components/stats/StatsTable";
import { DISPLAY_COLUMNS } from "@/components/stats/StatsTable";

export default function SeasonAverages() {
  const [mode, setMode] = useState("avg"); // "avg" | "total"

  const { data: players = [] } = useQuery({
    queryKey: ["players"],
    queryFn: () => api.entities.Player.list(),
  });

  const { data: games = [] } = useQuery({
    queryKey: ["games"],
    queryFn: () => api.entities.Game.list(),
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ["allEvents"],
    queryFn: () => api.entities.Event.list("-created_date", 5000),
  });

  const ourAllEvents = allEvents.filter(e => !e.is_opponent);

  const seasonRows = useMemo(() => {
    return players.map(player => {
      const playerEvents = ourAllEvents.filter(e => e.player_id === player.id);
      const gameIds = [...new Set(playerEvents.map(e => e.game_id))];
      const gp = gameIds.length;
      const totals = computePlayerStats(playerEvents, player.id);

      const stats = mode === "avg" && gp > 0
        ? {
            fgMade: (totals.fgMade / gp).toFixed(1),
            fgAttempted: (totals.fgAttempted / gp).toFixed(1),
            fgPct: totals.fgPct,
            fg3Made: (totals.fg3Made / gp).toFixed(1),
            fg3Attempted: (totals.fg3Attempted / gp).toFixed(1),
            fg3Pct: totals.fg3Pct,
            ftMade: (totals.ftMade / gp).toFixed(1),
            ftAttempted: (totals.ftAttempted / gp).toFixed(1),
            ftPct: totals.ftPct,
            assists: (totals.assists / gp).toFixed(1),
            orb: (totals.orb / gp).toFixed(1),
            drb: (totals.drb / gp).toFixed(1),
            rebounds: (totals.rebounds / gp).toFixed(1),
            fouls: (totals.fouls / gp).toFixed(1),
            blocks: (totals.blocks / gp).toFixed(1),
            steals: (totals.steals / gp).toFixed(1),
            turnovers: (totals.turnovers / gp).toFixed(1),
            techs: (totals.techs / gp).toFixed(1),
            points: (totals.points / gp).toFixed(1),
          }
        : totals;

      return {
        id: player.id,
        number: player.number,
        name: player.name,
        classification: player.classification,
        gp,
        stats,
      };
    }).sort((a, b) => parseFloat(b.stats.points) - parseFloat(a.stats.points));
  }, [players, ourAllEvents, mode]);

  const completedGames = games.filter(g => g.status === "completed").length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Season Stats</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{completedGames} games completed · {players.length} players</p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          <button
            onClick={() => setMode("avg")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${mode === "avg" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Per Game
          </button>
          <button
            onClick={() => setMode("total")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${mode === "total" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Totals
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Click a player row for their full profile & shot chart</p>

      <StatsTable
        rows={seasonRows}
        onRowClick={(row) => window.location.href = `/PlayerDetail?id=${row.id}`}
      />
    </div>
  );
}