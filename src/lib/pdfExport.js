import jsPDF from "jspdf";
import { computePlayerStats, calcPossessions } from "./statUtils";

const DARK = [15, 23, 42];
const MID = [30, 41, 59];
const LIGHT = [148, 163, 184];
const WHITE = [248, 250, 252];
const PRIMARY = [251, 146, 60]; // orange
const GREEN = [34, 197, 94];
const RED = [239, 68, 68];

function drawHeader(doc, title, subtitle) {
  doc.setFillColor(...DARK);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(30, 41, 80);
  doc.rect(0, 0, 210, 32, "F");
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 32, 210, 1.5, "F");
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("COURTSIDE", 14, 14);
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.text(title, 14, 22);
  doc.setTextColor(...LIGHT);
  doc.setFontSize(8);
  doc.text(subtitle, 14, 28);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 210 - 14, 28, { align: "right" });
}

function sectionTitle(doc, text, y) {
  doc.setFillColor(30, 41, 80);
  doc.rect(14, y - 5, 182, 8, "F");
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(text.toUpperCase(), 16, y);
  return y + 8;
}

function drawArcLines(doc, cx, cy, rx, ry, startDeg, endDeg, steps = 36) {
  const startRad = (startDeg * Math.PI) / 180;
  const endRad = (endDeg * Math.PI) / 180;
  for (let i = 0; i < steps; i++) {
    const a1 = startRad + (i / steps) * (endRad - startRad);
    const a2 = startRad + ((i + 1) / steps) * (endRad - startRad);
    doc.line(
      cx + rx * Math.cos(a1), cy + ry * Math.sin(a1),
      cx + rx * Math.cos(a2), cy + ry * Math.sin(a2)
    );
  }
}

function drawCourtWithShots(doc, events, startY, isOpponent = false) {
  const title = isOpponent ? "Opponent Shot Chart" : "Team Shot Chart";
  let y = sectionTitle(doc, title, startY);

  const L = 14;
  const T = y;
  const W = 182;
  const H = 88;

  const px = (x) => L + (x / 100) * W;
  const py = (yc) => T + (yc / 100) * H;

  // Court background
  doc.setFillColor(15, 28, 60);
  doc.rect(L, T, W, H, "F");

  // Court border
  doc.setDrawColor(50, 80, 140);
  doc.setLineWidth(0.4);
  doc.rect(L, T, W, H, "S");

  // Paint / key rectangle (33,65) to (67,93)
  doc.setFillColor(20, 38, 80);
  doc.setDrawColor(160, 130, 50);
  doc.setLineWidth(0.4);
  const paintX = px(33), paintY = py(65), paintW = px(67) - px(33), paintH = py(93) - py(65);
  doc.rect(paintX, paintY, paintW, paintH, "FD");

  // Free throw line
  doc.setDrawColor(160, 130, 50);
  doc.line(px(33), py(65), px(67), py(65));

  // Free throw circle — top half only (dashed look via segments)
  drawArcLines(doc, px(50), py(65), (10 / 100) * W, (10 / 100) * H, 180, 360, 20);

  // Basket circle
  doc.setFillColor(240, 120, 40);
  doc.setDrawColor(240, 120, 40);
  doc.setLineWidth(0.8);
  drawArcLines(doc, px(50), py(88), (2.8 / 100) * W, (2.8 / 100) * H, 0, 360, 16);
  // Fill basket area with small rect
  doc.setFillColor(240, 120, 40);
  doc.rect(px(50) - 2, py(88) - 1.5, 4, 3, "F");

  // Backboard
  doc.setLineWidth(0.8);
  doc.setDrawColor(240, 120, 40);
  doc.line(px(43), py(91), px(57), py(91));

  // 3PT corner lines
  doc.setDrawColor(160, 130, 50);
  doc.setLineWidth(0.4);
  doc.line(px(14), py(95), px(14), py(76));
  doc.line(px(86), py(95), px(86), py(76));

  // 3PT arc (ellipse approximation centered at basket 50,88, radius ~37 court units)
  const arc3cx = px(50), arc3cy = py(88);
  const arc3rx = (37 / 100) * W;
  const arc3ry = (37 / 100) * H;
  drawArcLines(doc, arc3cx, arc3cy, arc3rx, arc3ry, 195, 345, 40);

  // Shot dots
  const shotEvents = events.filter(e => e.shot_x != null && !!e.is_opponent === isOpponent);
  shotEvents.forEach(shot => {
    const sx = px(shot.shot_x);
    const sy = py(shot.shot_y);
    const isMade = isOpponent
      ? ["opp_made_2pt", "opp_made_3pt"].includes(shot.action_type)
      : ["made_2pt", "made_3pt", "ft_made"].includes(shot.action_type);

    if (isMade) {
      doc.setFillColor(...GREEN);
      doc.rect(sx - 1.8, sy - 1.8, 3.6, 3.6, "F");
    } else {
      doc.setDrawColor(...RED);
      doc.setLineWidth(0.6);
      doc.line(sx - 1.8, sy - 1.8, sx + 1.8, sy + 1.8);
      doc.line(sx + 1.8, sy - 1.8, sx - 1.8, sy + 1.8);
    }
  });

  doc.setLineWidth(0.4);

  // Legend
  const legY = T + H + 4;
  doc.setFillColor(...GREEN);
  doc.rect(L, legY, 3, 3, "F");
  doc.setTextColor(...LIGHT);
  doc.setFontSize(6);
  doc.text("Made", L + 5, legY + 2.5);

  doc.setDrawColor(...RED);
  doc.setLineWidth(0.6);
  doc.line(L + 20, legY, L + 23, legY + 3);
  doc.line(L + 23, legY, L + 20, legY + 3);
  doc.text("Missed", L + 26, legY + 2.5);

  const totalShots = shotEvents.length;
  const madeShots = shotEvents.filter(e => isOpponent
    ? ["opp_made_2pt", "opp_made_3pt"].includes(e.action_type)
    : ["made_2pt", "made_3pt", "ft_made"].includes(e.action_type)).length;
  doc.setTextColor(...PRIMARY);
  doc.text(`${totalShots} attempts · ${totalShots > 0 ? Math.round((madeShots / totalShots) * 100) : 0}% made`, 210 - 14, legY + 2.5, { align: "right" });

  doc.setLineWidth(0.4);
  return T + H + 14;
}

