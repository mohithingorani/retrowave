# RetroWave

A retro-futuristic social music streaming platform — inspired by late-night radio, cassette culture, and analog warmth.

Real music, real streaming — powered by [Internet Archive's royalty-free music collection](https://archive.org/details/royalty-free-music).

## Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Framer Motion
- **Backend**: Fastify 5, Prisma, PostgreSQL, Redis
- **Audio**: Internet Archive royalty-free MP3s (706+ tracks, CC0-licensed)

## Quick Start

```bash
# 1. Start Docker Desktop (required for PostgreSQL + Redis)
# 2. First-time setup (creates database + seeds with music)
npm run setup

# 3. Start development servers
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development Commands

| Command | What it does |
|---|---|
| `npm run setup` | Start DB containers, push schema, seed 5 mixtapes with 40 real tracks |
| `npm run dev` | Start DB + backend + frontend |
| `npm run dev:backend` | Start backend only (port 3001) |
| `npm run dev:frontend` | Start frontend only (port 3000) |
| `npm run seed` | Re-seed database with fresh tracks from Internet Archive |
| `npm run build` | Build frontend for production |
| `make prod` | Full Docker Compose production build |
| `make stop` | Stop all Docker containers |
| `make db-shell` | Open PostgreSQL console |

## Architecture

```
localhost:3000   ← Next.js (frontend) with API proxy to...
localhost:3001   ← Fastify (backend) with...
localhost:5432   ← PostgreSQL (database)
localhost:6379   ← Redis (caching, room state)
```

The Next.js dev server proxies `/api/*` requests to the backend automatically.

## Data

The seed script fetches the track listing from Internet Archive's royalty-free music collection and creates 5 curated mixtapes. All 40 tracks have real, streamable MP3 URLs. The audio plays directly in your browser via the HTML `<audio>` element.

### API Routes

- `GET /api/mixtapes` — List mixtapes (filterable by `?mood=` and `?decade=`)
- `GET /api/mixtapes/:id` — Mixtape detail with tracks
- `POST /api/mixtapes/:id/likes` — Like a mixtape
- `GET /api/mixtapes/:id/comments` — Get comments
- `POST /api/mixtapes/:id/comments` — Add a comment
- `GET /api/deezer/search?q=...` — Search tracks via Deezer (for future mixtape creation)
- `/ws` — WebSocket for listening rooms
