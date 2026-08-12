import { describe, expect, it } from "vitest";
import { computeCheapestPayment, computeCheapestPaymentForCost } from "../src/engine/resourcePayment.js";
import type { ProductionSlot } from "../src/engine/productionSlots.js";

const defaultTradeCost = () => 2;

describe("computeCheapestPayment", () => {
  it("is affordable with coins alone when no resources are required", () => {
    const result = computeCheapestPayment({ coins: 2 }, [], [], [], defaultTradeCost, 5);
    expect(result.affordable).toBe(true);
    expect(result.totalCoinCost).toBe(2);
  });

  it("is unaffordable when coins alone can't cover the cost", () => {
    const result = computeCheapestPayment({ coins: 5 }, [], [], [], defaultTradeCost, 2);
    expect(result.affordable).toBe(false);
  });

  it("uses own fixed-resource production for free", () => {
    const own: ProductionSlot[] = [{ id: "card:stone-pit", domain: ["stone"], qty: 1 }];
    const result = computeCheapestPayment({ resources: { stone: 1 } }, own, [], [], defaultTradeCost, 0);
    expect(result.affordable).toBe(true);
    expect(result.totalCoinCost).toBe(0);
    expect(result.purchases).toHaveLength(0);
  });

  it("resolves a single choice-producer to cover the requirement", () => {
    const own: ProductionSlot[] = [{ id: "card:timber-yard", domain: ["wood", "stone"], qty: 1 }];
    const result = computeCheapestPayment({ resources: { stone: 1 } }, own, [], [], defaultTradeCost, 0);
    expect(result.affordable).toBe(true);
    expect(result.totalCoinCost).toBe(0);
    expect(result.ownChoices["card:timber-yard"]).toBe("stone");
  });

  it("finds a non-obvious own-choice assignment across two flexible producers", () => {
    // Need 1 wood + 1 ore. Two choice-producers: (wood/stone) and (clay/ore).
    // Only one valid assignment covers both without buying: timber->wood, claypit->ore.
    const own: ProductionSlot[] = [
      { id: "timber", domain: ["wood", "stone"], qty: 1 },
      { id: "claypit", domain: ["clay", "ore"], qty: 1 },
    ];
    const result = computeCheapestPayment({ resources: { wood: 1, ore: 1 } }, own, [], [], defaultTradeCost, 0);
    expect(result.affordable).toBe(true);
    expect(result.totalCoinCost).toBe(0);
  });

  it("buys the shortfall from a neighbor when own production is insufficient", () => {
    const rightSlots: ProductionSlot[] = [{ id: "ore-vein", domain: ["ore"], qty: 1 }];
    const result = computeCheapestPayment({ resources: { ore: 1 } }, [], [], rightSlots, defaultTradeCost, 5);
    expect(result.affordable).toBe(true);
    expect(result.totalCoinCost).toBe(2);
    expect(result.purchases).toEqual([{ resource: "ore", from: "right", unitCost: 2 }]);
  });

  it("respects trade discounts lowering the unit cost for a specific side", () => {
    const leftSlots: ProductionSlot[] = [{ id: "ore-vein", domain: ["ore"], qty: 1 }];
    const discountedCost = (resource: string, side: string) => (side === "left" ? 1 : 2);
    const result = computeCheapestPayment({ resources: { ore: 1 } }, [], leftSlots, [], discountedCost, 5);
    expect(result.affordable).toBe(true);
    expect(result.totalCoinCost).toBe(1);
  });

  it("is infeasible when neither own production nor neighbors can supply the resource", () => {
    const result = computeCheapestPayment({ resources: { glass: 1 } }, [], [], [], defaultTradeCost, 100);
    expect(result.affordable).toBe(false);
  });

  it("is unaffordable when the cheapest trade exceeds the buyer's coins even though the resource exists", () => {
    const rightSlots: ProductionSlot[] = [{ id: "ore-vein", domain: ["ore"], qty: 1 }];
    const result = computeCheapestPayment({ resources: { ore: 1 } }, [], [], rightSlots, defaultTradeCost, 1);
    expect(result.affordable).toBe(false);
  });

  it("picks the matching that minimizes total cost over a flat greedy trap", () => {
    // Need 1 wood + 1 ore. Left has a flexible wood/ore slot (cheap side) and a dedicated ore slot elsewhere.
    // A naive greedy that assigns the flexible slot to whichever unit it sees first can strand the other unit
    // on a more expensive purchase; branch-and-bound should find the globally cheapest total.
    const leftSlots: ProductionSlot[] = [{ id: "flex", domain: ["wood", "ore"], qty: 1 }];
    const rightSlots: ProductionSlot[] = [{ id: "ore-only", domain: ["ore"], qty: 1 }];
    const cost = (_r: string, side: string) => (side === "left" ? 1 : 3);
    const result = computeCheapestPayment({ resources: { wood: 1, ore: 1 } }, [], leftSlots, rightSlots, cost, 10);
    expect(result.affordable).toBe(true);
    // Optimal: buy wood from left (1) + ore from right (3) = 4, rather than wasting the cheap flex slot on ore
    // and being forced to buy wood at cost... but wood is ONLY available from the flex slot, so it must be used
    // for wood, and ore must come from the right at 3. Total = 1 + 3 = 4.
    expect(result.totalCoinCost).toBe(4);
  });

  it("tries every alternative CostOption and keeps the cheapest affordable one", () => {
    const cost = [{ coins: 10 }, { resources: { wood: 1 } }];
    const own: ProductionSlot[] = [{ id: "lumber", domain: ["wood"], qty: 1 }];
    const result = computeCheapestPaymentForCost(cost, own, [], [], defaultTradeCost, 3);
    expect(result.affordable).toBe(true);
    expect(result.totalCoinCost).toBe(0);
  });
});
