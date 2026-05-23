# RetroWave

A social music streaming thing I built. It's a retro-futuristic platform where you can listen to mixtapes, vibe out to a live radio feed, and hang out in listening rooms with other people. Think late-night college radio meets cassette culture meets the internet.

The audio is real — all tracks come from [Internet Archive's royalty-free music collection](https://archive.org/details/royalty-free-music) (706+ MP3s, CC0-licensed). No fake demo tracks, no placeholders.

## What it does

- Browse and play curated mixtapes filtered by mood or decade
- A "live radio" page that picks a random mixtape and plays it
- Mixtape detail pages with tracklists, comments, and likes
- Collaborative listening rooms with WebSocket sync (WIP)
- No auth — anonymous users with localStorage IDs

## Stack

| piece | what |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Framer Motion |
| **Backend** | Fastify 5, Prisma ORM |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 (room state, sessions) |
| **Audio** | HTML `<audio>` element, Internet Archive CDN |
| **Runtime** | Node.js 22, Docker Compose (prod) |

## Project structure

```
.
├── frontend/              # Next.js app (port 3000)
│   ├── src/
│   │   ├── app/           # Pages (homepage, radio, mixtapes, rooms)
│   │   ├── components/    # React components (cassette, nav, ui)
│   │   ├── hooks/         # useAudio, useTapeHiss
│   │   ├── lib/           # Utilities
│   │   └── types/         # TypeScript types
│   └── Dockerfile
├── backend/               # Fastify API (port 3001)
│   ├── src/
│   │   ├── routes/        # mixtapes, comments, likes, rooms, deezer
│   │   ├── seed.ts        # Seeds database with IA tracks
│   │   ├── ws.ts          # WebSocket handler
│   │   └── redis.ts       # Redis client
│   ├── prisma/            # Schema + migrations
│   └── Dockerfile
├── docker-compose.yml     # Prod: db, redis, backend, frontend, nginx
├── nginx.conf             # Reverse proxy config
├── db/schema.sql          # Init SQL for postgres container
└── Makefile               # dev / prod / setup / seed targets
```

## Getting started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL and Redis in both dev and prod)
- Node.js 22
- npm
- That's it — no API keys, no accounts, no paid services

### First-time setup

```bash
npm run setup
```

This starts the database containers, pushes the Prisma schema, and seeds the database with 5 mixtapes (40 tracks total) from Internet Archive.

### Development

```bash
npm run dev
```

Starts everything — PostgreSQL, Redis, the Fastify backend on port 3001, and the Next.js dev server on port 3000. The Next.js dev server automatically proxies `/api/*` requests to the backend. Open http://localhost:3015.

If you want finer control:

```bash
npm run dev:backend   # Just the backend (needs db already running)
npm run dev:frontend  # Just the frontend
```

### Re-seeding

```bash
npm run seed
```

Pulls a fresh track listing from Internet Archive and rebuilds the mixtapes. Useful if you want different tracks or accidentally mangled the data.

## Production

```bash
make prod
```

Builds and starts everything with Docker Compose. The nginx container on port 80 acts as the entry point — it proxies static assets and pages to the Next.js server, and API/WebSocket traffic to the Fastify backend. You can swap in your own nginx by removing the nginx service from docker-compose.yml and pointing your config at `localhost:3015`.

### If you want to use your own nginx

Remove the `nginx` service from `docker-compose.yml`, create a config like this in `/etc/nginx/sites-available/`:

```nginx
server {
    listen 80;
    server_name your.domain;

    location / {
        proxy_pass http://127.0.0.1:3015;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://127.0.0.1:3015;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

The frontend proxies `/api/*` internally, so you just forward everything to port 3015.

## How audio works

The seed script fetches `https://archive.org/metadata/royalty-free-music` to get the full track listing, then picks 8 tracks per mixtape. Audio URLs are direct MP3 links like `https://archive.org/download/royalty-free-music/Abstract%20Atmospheric.mp3`. They return a 302 redirect to the IA CDN, which the browser follows automatically.

The `useAudio` hook in `frontend/src/hooks/useAudio.ts` creates a single `<Audio>` element on mount and swaps its `src` when the track changes — no destroy/recreate cycle, so no canceled requests.

## API

Base path: `/api` (proxied through Next.js in dev, through nginx in prod)

| Method | Path | Description |
|---|---|---|
| GET | `/api/mixtapes?mood=&decade=` | List mixtapes (optional mood/decade filters) |
| GET | `/api/mixtapes/:id` | Get mixtape with tracks |
| POST | `/api/mixtapes/:id/likes` | Like a mixtape (body: `{ userId }`) |
| GET | `/api/mixtapes/:id/comments` | Get comments for a mixtape |
| POST | `/api/mixtapes/:id/comments` | Add a comment (body: `{ content, authorId }`) |
| GET | `/api/deezer/search?q=` | Deezer track search (for future use — API returns empty data atm) |
| WS | `/ws` | WebSocket for listening rooms |

## Things that are rough

- No authentication — user IDs are random strings in localStorage. You lose your likes/comments when you clear it.
- The Deezer search route exists but always returns empty results. The public Deezer API seems restricted. Haven't bothered to fix it since the Internet Archive source works for playback.
- The hero cassette on the homepage uses fake tracks (no audio) — it's a visual demo. Click a real mixtape or go to the radio page for actual music.
- Room sync via WebSocket works but is barebones. Don't expect a polished party mode yet.
- Mobile responsiveness is there but there are probably edge cases I missed.

## Env variables

Copy `.env.example` to `.env`:

```
DATABASE_URL=postgresql://retrowave:retrowave_pass@localhost:5432/retrowave
REDIS_URL=redis://localhost:6379
PORT=3001
```

The defaults work with the Docker Compose setup. You shouldn't need to change them unless you're running Postgres/Redis outside Docker.
