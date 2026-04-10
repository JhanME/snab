# Snab

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://ui.shadcn.com/"><img src="https://img.shields.io/badge/shadcn%2Fui-Components-000000?logo=shadcnui&logoColor=white" alt="shadcn/ui" /></a>
  <a href="https://reactrouter.com/"><img src="https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white" alt="React Router" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express" /></a>
  <a href="https://socket.io/"><img src="https://img.shields.io/badge/Socket.IO-4-010101?logo=socketdotio&logoColor=white" alt="Socket.IO" /></a>
  <a href="https://www.sqlite.org/"><img src="https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white" alt="SQLite" /></a>
  <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle&logoColor=black" alt="Drizzle ORM" /></a>
  <a href="https://jwt.io/"><img src="https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white" alt="JWT" /></a>
  <a href="https://eslint.org/"><img src="https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white" alt="ESLint" /></a>
  <a href="https://git-scm.com/"><img src="https://img.shields.io/badge/Git-Version_Control-F05032?logo=git&logoColor=white" alt="Git" /></a>
</p>

**Snab** es un juego web multijugador de sopa de letras en tiempo real. Los jugadores crean o se unen a salas y compiten por encontrar las palabras ocultas en la cuadrícula.

## Características

- Salas multijugador con hasta 4 jugadores
- Comunicación en tiempo real vía Socket.IO (cursores, selecciones, palabras encontradas)
- Autenticación con usuarios registrados y modo invitado (JWT + bcrypt)
- Generación dinámica de cuadrículas y colocación de palabras
- UI moderna con shadcn/ui y Tailwind CSS v4

## Stack

### Cliente
- React 19 + TypeScript
- Vite 8
- React Router v7
- Tailwind CSS v4
- shadcn/ui (Radix UI, CVA, clsx, tailwind-merge)
- Socket.IO Client

### Servidor
- Node.js + Express 4
- Socket.IO 4
- SQLite (better-sqlite3) + Drizzle ORM
- JWT (jsonwebtoken) + bcryptjs
- tsx (dev) / TypeScript

## Estructura del proyecto

```
web-cob/
├── client/          # Frontend (React + Vite)
│   └── src/
│       ├── components/ui/   # Componentes shadcn/ui
│       ├── hooks/           # useAuth, useSocket
│       ├── lib/             # api, socket
│       └── pages/           # Home, Login, Register, Lobby, Game, Join
├── server/          # Backend (Express + Socket.IO)
│   └── src/
│       ├── db/              # Drizzle schema
│       ├── routes/          # auth
│       ├── middleware/      # JWT auth
│       ├── socket/          # game handlers
│       └── games/           # word-search logic
└── package.json     # Scripts root con concurrently
```

## Instalación

```bash
# Instalar dependencias en root, server y client
npm run install:all
```

## Desarrollo

```bash
# Levantar servidor (:3001) y cliente (:5173) en paralelo
npm run dev

# O por separado
npm run dev:server
npm run dev:client
```

El cliente está disponible en `http://localhost:5173` y proxea `/api` y `/socket.io` hacia el servidor en `http://localhost:3001`.

## Build

```bash
# Cliente
cd client && npm run build

# Servidor
cd server && npm run build && npm run start
```

## Eventos de Socket.IO

| Evento | Descripción |
|--------|-------------|
| `room:create` / `room:join` | Ciclo de vida de la sala |
| `game:start` | Inicio de partida (solo host) |
| `game:cursor` / `game:mouse` | Posición del cursor de cada jugador |
| `game:select` | Envío de selección de palabra |
| `game:word-found` | Palabra encontrada (broadcast) |
| `game:finished` | Partida terminada |
| `player:joined` / `player:left` | Presencia de jugadores |
