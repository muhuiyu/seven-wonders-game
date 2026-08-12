import { Router } from "express";
import type { CreateGameRequest, CreateGameResponse, SubmitRoundRequest } from "@sw/shared";
import { createGame } from "../engine/setup.js";
import { resolveRound } from "../engine/resolveRound.js";
import { buildView } from "../engine/view.js";
import { gameStore } from "../store/gameStore.js";

export const gamesRouter = Router();

gamesRouter.post("/games", (req, res) => {
  const body = req.body as CreateGameRequest;
  if (!body.playerCount || body.playerCount < 3 || body.playerCount > 7) {
    res.status(400).json({ error: "playerCount must be between 3 and 7" });
    return;
  }
  try {
    const state = createGame({
      playerCount: body.playerCount,
      humanName: body.humanName?.trim() || "You",
      humanWonderId: body.humanWonderId,
      humanWonderSide: body.humanWonderSide,
      expansions: body.expansions,
    });
    gameStore.save(state);
    const response: CreateGameResponse = { gameId: state.id, humanPlayerId: "human" };
    res.json(response);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

gamesRouter.get("/games/:id", (req, res) => {
  const state = gameStore.get(req.params.id!);
  if (!state) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  res.json(buildView(state, "human"));
});

gamesRouter.post("/games/:id/round", (req, res) => {
  const state = gameStore.get(req.params.id!);
  if (!state) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  const body = req.body as SubmitRoundRequest;
  try {
    const next = resolveRound(state, body.action);
    gameStore.save(next);
    res.json(buildView(next, "human"));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
