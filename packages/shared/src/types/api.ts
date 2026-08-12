import type { RoundAction } from "./gameState.js";

export interface CreateGameRequest {
  playerCount: number; // 3-7
  humanName: string;
  humanWonderId?: string; // if omitted, random
  humanWonderSide?: "A" | "B"; // if omitted, random
  expansions?: { leaders?: boolean; cities?: boolean };
}

export interface CreateGameResponse {
  gameId: string;
  humanPlayerId: string;
}

export interface SubmitRoundRequest {
  action: RoundAction;
}
