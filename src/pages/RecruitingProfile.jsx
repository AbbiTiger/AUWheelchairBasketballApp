import React, { useMemo, useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { computePlayerStats } from "@/lib/statUtils";
import CourtMap from "@/components/court/CourtMap";
import { Share2, Copy, Check, Star, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RecruitingProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramPlayerId = urlParams.get("player");
  const [selectedPlayerId, setSelectedPlayerId] = useState(paramPlayerId || null);
  const [copied, setCopied] = useState(false);

  const { data: players = [] } = useQuery({
    queryKey: ["players"],
    queryFn: () => api.entities.Player.list(),
  });

  const selectedPlayer = players.find(p => p.id === selectedPlayerId) || players[0];

  const { data: allEvents = [] } = useQuery({
    queryKey: ["playerEvents", selectedPlayer?.id],
    queryFn: () => selectedPlayer ? api.entities.Event.filter({ player_id: selectedPlayer.id }) : [],
    enabled: !!selectedPlayer,
  });



  const playerStats = useMemo(() => {
    if (!selectedPlayer) return null;
    const playerEvents = allEvents.filter(e => e.player_id === selectedPlayer.id && !e.is_opponent);
    const gameIds = [...new Set(playerEvents.map(e => e.game_id))];
    const gamesPlayed = gameIds.length;

    if (gamesPlayed === 0) return { gamesPlayed: 0, stats: null, seasonHighs: null, shotEvents: [] };

    const stats = computePlayerStats(playerEvents, selectedPlayer.id);
    const perGame = {
      ppg: (stats.points / gamesPlayed).toFixed(1),
      rpg: (stats.rebounds / gamesPlayed).toFixed(1),
      apg: (stats.assists / gamesPlayed).toFixed(1),
      spg: (stats.steals / gamesPlayed).toFixed(1),
      topg: (stats.turnovers / gamesPlayed).toFixed(1),
      fgPct: stats.fgPct,
      fg3Pct: stats.fg3Pct,
      ftPct: stats.ftPct,
    };

    // Season highs - per game
    const seasonHighs = {};
    gameIds.forEach(gid => {
      const gameEvents = playerEvents.filter(e => e.game_id === gid);
      const gs = computePlayerStats(gameEvents, selectedPlayer.id);
      if (!seasonHighs.points || gs.points > seasonHighs.points) seasonHighs.points = gs.points;
      if (!seasonHighs.rebounds || gs.rebounds > seasonHighs.rebounds) seasonHighs.rebounds = gs.rebounds;
      if (!seasonHighs.assists || gs.assists > seasonHighs.assists) seasonHighs.assists = gs.assists;
      if (!seasonHighs.steals || gs.steals > seasonHighs.steals) seasonHighs.steals = gs.steals;
    });

    const shotEvents = playerEvents.filter(e => e.shot_x != null);

    return { gamesPlayed, stats, perGame, seasonHighs, shotEvents };
  }, [selectedPlayer, allEvents]);

  const shareUrl = selectedPlayer
    ? `${window.location.origin}/RecruitingProfile?player=${selectedPlayer.id}`
    : "";

  const handleShare = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Recruiting Profiles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Professional player profiles for overseas coaches</p>
        </div>
        {selectedPlayer && (
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:bg-accent/80 active:scale-95 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copied!" : "Share Profile"}
          </button>
        )}
      </div>

      {/* Player picker */}
      <div className="flex flex-wrap gap-2">
        {players.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlayerId(p.id)}
            className={cn(
              "px-3 py-2 rounded-xl text-sm font-bold transition-all border-2",
              selectedPlayer?.id === p.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            )}
          >
            #{p.number} {p.name}
          </button>
        ))}
      </div>

      {selectedPlayer && playerStats && (
        <div className="space-y-5">
          {/* Player card header */}
          <div className="bg-gradient-to-br from-card via-card to-primary/5 border border-border rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl font-black text-primary border-2 border-primary/30">
              #{selectedPlayer.number}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black text-foreground">{selectedPlayer.name}</h2>
              <div className="flex flex-wrap gap-3 mt-2">
                <Badge label="Classification" value={selectedPlayer.classification} />
                <Badge label="Games" value={playerStats.gamesPlayed} />
                <Badge label="Status" value={selectedPlayer.status === "active" ? "Active Roster" : "Bench"} />
              </div>
            </div>
          </div>

          {playerStats.gamesPlayed === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No game data recorded yet</p>
            </div>
          ) : (
            <>
              {/* Career Averages */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Career Averages / Game
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  <StatBox label="PPG" value={playerStats.perGame.ppg} highlight />
                  <StatBox label="RPG" value={playerStats.perGame.rpg} />
                  <StatBox label="APG" value={playerStats.perGame.apg} />
                  <StatBox label="SPG" value={playerStats.perGame.spg} />
                  <StatBox label="TOPG" value={playerStats.perGame.topg} />
                  <StatBox label="FG%" value={`${playerStats.perGame.fgPct}%`} />
                  <StatBox label="3P%" value={`${playerStats.perGame.fg3Pct}%`} />
                  <StatBox label="FT%" value={`${playerStats.perGame.ftPct}%`} />
                </div>
              </div>

              {/* Season Highs */}
              {playerStats.seasonHighs && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5" /> Season Highs
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <HighBox label="Points" value={playerStats.seasonHighs.points || 0} />
                    <HighBox label="Rebounds" value={playerStats.seasonHighs.rebounds || 0} />
                    <HighBox label="Assists" value={playerStats.seasonHighs.assists || 0} />
                    <HighBox label="Steals" value={playerStats.seasonHighs.steals || 0} />
                  </div>
                </div>
              )}

              {/* Career Shot Chart */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" /> Career Shot Chart ({playerStats.shotEvents.length} attempts)
                </p>
                <div className="max-w-2xl">
                  <CourtMap
                    shots={playerStats.shotEvents}
                    showHeatMap={true}
                    readOnly={true}
                  />
                </div>
              </div>

              {/* Shooting breakdown */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "FG", made: playerStats.stats.fgMade, att: playerStats.stats.fgAttempted, pct: playerStats.perGame.fgPct },
                  { label: "3PT", made: playerStats.stats.fg3Made, att: playerStats.stats.fg3Attempted, pct: playerStats.perGame.fg3Pct },
                  { label: "FT", made: playerStats.stats.ftMade, att: playerStats.stats.ftAttempted, pct: playerStats.perGame.ftPct },
                ].map(row => (
                  <div key={row.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{row.label}</p>
                    <p className="text-2xl font-black text-primary mt-1">{row.pct}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{row.made}/{row.att}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-xs font-bold text-foreground">{value}</span>
    </div>
  );
}

function StatBox({ label, value, highlight }) {
  return (
    <div className={cn(
      "rounded-xl p-3 text-center border",
      highlight ? "bg-primary/10 border-primary/30" : "bg-card border-border"
    )}>
      <p className={cn("text-xl font-black", highlight ? "text-primary" : "text-foreground")}>{value}</p>
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">{label}</p>
    </div>
  );
}

function HighBox({ label, value }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
      <Star className="w-4 h-4 text-primary flex-shrink-0" />
      <div>
        <p className="text-xl font-black text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}