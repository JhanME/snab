import { Server, Socket } from "socket.io";
import { TokenPayload } from "../middleware/auth.js";
import {
  rooms,
  createRoom,
  addPlayer,
  removePlayer,
  checkWord,
  serializeRoom,
} from "../games/word-search.js";

export function setupGameSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    const user: TokenPayload = socket.data.user;

    // Create room
    socket.on("room:create", (callback) => {
      const room = createRoom(user.username);
      const player = addPlayer(
        room,
        socket.id,
        String(user.id ?? socket.id),
        user.username,
        user.isGuest
      );

      socket.join(room.id);
      console.log(`[game] ${user.username} created room ${room.id}`);

      callback({
        roomId: room.id,
        room: serializeRoom(room),
        player,
      });
    });

    // Join room
    socket.on("room:join", (roomId: string, callback) => {
      const room = rooms.get(roomId);
      if (!room) {
        callback({ error: "Sala no encontrada" });
        return;
      }

      // Check if player is already in the room (e.g. host navigating from lobby)
      const existing = room.players.get(socket.id);
      if (existing) {
        socket.join(roomId);
        callback({
          room: serializeRoom(room),
          player: existing,
        });
        return;
      }

      // Max 4 players
      if (room.players.size >= 4) {
        callback({ error: "Sala llena (máx. 4 jugadores)" });
        return;
      }

      const player = addPlayer(
        room,
        socket.id,
        String(user.id ?? socket.id),
        user.username,
        user.isGuest
      );

      socket.join(roomId);
      console.log(`[game] ${user.username} joined room ${roomId}`);

      // Notify others
      socket.to(roomId).emit("player:joined", player);

      callback({
        room: serializeRoom(room),
        player,
      });
    });

    // Start game (host only)
    socket.on("game:start", (roomId: string) => {
      const room = rooms.get(roomId);
      if (!room) return;
      if (room.createdBy !== user.username) return;

      room.status = "playing";
      io.to(roomId).emit("game:started", serializeRoom(room));
      console.log(`[game] room ${roomId} started`);
    });

    // Mouse position (screen coords) for SVG cursor
    socket.on("game:mouse", (data: { roomId: string; x: number; y: number }) => {
      socket.to(data.roomId).emit("game:mouse", {
        socketId: socket.id,
        x: data.x,
        y: data.y,
      });
    });

    // Cursor move within game grid
    socket.on("game:cursor", (data: { roomId: string; row: number; col: number }) => {
      const room = rooms.get(data.roomId);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (player) {
        player.cursor = { row: data.row, col: data.col };
      }

      socket.to(data.roomId).emit("game:cursor:update", {
        socketId: socket.id,
        row: data.row,
        col: data.col,
      });
    });

    // Select word (cells array)
    socket.on(
      "game:select",
      (data: { roomId: string; cells: [number, number][] }, callback) => {
        const room = rooms.get(data.roomId);
        if (!room || room.status !== "playing") {
          callback?.({ error: "Juego no activo" });
          return;
        }

        const player = room.players.get(socket.id);
        if (!player) return;

        const word = checkWord(room, data.cells);
        if (!word) {
          callback?.({ found: false });
          return;
        }

        // Word found!
        const foundWord = {
          word,
          playerId: player.id,
          playerName: player.username,
          color: player.color,
          cells: data.cells,
        };

        room.foundWords.push(foundWord);
        player.score += 1;

        // Broadcast to all in room
        io.to(data.roomId).emit("game:word-found", {
          ...foundWord,
          scores: Array.from(room.players.values()).map((p) => ({
            username: p.username,
            score: p.score,
            color: p.color,
          })),
        });

        // Check if game is finished
        if (room.foundWords.length === room.words.length) {
          room.status = "finished";
          io.to(data.roomId).emit("game:finished", {
            scores: Array.from(room.players.values())
              .map((p) => ({ username: p.username, score: p.score, color: p.color }))
              .sort((a, b) => b.score - a.score),
          });
        }

        callback?.({ found: true, word });
      }
    );

    // Disconnect
    socket.on("disconnect", () => {
      // Remove from all rooms
      for (const [roomId, room] of rooms) {
        if (room.players.has(socket.id)) {
          removePlayer(room, socket.id);
          io.to(roomId).emit("player:left", {
            socketId: socket.id,
            players: Array.from(room.players.values()),
          });

          // Clean up empty rooms
          if (room.players.size === 0) {
            rooms.delete(roomId);
            console.log(`[game] room ${roomId} deleted (empty)`);
          }
        }
      }
    });
  });
}
