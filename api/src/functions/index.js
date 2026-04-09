const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 7071;

// ─── Helper: column whitelist per table (prevents SQL injection) ───────────
const SORTABLE = {
  games:   ["id", "date", "opponent", "location", "status", "our_score", "opponent_score", "created_date"],
  players: ["id", "name", "number", "classification", "status", "position", "created_date"],
  events:  ["id", "timestamp", "player_id", "game_id", "action_type", "points", "is_opponent", "created_date"],
};

const FILTERABLE = {
  games:   ["status", "opponent", "date"],
  players: ["status", "position", "classification"],
  events:  ["game_id", "player_id", "action_type", "is_opponent"],
};

// ─── Helper: row → JSON-ready object ──────────────────────────────────────
function gameToJson(row) {
  if (!row) return null;
  return { ...row, opponent_players: row.opponent_players ? JSON.parse(row.opponent_players) : [] };
}

function eventToJson(row) {
  if (!row) return null;
  return {
    ...row,
    is_opponent: Boolean(row.is_opponent),
    lineup_on_court: row.lineup_on_court ? JSON.parse(row.lineup_on_court) : [],
  };
}

function playerToJson(row) {
  return row || null;
}

// ═══════════════════════════════════════════════════════════════════════════
// GAMES
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/games
app.get("/api/games", (req, res) => {
  try {
    let sql = "SELECT * FROM games";
    const params = [];
    const clauses = [];

    for (const key of FILTERABLE.games) {
      if (req.query[key] !== undefined) {
        clauses.push(`${key} = ?`);
        params.push(req.query[key]);
      }
    }
    if (clauses.length) sql += " WHERE " + clauses.join(" AND ");

    const sort = req.query.sort || "";
    if (sort) {
      const desc = sort.startsWith("-");
      const field = desc ? sort.slice(1) : sort;
      if (SORTABLE.games.includes(field)) {
        sql += ` ORDER BY ${field} ${desc ? "DESC" : "ASC"}`;
      }
    }

    const rows = db.prepare(sql).all(...params);
    res.json(rows.map(gameToJson));
  } catch (err) {
    console.error("GET /api/games error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/games/:id
app.get("/api/games/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM games WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Game not found" });
    res.json(gameToJson(row));
  } catch (err) {
    console.error("GET /api/games/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/games
app.post("/api/games", (req, res) => {
  try {
    const body = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO games (id, date, opponent, location, status, our_score, opponent_score, opponent_players, created_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.date,
      body.opponent,
      body.location || null,
      body.status || "upcoming",
      body.our_score || 0,
      body.opponent_score || 0,
      body.opponent_players ? JSON.stringify(body.opponent_players) : null,
      now,
    );
    const created = db.prepare("SELECT * FROM games WHERE id = ?").get(id);
    res.status(201).json(gameToJson(created));
  } catch (err) {
    console.error("POST /api/games error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/games/:id
app.put("/api/games/:id", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM games WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Game not found" });

    const body = req.body;
    db.prepare(`
      UPDATE games SET date = ?, opponent = ?, location = ?, status = ?,
        our_score = ?, opponent_score = ?, opponent_players = ?
      WHERE id = ?
    `).run(
      body.date ?? existing.date,
      body.opponent ?? existing.opponent,
      body.location ?? existing.location,
      body.status ?? existing.status,
      body.our_score ?? existing.our_score,
      body.opponent_score ?? existing.opponent_score,
      body.opponent_players ? JSON.stringify(body.opponent_players) : existing.opponent_players,
      req.params.id,
    );
    const updated = db.prepare("SELECT * FROM games WHERE id = ?").get(req.params.id);
    res.json(gameToJson(updated));
  } catch (err) {
    console.error("PUT /api/games/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/games/:id
app.delete("/api/games/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM games WHERE id = ?").run(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error("DELETE /api/games/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PLAYERS
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/players
app.get("/api/players", (req, res) => {
  try {
    let sql = "SELECT * FROM players";
    const params = [];
    const clauses = [];

    for (const key of FILTERABLE.players) {
      if (req.query[key] !== undefined) {
        clauses.push(`${key} = ?`);
        params.push(req.query[key]);
      }
    }
    if (clauses.length) sql += " WHERE " + clauses.join(" AND ");

    const sort = req.query.sort || "";
    if (sort) {
      const desc = sort.startsWith("-");
      const field = desc ? sort.slice(1) : sort;
      if (SORTABLE.players.includes(field)) {
        sql += ` ORDER BY ${field} ${desc ? "DESC" : "ASC"}`;
      }
    }

    const rows = db.prepare(sql).all(...params);
    res.json(rows.map(playerToJson));
  } catch (err) {
    console.error("GET /api/players error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/players/:id
app.get("/api/players/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM players WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Player not found" });
    res.json(playerToJson(row));
  } catch (err) {
    console.error("GET /api/players/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/players
app.post("/api/players", (req, res) => {
  try {
    const body = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO players (id, name, number, classification, status, position, photo_url, created_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.name,
      String(body.number),
      body.classification ?? 1.0,
      body.status || "bench",
      body.position || null,
      body.photo_url || null,
      now,
    );
    const created = db.prepare("SELECT * FROM players WHERE id = ?").get(id);
    res.status(201).json(playerToJson(created));
  } catch (err) {
    console.error("POST /api/players error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/players/:id
app.put("/api/players/:id", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM players WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Player not found" });

    const body = req.body;
    db.prepare(`
      UPDATE players SET name = ?, number = ?, classification = ?, status = ?,
        position = ?, photo_url = ?
      WHERE id = ?
    `).run(
      body.name ?? existing.name,
      body.number != null ? String(body.number) : existing.number,
      body.classification ?? existing.classification,
      body.status ?? existing.status,
      body.position ?? existing.position,
      body.photo_url ?? existing.photo_url,
      req.params.id,
    );
    const updated = db.prepare("SELECT * FROM players WHERE id = ?").get(req.params.id);
    res.json(playerToJson(updated));
  } catch (err) {
    console.error("PUT /api/players/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/players/:id
app.delete("/api/players/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM players WHERE id = ?").run(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error("DELETE /api/players/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/events
app.get("/api/events", (req, res) => {
  try {
    let sql = "SELECT * FROM events";
    const params = [];
    const clauses = [];

    for (const key of FILTERABLE.events) {
      if (req.query[key] !== undefined) {
        clauses.push(`${key} = ?`);
        params.push(req.query[key]);
      }
    }
    if (clauses.length) sql += " WHERE " + clauses.join(" AND ");

    const sort = req.query.sort || "";
    if (sort) {
      const desc = sort.startsWith("-");
      const field = desc ? sort.slice(1) : sort;
      if (SORTABLE.events.includes(field)) {
        sql += ` ORDER BY ${field} ${desc ? "DESC" : "ASC"}`;
      }
    }

    if (req.query.limit) {
      const limit = parseInt(req.query.limit, 10);
      if (limit > 0) {
        sql += " LIMIT ?";
        params.push(limit);
      }
    }

    const rows = db.prepare(sql).all(...params);
    res.json(rows.map(eventToJson));
  } catch (err) {
    console.error("GET /api/events error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id
app.get("/api/events/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Event not found" });
    res.json(eventToJson(row));
  } catch (err) {
    console.error("GET /api/events/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events
app.post("/api/events", (req, res) => {
  try {
    const body = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO events (id, timestamp, player_id, game_id, action_type, points,
        lineup_on_court, shot_x, shot_y, shot_zone, is_opponent, created_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.timestamp || now,
      body.player_id,
      body.game_id,
      body.action_type,
      body.points || 0,
      body.lineup_on_court ? JSON.stringify(body.lineup_on_court) : null,
      body.shot_x ?? null,
      body.shot_y ?? null,
      body.shot_zone || null,
      body.is_opponent ? 1 : 0,
      now,
    );
    const created = db.prepare("SELECT * FROM events WHERE id = ?").get(id);
    res.status(201).json(eventToJson(created));
  } catch (err) {
    console.error("POST /api/events error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id
app.put("/api/events/:id", (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Event not found" });

    const body = req.body;
    db.prepare(`
      UPDATE events SET timestamp = ?, player_id = ?, game_id = ?, action_type = ?,
        points = ?, lineup_on_court = ?, shot_x = ?, shot_y = ?, shot_zone = ?, is_opponent = ?
      WHERE id = ?
    `).run(
      body.timestamp ?? existing.timestamp,
      body.player_id ?? existing.player_id,
      body.game_id ?? existing.game_id,
      body.action_type ?? existing.action_type,
      body.points ?? existing.points,
      body.lineup_on_court ? JSON.stringify(body.lineup_on_court) : existing.lineup_on_court,
      body.shot_x ?? existing.shot_x,
      body.shot_y ?? existing.shot_y,
      body.shot_zone ?? existing.shot_zone,
      body.is_opponent != null ? (body.is_opponent ? 1 : 0) : existing.is_opponent,
      req.params.id,
    );
    const updated = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
    res.json(eventToJson(updated));
  } catch (err) {
    console.error("PUT /api/events/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id
app.delete("/api/events/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM events WHERE id = ?").run(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error("DELETE /api/events/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Health check ──────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
