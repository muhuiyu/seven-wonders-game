import { getCard, getWonderSide, type CardColor, type GameState, type RoundAction } from "@sw/shared";
import { canBuildCard, canBuildWonderStage } from "./actionResolution.js";
import { applyImmediateEffects, type PendingOpponentEffect } from "./effects.js";
import { getNeighbors } from "./seating.js";
import { isFreeViaChain } from "./chaining.js";
import { getActiveEffectSources } from "./effectSources.js";
import { estimatePlayerValue } from "./scoring.js";

function removeFromHand(hand: string[], cardId: string): void {
  const idx = hand.indexOf(cardId);
  if (idx === -1) throw new Error(`Card ${cardId} not in hand`);
  hand.splice(idx, 1);
}

export function payAndCredit(state: GameState, playerId: string, totalCoinCost: number, purchases: { from: "left" | "right" | "bank"; unitCost: number }[]): void {
  const player = state.players[playerId]!;
  player.coins -= totalCoinCost;
  if (purchases.length === 0) return;
  const { left, right } = getNeighbors(state, playerId);
  for (const purchase of purchases) {
    if (purchase.from === "bank") continue; // Bilkis-style bank purchases don't credit anyone
    (purchase.from === "left" ? left : right).coins += purchase.unitCost;
  }
}

/** Hatshepsut (neighborPurchaseRebate) and Clandestine Dock (tradeRebate): refund coins once per distinct neighbor side traded with this turn. */
function applyNeighborPurchaseRebate(state: GameState, playerId: string, purchases: { from: "left" | "right" | "bank"; unitCost: number }[]): void {
  const player = state.players[playerId]!;
  const sides = new Set(purchases.map((p) => p.from).filter((s): s is "left" | "right" => s === "left" || s === "right"));
  if (sides.size === 0) return;

  for (const effect of getActiveEffectSources(player)) {
    if (effect.kind === "neighborPurchaseRebate") {
      player.coins += sides.size * effect.amount;
    } else if (effect.kind === "tradeRebate" && sides.has(effect.side)) {
      player.coins += effect.amount;
    }
  }
}

/** Vitruvius: credited whenever this player builds a card for free via chaining. */
function applyCoinsOnChainBuild(state: GameState, playerId: string): void {
  const player = state.players[playerId]!;
  for (const effect of getActiveEffectSources(player)) {
    if (effect.kind === "coinsOnChainBuild") player.coins += effect.amount;
  }
}

/** Xenophon: credited whenever this player builds a card of a matching color. */
function applyCoinsOnColorBuild(state: GameState, playerId: string, color: CardColor): void {
  const player = state.players[playerId]!;
  for (const effect of getActiveEffectSources(player)) {
    if (effect.kind === "coinsOnColorBuild" && effect.color === color) player.coins += effect.amount;
  }
}

/** Simulates building each eligible discard-pile card and returns the id that scores highest, for a bot's auto-pick. */
function pickBestDiscardCard(state: GameState, playerId: string): string | null {
  const player = state.players[playerId]!;
  let bestId: string | null = null;
  let bestScore = -Infinity;

  for (const cardId of new Set(state.discardPile)) {
    if (player.builtCardIds.includes(cardId)) continue;
    const clone = structuredClone(state);
    const clonedPlayer = clone.players[playerId]!;
    const idx = clone.discardPile.indexOf(cardId);
    if (idx === -1) continue;
    clone.discardPile.splice(idx, 1);
    clonedPlayer.builtCardIds.push(cardId);
    try {
      applyImmediateEffects(clone, playerId, getCard(cardId).effects);
    } catch {
      continue;
    }
    const score = estimatePlayerValue(clone, playerId);
    if (score > bestScore) {
      bestScore = score;
      bestId = cardId;
    }
  }
  return bestId;
}

/**
 * Resolves a one-time "build a free card from the discard pile" trigger (Solomon's recruit
 * effect, Halikarnassos' wonder-stage ability). Bots auto-pick the highest-value eligible
 * card since they have no UI; humans must supply a validated `discardPickId` since this is
 * meant to be the player's own choice.
 */
