import { getCard, getWonderSide, type Cost, type CardColor, type GameState, type PlayerState } from "@sw/shared";
import { isFreeViaChain } from "./chaining.js";
import { getNeighbors } from "./seating.js";
import { getProductionSlots } from "./productionSlots.js";
import { computeCheapestPaymentForCost, type AffordabilityResult } from "./resourcePayment.js";
import { buildTradeUnitCostFn } from "./trade.js";
import { getActiveEffectSources } from "./effectSources.js";

/** Leaders expansion: expands a Cost with extra alternatives that waive `units` of a single resource type (player's choice which — the cheapest-cost search picks it automatically). */
function expandCostWithDiscount(cost: Cost, units: number): Cost {
  const variants = [...cost];
  for (const option of cost) {
    if (!option.resources) continue;
    for (const [type, qty] of Object.entries(option.resources)) {
      if (!qty) continue;
      const reduced = { ...option.resources };
      const newQty = qty - Math.min(units, qty);
      if (newQty <= 0) delete (reduced as Record<string, number>)[type];
      else (reduced as Record<string, number>)[type] = newQty;
      variants.push({ coins: option.coins, resources: reduced });
    }
  }
  return variants;
}

/** Applies any Leaders/Cities cost-modifying effects (buildDiscount, freeWonderStageResourceCost) the player has active. */
export function getEffectiveCost(player: PlayerState, cost: Cost, appliesTo: CardColor | "wonderStage"): Cost {
  const effects = getActiveEffectSources(player);

  if (appliesTo === "wonderStage" && effects.some((e) => e.kind === "freeWonderStageResourceCost")) {
    return cost.map((o) => ({ coins: o.coins }));
  }

  const discountUnits = effects.reduce((sum, e) => (e.kind === "buildDiscount" && e.appliesTo === appliesTo ? sum + e.units : sum), 0);
  return discountUnits > 0 ? expandCostWithDiscount(cost, discountUnits) : cost;
}

export function getAffordability(state: GameState, playerId: string, cost: Cost): AffordabilityResult {
  const player = state.players[playerId]!;
  const { left, right } = getNeighbors(state, playerId);
  const ownSlots = getProductionSlots(player);
  const leftSlots = getProductionSlots(left);
  const rightSlots = getProductionSlots(right);
  const tradeUnitCost = buildTradeUnitCostFn(player);
  const bankPurchase = getActiveEffectSources(player).find((e) => e.kind === "bankPurchase");
  return computeCheapestPaymentForCost(cost, ownSlots, leftSlots, rightSlots, tradeUnitCost, player.coins, bankPurchase?.kind === "bankPurchase" ? bankPurchase.unitCost : undefined);
}

export function hasUnusedFreeBuild(player: PlayerState): boolean {
  if (player.usedFreeBuildThisAge) return false;
  const wonderSide = getWonderSide(player.wonderId, player.wonderSide);
  for (let i = 0; i < player.wonderStagesBuilt; i++) {
    const stage = wonderSide.stages[i];
    if (stage?.effects.some((e) => e.kind === "freeBuildPerAge")) return true;
  }
  return false;
}

function hasFreeBuildForColor(player: PlayerState, color: CardColor): boolean {
  return getActiveEffectSources(player).some((e) => e.kind === "freeBuildForColor" && e.color === color);
}

export interface BuildCheck {
  legal: boolean;
  reason?: string;
  free: boolean;
  usesFreeBuild: boolean;
  payment?: AffordabilityResult;
}

export function canBuildCard(state: GameState, playerId: string, cardId: string): BuildCheck {
  const player = state.players[playerId]!;
  if (!player.hand.includes(cardId)) return { legal: false, reason: "not in hand", free: false, usesFreeBuild: false };
  const card = getCard(cardId);
  if (player.builtCardIds.includes(cardId)) return { legal: false, reason: "already built", free: false, usesFreeBuild: false };

  if (isFreeViaChain(card, player)) return { legal: true, free: true, usesFreeBuild: false };
  if (hasFreeBuildForColor(player, card.color)) return { legal: true, free: true, usesFreeBuild: false };

  const effectiveCost = getEffectiveCost(player, card.cost, card.color);
  const payment = getAffordability(state, playerId, effectiveCost);
  if (payment.affordable) return { legal: true, free: false, usesFreeBuild: false, payment };

  if (hasUnusedFreeBuild(player)) return { legal: true, free: true, usesFreeBuild: true };

  return { legal: false, reason: "cannot afford", free: false, usesFreeBuild: false, payment };
}

export interface WonderStageCheck {
  legal: boolean;
  reason?: string;
  payment?: AffordabilityResult;
}

export function canBuildWonderStage(state: GameState, playerId: string, cardId: string): WonderStageCheck {
  const player = state.players[playerId]!;
  if (!player.hand.includes(cardId)) return { legal: false, reason: "not in hand" };
  const wonderSide = getWonderSide(player.wonderId, player.wonderSide);
  const stage = wonderSide.stages[player.wonderStagesBuilt];
  if (!stage) return { legal: false, reason: "all wonder stages built" };

  const effectiveCost = getEffectiveCost(player, stage.cost, "wonderStage");
  const payment = getAffordability(state, playerId, effectiveCost);
  if (!payment.affordable) return { legal: false, reason: "cannot afford", payment };
  return { legal: true, payment };
}
