import { getCard, type CardColor, type GameState, type MilitaryResult, type PlayerScope, type PlayerState } from "@sw/shared";
import { getNeighbors } from "./seating.js";

export function countCardsOfColor(player: PlayerState, color: CardColor): number {
  return player.builtCardIds.filter((id) => getCard(id).color === color).length;
}

export function countByScope(state: GameState, playerId: string, color: CardColor, scope: PlayerScope): number {
  const self = state.players[playerId]!;
  if (scope === "self") return countCardsOfColor(self, color);
  const { left, right } = getNeighbors(state, playerId);
  if (scope === "leftNeighbor") return countCardsOfColor(left, color);
  if (scope === "rightNeighbor") return countCardsOfColor(right, color);
  return countCardsOfColor(left, color) + countCardsOfColor(right, color); // bothNeighbors
}

export function countDefeatTokensByScope(state: GameState, playerId: string, scope: PlayerScope): number {
  const count = (p: PlayerState) => p.militaryTokens.filter((t) => t.result === "lose").length;
  const self = state.players[playerId]!;
  if (scope === "self") return count(self);
  const { left, right } = getNeighbors(state, playerId);
  if (scope === "leftNeighbor") return count(left);
  if (scope === "rightNeighbor") return count(right);
  return count(left) + count(right);
}

export function countWonderStagesByScope(state: GameState, playerId: string, scope: PlayerScope): number {
  const self = state.players[playerId]!;
  if (scope === "self") return self.wonderStagesBuilt;
  const { left, right } = getNeighbors(state, playerId);
  if (scope === "leftNeighbor") return left.wonderStagesBuilt;
  if (scope === "rightNeighbor") return right.wonderStagesBuilt;
  return left.wonderStagesBuilt + right.wonderStagesBuilt;
}

export function countMilitaryTokensByScope(state: GameState, playerId: string, result: MilitaryResult, scope: PlayerScope): number {
  const count = (p: PlayerState) => p.militaryTokens.filter((t) => t.result === result).length;
  const self = state.players[playerId]!;
  if (scope === "self") return count(self);
  const { left, right } = getNeighbors(state, playerId);
  if (scope === "leftNeighbor") return count(left);
  if (scope === "rightNeighbor") return count(right);
  return count(left) + count(right);
}

export function countRecruitedLeadersByScope(state: GameState, playerId: string, scope: PlayerScope): number {
  const self = state.players[playerId]!;
  if (scope === "self") return self.recruitedLeaderIds.length;
  const { left, right } = getNeighbors(state, playerId);
  if (scope === "leftNeighbor") return left.recruitedLeaderIds.length;
  if (scope === "rightNeighbor") return right.recruitedLeaderIds.length;
  return left.recruitedLeaderIds.length + right.recruitedLeaderIds.length;
}