function drawBoxScore(doc, players, events, startY) {
  let y = sectionTitle(doc, "Box Score", startY);

  const cols = ["Player", "PTS", "FGM-A", "FG%", "3PM-A", "FTM-A", "REB", "AST", "STL", "TO", "PF"];
  const colWidths = [44, 12, 18, 12, 18, 18, 12, 12, 12, 10, 10];
  const colX = [14];
  for (let i = 0; i < colWidths.length - 1; i++) colX.push(colX[i] + colWidths[i]);

  doc.setFillColor(...MID);
  doc.rect(14, y, 182, 8, "F");
  doc.setTextColor(...LIGHT);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  cols.forEach((col, i) => {
    doc.text(col, colX[i] + (i === 0 ? 2 : colWidths[i] / 2), y + 5.5, { align: i === 0 ? "left" : "center" });
  });
  y += 8;

  const gamePlayerIds = [...new Set(events.filter(e => !e.is_opponent).map(e => e.player_id))];
  const gamePlayers = players.filter(p => gamePlayerIds.includes(p.id));
  let totalPts = 0;

  gamePlayers.forEach((player, rowIdx) => {
    const s = computePlayerStats(events.filter(e => !e.is_opponent), player.id);
    totalPts += s.points;
    doc.setFillColor(rowIdx % 2 === 0 ? 22 : 28, rowIdx % 2 === 0 ? 33 : 38, rowIdx % 2 === 0 ? 55 : 65);
    doc.rect(14, y, 182, 7, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(`#${player.number} ${player.name}`, colX[0] + 2, y + 4.5);
    doc.setFont("helvetica", "normal");
    const vals = [
      s.points, `${s.fgMade}-${s.fgAttempted}`, `${s.fgPct}%`,
      `${s.fg3Made}-${s.fg3Attempted}`, `${s.ftMade}-${s.ftAttempted}`,
      s.rebounds, s.assists, s.steals, s.turnovers, s.fouls
    ];
    vals.forEach((val, i) => {
      if (i === 0) doc.setTextColor(...PRIMARY);
      else doc.setTextColor(...WHITE);
      doc.text(String(val), colX[i + 1] + colWidths[i + 1] / 2, y + 4.5, { align: "center" });
    });
    y += 7;
  });

  // Totals row
  doc.setFillColor(20, 30, 60);
  doc.rect(14, y, 182, 7, "F");
  doc.setTextColor(...PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("TEAM TOTAL", colX[0] + 2, y + 4.5);
  doc.text(String(totalPts), colX[1] + colWidths[1] / 2, y + 4.5, { align: "center" });

  return y + 14;
}

function drawOpponentBoxScore(doc, game, events, startY) {
  const oppPlayers = game.opponent_players || [];
  if (oppPlayers.length === 0) return startY;

  let y = sectionTitle(doc, "Opponent Box Score", startY);

  const cols = ["Player", "2PT Made", "3PT Made", "2PT Miss", "3PT Miss", "Total Pts"];
  const colWidths = [50, 25, 25, 25, 25, 25];
  const colX = [14, 64, 89, 114, 139, 164];

  doc.setFillColor(...MID);
  doc.rect(14, y, 182, 8, "F");
  doc.setTextColor(...LIGHT);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  cols.forEach((col, i) => {
    doc.text(col, colX[i] + (i === 0 ? 2 : colWidths[i] / 2), y + 5.5, { align: i === 0 ? "left" : "center" });
  });
  y += 8;

  oppPlayers.forEach((player, rowIdx) => {
    const playerEvents = events.filter(e => e.is_opponent && e.player_id === player.id);
    const made2 = playerEvents.filter(e => e.action_type === "opp_made_2pt").length;
    const made3 = playerEvents.filter(e => e.action_type === "opp_made_3pt").length;
    const miss2 = playerEvents.filter(e => e.action_type === "opp_missed_2pt").length;
    const miss3 = playerEvents.filter(e => e.action_type === "opp_missed_3pt").length;
    const totalPts = made2 * 2 + made3 * 3;

    doc.setFillColor(rowIdx % 2 === 0 ? 22 : 28, rowIdx % 2 === 0 ? 33 : 38, rowIdx % 2 === 0 ? 55 : 65);
    doc.rect(14, y, 182, 7, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(`#${player.number} ${player.name}`, colX[0] + 2, y + 4.5);
    doc.setFont("helvetica", "normal");

    doc.setTextColor(...GREEN);
    doc.text(String(made2), colX[1] + colWidths[1] / 2, y + 4.5, { align: "center" });
    doc.text(String(made3), colX[2] + colWidths[2] / 2, y + 4.5, { align: "center" });
    doc.setTextColor(...RED);
    doc.text(String(miss2), colX[3] + colWidths[3] / 2, y + 4.5, { align: "center" });
    doc.text(String(miss3), colX[4] + colWidths[4] / 2, y + 4.5, { align: "center" });
    doc.setTextColor(...PRIMARY);
    doc.text(String(totalPts), colX[5] + colWidths[5] / 2, y + 4.5, { align: "center" });
    y += 7;
  });

  return y + 10;
}

function drawLineupAnalysis(doc, events, players, startY) {
  let y = sectionTitle(doc, "Lineup Analysis", startY);

  const lineupMap = {};
  events.filter(e => !e.is_opponent && e.lineup_on_court?.length === 5).forEach(ev => {
    const key = [...ev.lineup_on_court].sort().join(",");
    if (!lineupMap[key]) lineupMap[key] = { lineup: ev.lineup_on_court, events: [] };
    lineupMap[key].events.push(ev);
  });

  const lineups = Object.values(lineupMap)
    .map(({ lineup, events: evts }) => {
      const pts = evts.reduce((s, e) => s + (e.points || 0), 0);
      const poss = calcPossessions(evts);
      const ppp = poss > 0 ? (pts / poss).toFixed(2) : "—";
      const names = lineup.map(id => {
        const p = players.find(pl => pl.id === id);
        return p ? `#${p.number}` : "?";
      }).join(", ");
      return { names, pts, ppp, possessions: Math.round(poss), count: evts.length };
    })
    .sort((a, b) => b.pts - a.pts)
    .slice(0, 8);

  if (lineups.length === 0) return y + 10;

  const cols = ["Lineup", "Pts", "Poss", "PPP"];
  const colWidths = [110, 20, 26, 26];
  const colX = [14, 124, 144, 170];

  doc.setFillColor(...MID);
  doc.rect(14, y, 182, 7, "F");
  doc.setTextColor(...LIGHT);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  cols.forEach((col, i) => doc.text(col, colX[i] + (i === 0 ? 2 : colWidths[i] / 2), y + 4.5, { align: i === 0 ? "left" : "center" }));
  y += 7;

  lineups.forEach((lineup, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 22 : 28, idx % 2 === 0 ? 33 : 38, idx % 2 === 0 ? 55 : 65);
    doc.rect(14, y, 182, 7, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(lineup.names, colX[0] + 2, y + 4.5);
    doc.setTextColor(...PRIMARY);
    doc.text(String(lineup.pts), colX[1] + colWidths[1] / 2, y + 4.5, { align: "center" });
    doc.setTextColor(...WHITE);
    doc.text(String(lineup.possessions), colX[2] + colWidths[2] / 2, y + 4.5, { align: "center" });
    doc.text(String(lineup.ppp), colX[3] + colWidths[3] / 2, y + 4.5, { align: "center" });
    y += 7;
  });

  return y + 10;
}

function addPageBackground(doc) {
  doc.setFillColor(...DARK);
  doc.rect(0, 0, 210, 297, "F");
}

function checkPage(doc, y, needed = 100) {
  if (y + needed > 280) {
    doc.addPage();
    addPageBackground(doc);
    return 14;
  }
  return y;
}

export function generateGameReport(game, players, events) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  drawHeader(doc, `Game Report — vs ${game.opponent}`, `${game.date} · ${game.location || ""}`);

  let y = 44;

  // Score summary
  const ourScore = events.filter(e => !e.is_opponent).reduce((s, e) => s + (e.points || 0), 0);
  doc.setFillColor(20, 30, 60);
  doc.rect(14, y, 182, 16, "F");
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(String(ourScore), 65, y + 11, { align: "center" });
  doc.setTextColor(...LIGHT);
  doc.setFontSize(8);
  doc.text("US", 65, y + 4, { align: "center" });
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.text("vs", 105, y + 11, { align: "center" });
  doc.setTextColor(...WHITE);
  doc.setFontSize(20);
  doc.text(String(game.opponent_score || "—"), 145, y + 11, { align: "center" });
  doc.setTextColor(...LIGHT);
  doc.setFontSize(8);
  doc.text(game.opponent, 145, y + 4, { align: "center" });

  y += 24;

  // Box Score
  y = drawBoxScore(doc, players, events, y);

  // Opponent box score (if opponent players exist)
  y = checkPage(doc, y, 40);
  y = drawOpponentBoxScore(doc, game, events, y);

  // Team shot chart
  y = checkPage(doc, y, 105);
  y = drawCourtWithShots(doc, events, y, false);

  // Opponent shot chart
  y = checkPage(doc, y, 105);
  y = drawCourtWithShots(doc, events, y, true);

  // Lineup Analysis
  y = checkPage(doc, y, 80);
  y = drawLineupAnalysis(doc, events, players, y);

  // Footer
  doc.setFillColor(...MID);
  doc.rect(0, 285, 210, 12, "F");
  doc.setTextColor(...LIGHT);
  doc.setFontSize(7);
  doc.text("COURTSIDE Stat Tracker — Confidential Team Document", 105, 292, { align: "center" });

  doc.save(`GameReport_vs_${game.opponent}_${game.date}.pdf`);
}