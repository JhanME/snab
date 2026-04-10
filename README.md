# Snab

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

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
