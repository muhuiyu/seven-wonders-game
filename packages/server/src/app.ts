import express from "express";
import cors from "cors";
import { gamesRouter } from "./routes/games.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", gamesRouter);
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  return app;
}
