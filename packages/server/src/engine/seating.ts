import type { GameState, PlayerState } from "@sw/shared";

/** seats[] is clockwise order. Left neighbor = previous seat, right neighbor = next seat. */
export function getNeighborIds(state: GameState, playerId: string): { leftId: string; rightId: string } {
  const idx = state.seats.indexOf(playerId);
  const n = state.seats.length;
  const leftId = state.seats[(idx - 1 + n) % n]!;
  const rightId = state.seats[(idx + 1) % n]!;
  return { leftId, rightId };
}

export function getNeighbors(state: GameState, playerId: string): { left: PlayerState; right: PlayerState } {
  const { leftId, rightId } = getNeighborIds(state, playerId);
  return { left: state.players[leftId]!, right: state.players[rightId]! };
}
