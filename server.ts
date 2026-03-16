import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("zenflow.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    duration INTEGER,
    task_name TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS affirmations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    is_custom INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default affirmations if empty
const affirmationCount = db.prepare("SELECT COUNT(*) as count FROM affirmations").get() as { count: number };
if (affirmationCount.count === 0) {
  const defaultAffirmations = [
    "I am capable of achieving my goals.",
    "Every breath I take fills me with peace.",
    "I focus on what I can control and let go of the rest.",
    "My productivity is a reflection of my focus, not my speed.",
    "I am worthy of rest and rejuvenation.",
    "Today is a new opportunity to grow my garden."
  ];
  const insert = db.prepare("INSERT INTO affirmations (text) VALUES (?)");
  defaultAffirmations.forEach(text => insert.run(text));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(helmet());
  app.use(express.json());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // brough to you by the RFC 9457
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  });

  // Apply the rate limiting middleware to all requests.
  app.use(limiter);

  // API Routes
  app.get("/api/sessions", (req, res) => {
    const sessions = db.prepare("SELECT * FROM focus_sessions ORDER BY completed_at DESC LIMIT 50").all();
    res.json(sessions);
  });

  app.post("/api/sessions", (req, res) => {
    const { duration, task_name } = req.body;
    const result = db.prepare("INSERT INTO focus_sessions (duration, task_name) VALUES (?, ?)").run(duration, task_name);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/affirmations", (req, res) => {
    const affirmations = db.prepare("SELECT * FROM affirmations ORDER BY created_at DESC").all();
    res.json(affirmations);
  });

  app.post("/api/affirmations", (req, res) => {
    const { text, is_custom } = req.body;
    const result = db.prepare("INSERT INTO affirmations (text, is_custom) VALUES (?, ?)").run(text, is_custom ? 1 : 0);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/affirmations/:id", (req, res) => {
    db.prepare("DELETE FROM affirmations WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