export function resolveDiscardPileBuild(state: GameState, playerId: string, discardPickId: string | undefined, sourceLabel: string): void {
  const player = state.players[playerId]!;
  const eligible = new Set(state.discardPile.filter((id) => !player.builtCardIds.includes(id)));
  if (eligible.size === 0) return;

  const cardId = player.isBot ? pickBestDiscardCard(state, playerId) : discardPickId;
  if (cardId === null || cardId === undefined || !eligible.has(cardId)) {
    if (player.isBot) return;
    throw new Error("Choose a card from the discard pile to build for free");
  }

  const idx = state.discardPile.indexOf(cardId);
  state.discardPile.splice(idx, 1);
  player.builtCardIds.push(cardId);
  applyImmediateEffects(state, playerId, getCard(cardId).effects);
  state.log.push({
    round: state.round,
    age: state.age,
    message: `${player.name} builds ${getCard(cardId).name} for free from the discard pile (${sourceLabel}).`,
  });
}

/**
 * Applies one player's round action to `state` in place. Throws if the action is illegal.
 * Returns true if it granted a bonus turn. Cities' opponentsPayOrDebt/opponentsPayPerOwnMetric
 * effects are pushed onto `deferredOpponentEffects` (when supplied) instead of resolved
 * immediately, so a whole round's builds settle before any coin-loss effect fires — see
 * applyImmediateEffects' doc comment for why.
 */
export function applyAction(state: GameState, playerId: string, action: RoundAction, deferredOpponentEffects?: PendingOpponentEffect[]): boolean {
  const player = state.players[playerId]!;

  if (action.type === "discard") {
    if (!player.hand.includes(action.cardId)) throw new Error("Card not in hand");
    removeFromHand(player.hand, action.cardId);
    player.discardedCardIds.push(action.cardId);
    state.discardPile.push(action.cardId);
    player.coins += 3;
    state.log.push({ round: state.round, age: state.age, message: `${player.name} discards ${getCard(action.cardId).name} for 3 coins.` });
    return false;
  }

  if (action.type === "build") {
    const check = canBuildCard(state, playerId, action.cardId);
    if (!check.legal) throw new Error(`Cannot build ${action.cardId}: ${check.reason}`);
    const card = getCard(action.cardId);
    const builtViaChain = isFreeViaChain(card, player);

    removeFromHand(player.hand, action.cardId);

    if (!check.free && check.payment) {
      payAndCredit(state, playerId, check.payment.totalCoinCost, check.payment.purchases);
      applyNeighborPurchaseRebate(state, playerId, check.payment.purchases);
    }

    player.builtCardIds.push(action.cardId);
    const extraTurn = applyImmediateEffects(state, playerId, card.effects, deferredOpponentEffects);
    if (builtViaChain) applyCoinsOnChainBuild(state, playerId);
    applyCoinsOnColorBuild(state, playerId, card.color);
    state.log.push({ round: state.round, age: state.age, message: `${player.name} builds ${card.name}.` });
    return extraTurn;
  }

  if (action.type === "buildWonderStage") {
    const check = canBuildWonderStage(state, playerId, action.cardId, action.stageIndex);
    if (!check.legal) throw new Error(`Cannot build wonder stage: ${check.reason}`);
    const wonderSide = getWonderSide(player.wonderId, player.wonderSide);
    const idx = wonderSide.anyOrder ? action.stageIndex! : player.wonderStagesBuilt;
    const stage = wonderSide.stages[idx]!;

    removeFromHand(player.hand, action.cardId);
    if (check.payment) {
      payAndCredit(state, playerId, check.payment.totalCoinCost, check.payment.purchases);
      applyNeighborPurchaseRebate(state, playerId, check.payment.purchases);
    }

    player.wonderStagesBuilt += 1;
    if (wonderSide.anyOrder) player.builtWonderStageIndices.push(idx);
    state.discardPile.push(action.cardId);
    const extraTurn = applyImmediateEffects(state, playerId, stage.effects, deferredOpponentEffects);
    state.log.push({ round: state.round, age: state.age, message: `${player.name} builds a wonder stage (${wonderSide.wonderName}, stage ${idx + 1}).` });
    if (stage.effects.some((e) => e.kind === "buildFromDiscardPile")) {
      resolveDiscardPileBuild(state, playerId, action.discardPickId, wonderSide.wonderName);
    }
    return extraTurn;
  }

  throw new Error(`applyAction cannot handle action type '${action.type}' — use applyLeaderAction for Leaders-phase actions`);
}
