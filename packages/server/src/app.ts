import path from "node:path";
import express from "express";
import cors from "cors";
import { gamesRouter } from "./routes/games.js";

const clientDist = path.join(import.meta.dir, "../../client/dist");

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", gamesRouter);
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use(express.static(clientDist));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });

  return app;
}
