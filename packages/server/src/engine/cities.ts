import type { GameState } from "@sw/shared";
import { getNeighbors } from "./seating.js";

/**
 * Cities expansion: a coin loss imposed on `affectedId`. Physically the affected player
 * chooses pay-vs-Debt (even voluntarily when affordable); this engine auto-resolves with
 * a pay-if-affordable-else-Debt policy since round resolution applies every player's
 * action synchronously and can't pause for another player's build-triggered decision
 * (see plan notes). Debt is tracked as `debtVp` — a straight VP penalty, since the
 * physical 1-VP/5-VP token denominations only matter for token-supply bookkeeping we
 * don't model.
 */
export function resolvePayOrDebt(state: GameState, affectedId: string, amount: number): void {
  if (amount <= 0) return;
  const player = state.players[affectedId]!;
  if (player.coins >= amount) {
    player.coins -= amount;
    state.log.push({ round: state.round, age: state.age, message: `${player.name} pays ${amount} coins.` });
    return;
  }
  const unpaid = amount - player.coins;
  player.coins = 0;
  player.debtVp -= unpaid;
  state.log.push({ round: state.round, age: state.age, message: `${player.name} can't pay and takes ${unpaid} Debt (-${unpaid} VP).` });
}

export function resolveOpponentsPayOrDebt(state: GameState, builderId: string, amount: number): void {
  for (const playerId of state.seats) {
    if (playerId !== builderId) resolvePayOrDebt(state, playerId, amount);
  }
}

function ownMetricCount(state: GameState, playerId: string, metric: "militaryVictoryTokens" | "wonderStagesBuilt"): number {
  const player = state.players[playerId]!;
  if (metric === "wonderStagesBuilt") return player.wonderStagesBuilt;
  return player.militaryTokens.filter((t) => t.result === "win").length;
}

/** Builders' Union / Cenotaph / Sepulcher style: each other player pays perUnit x their OWN metric count. */
export function resolveOpponentsPayPerOwnMetric(state: GameState, builderId: string, metric: "militaryVictoryTokens" | "wonderStagesBuilt", perUnit: number): void {
  for (const playerId of state.seats) {
    if (playerId === builderId) continue;
    resolvePayOrDebt(state, playerId, ownMetricCount(state, playerId, metric) * perUnit);
  }
}

/** Gambling Den/House style: the builder and both neighbors each draw coins from the bank. */
export function grantBankToSelfAndNeighbors(state: GameState, playerId: string, self: number, neighbors: number): void {
  const player = state.players[playerId]!;
  player.coins += self;
  const { left, right } = getNeighbors(state, playerId);
  left.coins += neighbors;
  right.coins += neighbors;
}
