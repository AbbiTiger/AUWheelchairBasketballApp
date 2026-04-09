const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../../data/apex.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Schema ────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    number          TEXT NOT NULL,
    classification  REAL NOT NULL DEFAULT 1.0,
    status          TEXT NOT NULL DEFAULT 'bench',
    position        TEXT,
    photo_url       TEXT,
    created_date    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS games (
    id              TEXT PRIMARY KEY,
    date            TEXT NOT NULL,
    opponent        TEXT NOT NULL,
    location        TEXT,
    status          TEXT NOT NULL DEFAULT 'upcoming',
    our_score       INTEGER NOT NULL DEFAULT 0,
    opponent_score  INTEGER NOT NULL DEFAULT 0,
    opponent_players TEXT,
    created_date    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id              TEXT PRIMARY KEY,
    timestamp       TEXT NOT NULL,
    player_id       TEXT NOT NULL,
    game_id         TEXT NOT NULL,
    action_type     TEXT NOT NULL,
    points          INTEGER NOT NULL DEFAULT 0,
    lineup_on_court TEXT,
    shot_x          REAL,
    shot_y          REAL,
    shot_zone       TEXT,
    is_opponent     INTEGER NOT NULL DEFAULT 0,
    created_date    TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_events_game_id    ON events(game_id);
  CREATE INDEX IF NOT EXISTS idx_events_player_id  ON events(player_id);
  CREATE INDEX IF NOT EXISTS idx_events_action     ON events(action_type);
  CREATE INDEX IF NOT EXISTS idx_games_status       ON games(status);
  CREATE INDEX IF NOT EXISTS idx_games_date         ON games(date);
`);

module.exports = db;
