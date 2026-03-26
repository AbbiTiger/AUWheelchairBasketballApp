// Compute player stats from events
export function computePlayerStats(events, playerId) {
  const e = playerId ? events.filter(ev => ev.player_id === playerId) : events;

  const points = e.reduce((sum, ev) => sum + (ev.points || 0), 0);
  const orb = e.filter(ev => ev.action_type === "orb").length;
  const drb = e.filter(ev => ev.action_type === "drb").length;
  const rebounds = orb + drb;
  const assists = e.filter(ev => ev.action_type === "ast").length;
  const steals = e.filter(ev => ev.action_type === "stl").length;
  const turnovers = e.filter(ev => ev.action_type === "to").length;
  const fouls = e.filter(ev => ev.action_type === "foul").length;
  const blocks = e.filter(ev => ev.action_type === "bs").length;
  const techs = e.filter(ev => ev.action_type === "tech").length;

  const fgMade = e.filter(ev => ev.action_type === "made_2pt" || ev.action_type === "made_3pt").length;
  const fgAttempted = fgMade + e.filter(ev => ev.action_type === "missed_2pt" || ev.action_type === "missed_3pt").length;
  const fg3Made = e.filter(ev => ev.action_type === "made_3pt").length;
  const fg3Attempted = fg3Made + e.filter(ev => ev.action_type === "missed_3pt").length;
  const ftMade = e.filter(ev => ev.action_type === "ft_made").length;
  const ftAttempted = ftMade + e.filter(ev => ev.action_type === "ft_missed").length;

  return {
    points, rebounds, orb, drb, assists, steals, turnovers, fouls, blocks, techs,
    fgMade, fgAttempted,
    fgPct: fgAttempted > 0 ? ((fgMade / fgAttempted) * 100).toFixed(1) : "0.0",
    fg3Made, fg3Attempted,
    fg3Pct: fg3Attempted > 0 ? ((fg3Made / fg3Attempted) * 100).toFixed(1) : "0.0",
    ftMade, ftAttempted,
    ftPct: ftAttempted > 0 ? ((ftMade / ftAttempted) * 100).toFixed(1) : "0.0",
  };
}

export function calcPossessions(events) {
  const fga = events.filter(e => ["made_2pt","missed_2pt","made_3pt","missed_3pt"].includes(e.action_type)).length;
  const to = events.filter(e => e.action_type === "to").length;
  const fta = events.filter(e => ["ft_made","ft_missed"].includes(e.action_type)).length;
  return fga + to + (0.44 * fta);
}

export function calcTotalPoints(events) {
  return events.reduce((sum, e) => sum + (e.points || 0), 0);
}

export function filterEventsByTime(events, minutes) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  return events.filter(e => e.timestamp >= cutoff);
}

export function calcFGPct(events) {
  const fgMade = events.filter(e => e.action_type === "made_2pt" || e.action_type === "made_3pt").length;
  const fgAttempted = fgMade + events.filter(e => e.action_type === "missed_2pt" || e.action_type === "missed_3pt").length;
  return fgAttempted > 0 ? ((fgMade / fgAttempted) * 100).toFixed(1) : "0.0";
}