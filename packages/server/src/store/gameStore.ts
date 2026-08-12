import type { GameState } from "@sw/shared";

const games = new Map<string, GameState>();

export const gameStore = {
  save(state: GameState): void {
    games.set(state.id, state);
  },
  get(id: string): GameState | undefined {
    return games.get(id);
  },
  requireGet(id: string): GameState {
    const state = games.get(id);
    if (!state) throw new Error(`Game not found: ${id}`);
    return state;
  },
};
