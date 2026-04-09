import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import { verifyToken } from "./middleware/auth.js";
import { setupGameSocket } from "./socket/game.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", authRoutes);

// Socket.IO auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Token requerido"));
  }
  try {
    const user = verifyToken(token);
    socket.data.user = user;
    next();
  } catch {
    next(new Error("Token inválido"));
  }
});

// Setup game socket handlers
setupGameSocket(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`[server] running on http://localhost:${PORT}`);
});
