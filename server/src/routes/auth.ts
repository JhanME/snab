import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { signToken, authMiddleware } from "../middleware/auth.js";

const router = Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: "Todos los campos son requeridos" });
      return;
    }

    const existing = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existing) {
      res.status(409).json({ error: "El email ya está registrado" });
      return;
    }

    const hash = await bcrypt.hash(password, 10);

    const result = db
      .insert(users)
      .values({ username, email, password: hash })
      .returning()
      .get();

    const token = signToken({
      id: result.id,
      username: result.username,
      isGuest: false,
    });

    res.json({ token, user: { id: result.id, username: result.username } });
  } catch (err: any) {
    if (err.message?.includes("UNIQUE")) {
      res.status(409).json({ error: "Username o email ya existe" });
      return;
    }
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email y contraseña requeridos" });
    return;
  }

  const user = db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!user) {
    res.status(401).json({ error: "Credenciales incorrectas" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Credenciales incorrectas" });
    return;
  }

  const token = signToken({
    id: user.id,
    username: user.username,
    isGuest: false,
  });

  res.json({ token, user: { id: user.id, username: user.username } });
});

// Guest token
router.post("/guest", (req, res) => {
  const { nickname } = req.body;

  if (!nickname) {
    res.status(400).json({ error: "Nickname requerido" });
    return;
  }

  const token = signToken({
    id: null,
    username: nickname,
    isGuest: true,
  });

  res.json({ token, user: { id: null, username: nickname, isGuest: true } });
});

// Get current user
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: (req as any).user });
});

export default router;
