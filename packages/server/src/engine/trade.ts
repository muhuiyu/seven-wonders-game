import type { NeighborSide, PlayerState, ResourceType } from "@sw/shared";
import type { TradeUnitCostFn } from "./resourcePayment.js";
import { getActiveEffectSources } from "./effectSources.js";

const DEFAULT_TRADE_COST = 2;

/** Builds a (resource, side) -> coin cost function reflecting the buyer's trade-discount cards. */
export function buildTradeUnitCostFn(buyer: PlayerState): TradeUnitCostFn {
  const discounts: { resources: ResourceType[]; sides: NeighborSide[]; unitCost: number }[] = [];
  for (const effect of getActiveEffectSources(buyer)) {
    if (effect.kind === "tradeDiscount") discounts.push(effect);
  }
  return (resource, side) => {
    let cheapest = DEFAULT_TRADE_COST;
    for (const d of discounts) {
      if (d.resources.includes(resource) && d.sides.includes(side) && d.unitCost < cheapest) cheapest = d.unitCost;
    }
    return cheapest;
  };
}
