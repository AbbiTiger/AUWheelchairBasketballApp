# COURTSIDE — AU Wheelchair Basketball Stats App

Real-time stat tracking and analytics platform for Auburn University's wheelchair basketball program. Built for courtside use by coaches during live games.

## Features

- **Live Game Tracking** — Tap the court to record shots (with x/y coordinates and zone), log assists, rebounds, steals, turnovers, blocks, fouls, and free throws in real time
- **Shot Chart** — Visual court map showing made/missed shots by zone for both teams
- **Lineup Management** — Track 5-on-court with classification sum enforcement (14.0 max per IWBF rules), handle substitutions
- **Opponent Tracking** — Record opponent shot attempts and scores
- **Box Score** — Per-game stat breakdown for all players
- **Season Averages** — Aggregated stats across all completed games
- **Player Profiles** — Individual career stats, shooting charts, and recruiting export
- **PDF Export** — Generate printable game reports with shot charts and box scores
- **Dashboard** — KPI cards and shooting trend charts for post-game analysis

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 6, Tailwind CSS 3, shadcn/ui (Radix) |
| Data Fetching | TanStack React Query v5 |
| Charts | Recharts |
| PDF | jsPDF + html2canvas |
| API | Express.js (Node 20) |
| Database | SQLite via better-sqlite3 (WAL mode) |
| Deployment | Docker Compose (Nginx + Express) |

## Project Structure

```
├── src/                    # React frontend
│   ├── api/apiClient.js    # API client (fetch wrapper)
│   ├── pages/              # Route pages
│   │   ├── LiveGame.jsx    # Core stat-tracking interface
│   │   ├── Dashboard.jsx   # Post-game analytics
│   │   ├── Games.jsx       # Schedule management
│   │   ├── GameDetail.jsx  # Single-game deep dive
│   │   ├── BoxScore.jsx    # Per-game box score
│   │   ├── Players.jsx     # Roster CRUD
│   │   ├── PlayerDetail.jsx # Player career stats
│   │   ├── SeasonAverages.jsx # Season-wide stats
│   │   └── RecruitingProfile.jsx # Shareable player card
│   ├── components/
│   │   ├── court/          # CourtMap, ShotResultModal, OpponentShotModal
│   │   ├── live/           # ActivePlayerSelector, QuickStatBar, LineupManager, etc.
│   │   ├── dashboard/      # KPICard, ShootingChart
│   │   ├── stats/          # StatsTable
│   │   ├── layout/         # AppLayout (sidebar)
│   │   └── ui/             # shadcn/ui primitives
│   └── lib/                # Utilities, auth context, stat calculations
├── api/                    # Express API server
│   └── src/functions/
│       ├── index.js        # All REST endpoints
│       └── db.js           # SQLite schema & connection
├── data/                   # SQLite database file (auto-created)
├── scripts/seed.js         # Test data seeder
├── docker-compose.yml      # Dev Docker setup
├── docker-compose.prod.yml # Production Docker setup
└── entities/               # JSON schema reference (Player, Game, Event)
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm 9+

### 1. Install dependencies

```bash
# Frontend
npm install

# API
cd api && npm install && cd ..
```

### 2. Start the API server

```bash
cd api && npm start
```

The API will start on `http://localhost:7071`. The SQLite database (`data/apex.db`) is created automatically on first run.

### 3. Start the frontend dev server

In a separate terminal:

```bash
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api/*` requests to the Express API.

### 4. Seed test data

With the API running:

```bash
node scripts/seed.js
```

This creates 7 players, 5 games (3 completed with events, 2 upcoming), and ~126 stat events.

## Docker

```bash
# Development
docker compose up --build

# Production
docker compose -f docker-compose.prod.yml up -d
```

The app is served on port 80 via Nginx, which reverse-proxies `/api/*` to the Express container on port 7071. The SQLite database is persisted in a Docker volume.

## API Endpoints

All endpoints are under `/api/`. The API uses Express.js with SQLite (better-sqlite3, WAL mode).

