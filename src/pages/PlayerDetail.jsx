import React, { useMemo } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { computePlayerStats } from "@/lib/statUtils";
import CourtMap from "@/components/court/CourtMap";
import { ArrowLeft } from "lucide-react";

const STAT_GRID = [
  { label: "PTS", key: "points" },
  { label: "FGM", key: "fgMade" },
  { label: "FGA", key: "fgAttempted" },
  { label: "FG%", key: "fgPct", pct: true },
  { label: "3PTM", key: "fg3Made" },
  { label: "3PTA", key: "fg3Attempted" },
  { label: "3PT%", key: "fg3Pct", pct: true },
  { label: "FTM", key: "ftMade" },
  { label: "FTA", key: "ftAttempted" },
  { label: "FT%", key: "ftPct", pct: true },
  { label: "AST", key: "assists" },
  { label: "OFF REB", key: "orb" },
  { label: "DEF REB", key: "drb" },
  { label: "TOT REB", key: "rebounds" },
  { label: "STL", key: "steals" },
  { label: "BLK", key: "blocks" },
  { label: "TO", key: "turnovers" },
  { label: "Fouls", key: "fouls" },
  { label: "Tech", key: "techs" },
];

export default function PlayerDetail() {
  const params = new URLSearchParams(window.location.search);
  const playerId = params.get("id");

  const { data: players = [] } = useQuery({
    queryKey: ["players"],
    queryFn: () => api.entities.Player.list(),
  });

  const { data: games = [] } = useQuery({
    queryKey: ["games"],
    queryFn: () => api.entities.Game.list("-date"),
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ["allEvents"],
    queryFn: () => api.entities.Event.list("-created_date", 5000),
  });

  const player = players.find(p => p.id === playerId);
  const playerEvents = allEvents.filter(e => e.player_id === playerId && !e.is_opponent);

  const careerStats = useMemo(() => computePlayerStats(playerEvents, playerId), [playerEvents]);

  const gamesPlayed = useMemo(() => {
    const gameIds = [...new Set(playerEvents.map(e => e.game_id))];
    return gameIds.length;
  }, [playerEvents]);

  const avgStats = useMemo(() => {
    if (gamesPlayed === 0) return null;
    return {
      points: (careerStats.points / gamesPlayed).toFixed(1),
      rebounds: (careerStats.rebounds / gamesPlayed).toFixed(1),
      assists: (careerStats.assists / gamesPlayed).toFixed(1),
      steals: (careerStats.steals / gamesPlayed).toFixed(1),
      blocks: (careerStats.blocks / gamesPlayed).toFixed(1),
      turnovers: (careerStats.turnovers / gamesPlayed).toFixed(1),
      fgPct: careerStats.fgPct,
      fg3Pct: careerStats.fg3Pct,
      ftPct: careerStats.ftPct,
    };
  }, [careerStats, gamesPlayed]);

  // Per-game breakdown
  const gameBreakdown = useMemo(() => {
    const gameIds = [...new Set(playerEvents.map(e => e.game_id))];
    return gameIds.map(gid => {
      const game = games.find(g => g.id === gid);
      const gevents = playerEvents.filter(e => e.game_id === gid);
      const stats = computePlayerStats(gevents, playerId);
      return { game, stats, gid };
    }).filter(r => r.game).sort((a, b) => new Date(b.game.date) - new Date(a.game.date));
  }, [playerEvents, games]);

  const shotEvents = playerEvents.filter(e => e.shot_x != null);

  if (!player) return <div className="p-8 text-muted-foreground">Player not found.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => window.history.back()} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          {player.photo_url && (
            <img src={player.photo_url} alt={player.name} className="w-16 h-16 rounded-2xl object-cover" />
          )}
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-primary">#{player.number}</span>
              <h1 className="text-3xl font-black">{player.name}</h1>
            </div>
            <p className="text-sm text-muted-foreground">Class {player.classification} · {gamesPlayed} games played</p>
          </div>
        </div>
      </div>

      {/* Season averages */}
      {avgStats && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Season Averages per Game</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {[
              { label: "PPG", val: avgStats.points },
              { label: "RPG", val: avgStats.rebounds },
              { label: "APG", val: avgStats.assists },
              { label: "SPG", val: avgStats.steals },
              { label: "BPG", val: avgStats.blocks },
              { label: "TOPG", val: avgStats.turnovers },
              { label: "FG%", val: `${avgStats.fgPct}%` },
              { label: "3PT%", val: `${avgStats.fg3Pct}%` },
              { label: "FT%", val: `${avgStats.ftPct}%` },
            ].map(s => (
              <div key={s.label} className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-black text-primary mt-1">{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full career totals */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Career Totals</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-2">
          {STAT_GRID.map(s => (
            <div key={s.label} className="bg-secondary rounded-xl p-2 text-center">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className="text-base font-black text-foreground mt-0.5">
                {s.pct ? `${careerStats[s.key]}%` : careerStats[s.key] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Shot chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
          Career Shot Chart ({shotEvents.length} shots)
        </p>
        <div className="max-w-xl mx-auto">
          <CourtMap shots={shotEvents} showHeatMap={true} readOnly={true} />
        </div>
      </div>

      {/* Full shot chart below */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">All Shots — Full View</p>
        <CourtMap shots={shotEvents} showHeatMap={false} readOnly={true} />
      </div>

      {/* Game-by-game breakdown */}
      {gameBreakdown.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Game Log</p>
          <div className="space-y-2">
            {gameBreakdown.map(({ game, stats, gid }) => (
              <div key={gid} className="flex items-center gap-4 bg-secondary rounded-xl px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm">vs {game.opponent}</p>
                  <p className="text-xs text-muted-foreground">{game.date}</p>
                </div>
                <div className="flex gap-4 text-center text-sm flex-shrink-0">
                  <div><p className="text-[9px] text-muted-foreground">PTS</p><p className="font-black text-primary text-base">{stats.points}</p></div>
                  <div><p className="text-[9px] text-muted-foreground">REB</p><p className="font-bold">{stats.rebounds}</p></div>
                  <div><p className="text-[9px] text-muted-foreground">AST</p><p className="font-bold">{stats.assists}</p></div>
                  <div><p className="text-[9px] text-muted-foreground">FG%</p><p className="font-bold">{stats.fgPct}%</p></div>
                  <div><p className="text-[9px] text-muted-foreground">STL</p><p className="font-bold">{stats.steals}</p></div>
                  <div><p className="text-[9px] text-muted-foreground">BLK</p><p className="font-bold">{stats.blocks}</p></div>
                  <div><p className="text-[9px] text-muted-foreground">TO</p><p className="font-bold">{stats.turnovers}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}