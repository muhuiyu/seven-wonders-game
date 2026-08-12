import type { Cost, CostOption, NeighborSide, PaymentPlan, ResourceType } from "@sw/shared";
import { ALL_RESOURCES } from "@sw/shared";
import type { ProductionSlot } from "./productionSlots.js";

/** "bank" represents Bilkis's once-per-turn direct bank purchase — no neighbor is credited for it. */
export type PurchaseSide = NeighborSide | "bank";

export interface AffordabilityResult {
  affordable: boolean;
  totalCoinCost: number; // costOption.coins + trade purchases
  ownChoices: Record<string, ResourceType>;
  purchases: { resource: ResourceType; from: PurchaseSide; unitCost: number }[];
}

export type TradeUnitCostFn = (resource: ResourceType, side: NeighborSide) => number;

const INFEASIBLE: AffordabilityResult = { affordable: false, totalCoinCost: Infinity, ownChoices: {}, purchases: [] };

/** Tries every alternative CostOption in `cost` and returns the cheapest affordable payment. */
export function computeCheapestPaymentForCost(
  cost: Cost,
  ownSlots: ProductionSlot[],
  leftSlots: ProductionSlot[],
  rightSlots: ProductionSlot[],
  tradeUnitCost: TradeUnitCostFn,
  buyerCoins: number,
  bankUnitCost?: number,
): AffordabilityResult {
  let best: AffordabilityResult = INFEASIBLE;
  for (const option of cost) {
    const result = computeCheapestPayment(option, ownSlots, leftSlots, rightSlots, tradeUnitCost, buyerCoins, bankUnitCost);
    if (result.affordable && result.totalCoinCost < best.totalCoinCost) best = result;
  }
  return best;
}

export function computeCheapestPayment(
  costOption: CostOption,
  ownSlots: ProductionSlot[],
  leftSlots: ProductionSlot[],
  rightSlots: ProductionSlot[],
  tradeUnitCost: TradeUnitCostFn,
  buyerCoins: number,
  bankUnitCost?: number,
): AffordabilityResult {
  const baseCoins = costOption.coins ?? 0;
  const required = costOption.resources ?? {};
  const requiredTypes = Object.keys(required) as ResourceType[];

  if (requiredTypes.length === 0) {
    return baseCoins <= buyerCoins
      ? { affordable: true, totalCoinCost: baseCoins, ownChoices: {}, purchases: [] }
      : INFEASIBLE;
  }

  const fixedSlots = ownSlots.filter((s) => s.domain.length === 1);
  const flexSlots = ownSlots.filter((s) => s.domain.length > 1);

  const fixedMultiset: Partial<Record<ResourceType, number>> = {};
  for (const s of fixedSlots) fixedMultiset[s.domain[0]!] = (fixedMultiset[s.domain[0]!] ?? 0) + s.qty;

  // Cartesian product over flex slots' domain choices (own choice-producers).
  const branches: { choice: Record<string, ResourceType> }[] = [];
  function buildBranches(idx: number, choice: Record<string, ResourceType>) {
    if (idx === flexSlots.length) {
      branches.push({ choice: { ...choice } });
      return;
    }
    const slot = flexSlots[idx]!;
    for (const resource of slot.domain) {
      choice[slot.id] = resource;
      buildBranches(idx + 1, choice);
    }
    delete choice[slot.id];
  }
  buildBranches(0, {});
  if (branches.length === 0) branches.push({ choice: {} });

  const neighborPool: SlotPoolEntry[] = [
    ...leftSlots.map((s) => ({ id: `L:${s.id}`, domain: s.domain, side: "left" as const, remaining: s.qty })),
    ...rightSlots.map((s) => ({ id: `R:${s.id}`, domain: s.domain, side: "right" as const, remaining: s.qty })),
  ];
  if (bankUnitCost !== undefined) {
    neighborPool.push({ id: "bank:0", domain: [...ALL_RESOURCES], side: "bank", remaining: 1 });
  }

  let best: AffordabilityResult | null = null;

  for (const branch of branches) {
    const multiset: Partial<Record<ResourceType, number>> = { ...fixedMultiset };
    for (const slot of flexSlots) {
      const r = branch.choice[slot.id]!;
      multiset[r] = (multiset[r] ?? 0) + slot.qty;
    }

    const residualUnits: ResourceType[] = [];
    for (const type of requiredTypes) {
      const need = required[type]! - (multiset[type] ?? 0);
      for (let i = 0; i < need; i++) residualUnits.push(type);
    }

    if (residualUnits.length === 0) {
      // Fully self-sufficient — globally optimal, no need to search further branches.
      return { affordable: baseCoins <= buyerCoins, totalCoinCost: baseCoins, ownChoices: branch.choice, purchases: [] };
    }

    const solved = assignUnitsToSlots(residualUnits, neighborPool, tradeUnitCost, bankUnitCost);
    if (!solved) continue;

    const totalCoinCost = baseCoins + solved.cost;
    if (!best || totalCoinCost < best.totalCoinCost) {
      best = {
        affordable: totalCoinCost <= buyerCoins,
        totalCoinCost,
        ownChoices: branch.choice,
        purchases: solved.usage.map((u) => ({ resource: u.resource, from: u.side, unitCost: u.unitCost })),
      };
    }
  }

  return best ?? INFEASIBLE;
}

interface SlotPoolEntry {
  id: string;
  domain: ResourceType[];
  side: PurchaseSide;
  remaining: number;
}

/** Branch-and-bound minimum-cost assignment of residual resource units to neighbor (or bank) production slots. */
function assignUnitsToSlots(
  units: ResourceType[],
  pool: SlotPoolEntry[],
  tradeUnitCost: TradeUnitCostFn,
  bankUnitCost?: number,
): { cost: number; usage: { slotId: string; resource: ResourceType; side: PurchaseSide; unitCost: number }[] } | null {
  const matchCount = (r: ResourceType) => pool.filter((s) => s.domain.includes(r)).length;
  const ordered = [...units].sort((a, b) => matchCount(a) - matchCount(b));

  let best: { cost: number; usage: { slotId: string; resource: ResourceType; side: PurchaseSide; unitCost: number }[] } | null = null;
  const usage: { slotId: string; resource: ResourceType; side: PurchaseSide; unitCost: number }[] = [];

  function recurse(idx: number, costSoFar: number): void {
    if (best && costSoFar >= best.cost) return;
    if (idx === ordered.length) {
      best = { cost: costSoFar, usage: [...usage] };
      return;
    }
    const resource = ordered[idx]!;
    const candidates = pool
      .filter((s) => s.remaining > 0 && s.domain.includes(resource))
      .map((s) => ({ s, cost: s.side === "bank" ? bankUnitCost! : tradeUnitCost(resource, s.side) }))
      .sort((a, b) => a.cost - b.cost);

    for (const { s, cost } of candidates) {
      s.remaining--;
      usage.push({ slotId: s.id, resource, side: s.side, unitCost: cost });
      recurse(idx + 1, costSoFar + cost);
      usage.pop();
      s.remaining++;
    }
  }

  recurse(0, 0);
  return best;
}