### Games

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/games` | List all games. Query: `?sort=-date`, `?status=live` |
| GET | `/api/games/:id` | Get single game |
| POST | `/api/games` | Create game |
| PUT | `/api/games/:id` | Update game (merge) |
| DELETE | `/api/games/:id` | Delete game (cascades events) |

### Players

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/players` | List all players. Query: `?sort=name`, `?status=active` |
| GET | `/api/players/:id` | Get single player |
| POST | `/api/players` | Create player |
| PUT | `/api/players/:id` | Update player |
| DELETE | `/api/players/:id` | Delete player |

### Events

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/events` | List events. Query: `?game_id=x`, `?player_id=x`, `?sort=-timestamp`, `?limit=100` |
| GET | `/api/events/:id` | Get single event |
| POST | `/api/events` | Create event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |

## Data Model

### Player
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Auto-generated |
| `name` | string | Full name |
| `number` | string | Jersey number |
| `classification` | float | IWBF wheelchair classification (1.0–4.5) |
| `status` | `"active"` / `"bench"` | Current roster status |
| `position` | string | Guard, Forward, Center |
| `photo_url` | string | Optional player photo |

### Game
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Auto-generated |
| `date` | `YYYY-MM-DD` | Game date |
| `opponent` | string | Opponent name |
| `location` | string | Venue |
| `status` | `"upcoming"` / `"live"` / `"completed"` | Game state |
| `our_score` | integer | Auburn's score |
| `opponent_score` | integer | Opponent's score |
| `opponent_players` | JSON array | Tracked opponent players `[{id, name, number}]` |

### Event (stat entry)
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Auto-generated |
| `timestamp` | ISO datetime | When it occurred |
| `player_id` | UUID | FK → Player (or `"opponent"`) |
| `game_id` | UUID | FK → Game |
| `action_type` | enum | See below |
| `points` | integer | Points scored (0 for non-scoring events) |
| `lineup_on_court` | JSON array | 5 player IDs on court at time of event |
| `shot_x` | float | 0–100 x-coordinate on court SVG |
| `shot_y` | float | 0–100 y-coordinate on court SVG |
| `shot_zone` | enum | `paint`, `mid_center`, `wing_left`, `wing_right`, `three_center`, `three_left`, `three_right` |
| `is_opponent` | boolean | Whether this is an opponent event |

**Action types:** `made_2pt`, `missed_2pt`, `made_3pt`, `missed_3pt`, `ft_made`, `ft_missed`, `orb`, `drb`, `ast`, `stl`, `to`, `foul`, `bs`, `tech`, `opp_made_2pt`, `opp_missed_2pt`, `opp_made_3pt`, `opp_missed_3pt`

## Known Issues & Future Work

### Current Limitations

1. **No authentication** — `AuthContext` is a stub that always returns `{name: "Coach"}`. All API endpoints are open.
2. **Player status is global** — Active/bench status is per-player, not per-game. Substituting during Game A changes the player globally.
3. **No input validation on the API** — POST/PUT endpoints accept any JSON. Schema validation should be added at the API boundary.
4. **`SeasonAverages` uses full page reload** for navigation (`window.location.href`) instead of React Router's `navigate()`.
5. **`GameDetail` and `PlayerDetail` use `window.location.search`** — should use React Router `useParams()` for proper SPA routing.
6. **Unused dependencies** — Stripe, Three.js, react-leaflet, react-quill, canvas-confetti are in `package.json` but not used. They should be removed to reduce bundle size.

### Architecture Decisions

- **SQLite was chosen** over Cosmos DB to eliminate Azure dependency, reduce cost, and simplify deployment. For a single-team stat tracking app, SQLite with WAL mode handles the concurrency requirements well.
- **Proper relational schema** with indexed columns replaces the previous JSON-blob-in-SQLite approach, enabling efficient queries by `game_id`, `player_id`, and `action_type` without full table scans.
- **Express.js** replaces Azure Functions runtime. No cloud vendor lock-in — deploy anywhere that runs Node.js.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build |
| `cd api && npm start` | Start Express API (port 7071) |
| `cd api && npm run dev` | Start API with `--watch` for auto-reload |
| `node scripts/seed.js` | Seed test data (API must be running) |
