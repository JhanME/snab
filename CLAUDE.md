# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Snab** is a multiplayer word search (sopa de letras) web game. Players create/join rooms, and compete in real-time to find hidden words in a grid. The app is bilingual-leaning-Spanish (UI messages and error strings are in Spanish).

## Commands

```bash
# Install all dependencies (root + server + client)
npm run install:all

# Run both server and client concurrently
npm run dev

# Run individually
npm run dev:server   # Express+Socket.IO on :3001 (tsx watch)
npm run dev:client   # Vite on :5173

# Client only
cd client
npm run build        # tsc -b && vite build
npm run lint         # eslint

# Server only
cd server
npm run build        # tsc → dist/
npm run start        # node dist/index.js
```

## Architecture

Monorepo with three package.json files: root (concurrently), `server/`, `client/`.

### Server (`server/src/`)

- **Runtime**: Express + Socket.IO, run via `tsx watch` in dev.
- **Database**: SQLite via `better-sqlite3` + Drizzle ORM. DB file at `server/data/snab.db`.
- **Auth**: JWT (`jsonwebtoken`) with bcrypt password hashing. Supports registered users and guest tokens. Token stored client-side in `localStorage`.
- **Key files**:
  - `index.ts` — Express app, HTTP server, Socket.IO setup with auth middleware.
  - `db/schema.ts` — Drizzle schema (users table).
  - `routes/auth.ts` — REST endpoints: `/api/auth/register`, `/login`, `/guest`, `/me`.
  - `middleware/auth.ts` — JWT sign/verify, Express auth middleware. `TokenPayload` type exported here.
  - `socket/game.ts` — All Socket.IO event handlers (room:create, room:join, game:start, game:select, etc.).
  - `games/word-search.ts` — Game logic: grid generation, word placement, room state (in-memory `Map<string, WordSearchState>`). Rooms hold up to 4 players.

### Client (`client/src/`)

- **Stack**: React 19, React Router v7, Tailwind CSS v4, Vite 8.
- **UI components**: shadcn/ui pattern in `components/ui/` (button, input, card, badge, separator). Uses `class-variance-authority`, `clsx`, `tailwind-merge`.
- **Path alias**: `@/` maps to `client/src/`.
- **Vite proxy**: `/api` and `/socket.io` are proxied to `localhost:3001`.
- **Key files**:
  - `App.tsx` — Routes: `/` (Home), `/login`, `/register`, `/lobby` (protected), `/game/:roomId` (protected), `/join/:roomId`.
  - `hooks/useAuth.tsx` — AuthContext with login/register/guest/logout. Checks `/auth/me` on mount.
  - `hooks/useSocket.ts` — SocketContext, creates Socket.IO connection with JWT auth.
  - `lib/api.ts` — `apiPost`/`apiGet` helpers with Bearer token.
  - `lib/socket.ts` — Singleton socket instance (used by some imports; `useSocket` hook creates its own).
  - `pages/` — Home, Login, Register, Lobby, Game, Join.

### Real-time Communication

Socket.IO events flow: client ↔ server. Key events:
- `room:create` / `room:join` — Room lifecycle (callback-based).
- `game:start` — Host-only, transitions room to "playing".
- `game:cursor` / `game:mouse` — Broadcast player cursor positions.
- `game:select` — Submit word selection (cells array); server validates and broadcasts `game:word-found`.
- `game:finished` — Emitted when all words found.
- `player:joined` / `player:left` — Player presence.

### Important Patterns

- Game state is entirely **in-memory** on the server (no DB persistence for rooms/games).
- Server uses `.js` extensions in imports (ESM-style with TypeScript + bundler resolution).
- CORS is hardcoded to `http://localhost:5173`.
