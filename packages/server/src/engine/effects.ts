import type { CardEffect, GameState } from "@sw/shared";
import { countByScope } from "./colorCounts.js";
import { bestScienceChoice, getScienceSymbolCounts } from "./science.js";
import { grantBankToSelfAndNeighbors, resolveOpponentsPayOrDebt, resolveOpponentsPayPerOwnMetric } from "./cities.js";

export interface PendingOpponentEffect {
  builderId: string;
  effect: Extract<CardEffect, { kind: "opponentsPayOrDebt" | "opponentsPayPerOwnMetric" }>;
}

/**
 * Applies the immediate (build-time) portion of a card/wonder-stage's effects: coins gained,
 * science-choice resolution. Passive effects (resource, shields, science, vp, tradeDiscount,
 * freeBuildPerAge) don't mutate state here — they're derived on demand from builtCardIds /
 * wonderStagesBuilt wherever they're needed (payment, military, scoring, bot heuristics).
 * End-game-only effects (vpPerCard, vpPerWonderStage, vpPerDefeatToken, vpPerColorSet, the VP
 * half of vpAndCoinsPerCard) are resolved later in scoring.ts from final board state.
 *
 * Cities' opponentsPayOrDebt/opponentsPayPerOwnMetric effects are pushed onto `deferred`
 * instead of resolved here when a queue is supplied: the physical rule resolves coin-loss
 * effects only after every player's build/payment for the turn, so a round with several
 * simultaneous builds must not let an earlier build's coin loss retroactively invalidate a
 * later (already-decided) player's own build this same round. Callers evaluating a single
 * clone in isolation (bot scoring) can omit `deferred` to resolve immediately.
 *
 * Returns true if this build granted an immediate extra build action this round.
 */
export function applyImmediateEffects(state: GameState, playerId: string, effects: CardEffect[], deferred?: PendingOpponentEffect[]): boolean {
  const player = state.players[playerId]!;
  let extraTurnGranted = false;

  for (const effect of effects) {
    switch (effect.kind) {
      case "coins":
        player.coins += effect.amount;
        break;
      case "coinsPerCard": {
        const count = countByScope(state, playerId, effect.color, effect.scope);
        player.coins += count * effect.perCard;
        break;
      }
      case "vpAndCoinsPerCard": {
        const count = countByScope(state, playerId, effect.color, effect.scope);
        player.coins += count * effect.coinsPer;
        break;
      }
      case "scienceChoice": {
        const counts = getScienceSymbolCounts(player);
        player.chosenScienceSymbols.push(bestScienceChoice(counts));
        break;
      }
      case "extraTurn":
        extraTurnGranted = true;
        break;
      case "diplomacyToken":
        player.diplomacyTokens += 1;
        break;
      case "opponentsPayOrDebt":
      case "opponentsPayPerOwnMetric":
        if (deferred) deferred.push({ builderId: playerId, effect });
        else if (effect.kind === "opponentsPayOrDebt") resolveOpponentsPayOrDebt(state, playerId, effect.amount);
        else resolveOpponentsPayPerOwnMetric(state, playerId, effect.metric, effect.perUnit);
        break;
      case "bankGrantSelfAndNeighbors":
        grantBankToSelfAndNeighbors(state, playerId, effect.self, effect.neighbors);
        break;
      case "coinsPerMilitaryToken": {
        const count = player.militaryTokens.filter((t) => t.result === effect.result).length;
        player.coins += count * effect.amount;
        break;
      }
      default:
        break;
    }
  }

  return extraTurnGranted;
}

/** Resolves every deferred Cities coin-loss effect, once every player's build for the round is settled. */
export function resolveDeferredOpponentEffects(state: GameState, deferred: PendingOpponentEffect[]): void {
  for (const { builderId, effect } of deferred) {
    if (effect.kind === "opponentsPayOrDebt") resolveOpponentsPayOrDebt(state, builderId, effect.amount);
    else resolveOpponentsPayPerOwnMetric(state, builderId, effect.metric, effect.perUnit);
  }
}
