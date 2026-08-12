import type { Card } from "../types/cards.js";

/** The 9 Age II "black" City cards from the Cities expansion. */
export const CITIES_II_CARDS: Card[] = [
  { id: "architect-cabinet", name: "Architect Cabinet", age: 2, color: "black", cost: [{ coins: 1, resources: { papyrus: 1 } }], effects: [{ kind: "vp", amount: 2 }, { kind: "freeWonderStageResourceCost" }] },
  { id: "black-market", name: "Black Market", age: 2, color: "black", cost: [{ resources: { ore: 1, loom: 1 } }], effects: [{ kind: "dynamicResource", mode: "fillGap" }] },
  { id: "consulate", name: "Consulate", age: 2, color: "black", cost: [{ resources: { clay: 1, papyrus: 1 } }], effects: [{ kind: "vp", amount: 2 }, { kind: "diplomacyToken" }] },
  { id: "gambling-house", name: "Gambling House", age: 2, color: "black", cost: [{ coins: 1 }], effects: [{ kind: "bankGrantSelfAndNeighbors", self: 9, neighbors: 2 }] },
  { id: "lair", name: "Lair", age: 2, color: "black", cost: [{ resources: { wood: 1, glass: 1 } }], effects: [{ kind: "vp", amount: 3 }, { kind: "opponentsPayOrDebt", amount: 2 }] },
  { id: "mercenaries", name: "Mercenaries", age: 2, color: "black", cost: [{ coins: 4, resources: { papyrus: 1 } }], effects: [{ kind: "shields", count: 3 }] },
  { id: "sepulcher", name: "Sepulcher", age: 2, color: "black", cost: [{ resources: { ore: 1, glass: 1 } }], effects: [{ kind: "vp", amount: 3 }, { kind: "opponentsPayPerOwnMetric", metric: "militaryVictoryTokens", perUnit: 1 }] },
  { id: "spy-ring", name: "Spy Ring", age: 2, color: "black", cost: [{ coins: 2, resources: { stone: 1, clay: 1 } }], effects: [{ kind: "copyNeighborScienceSymbol" }] },
  { id: "tabularium", name: "Tabularium", age: 2, color: "black", cost: [{ coins: 2, resources: { ore: 1, wood: 1, loom: 1 } }], effects: [{ kind: "vp", amount: 6 }] },
];
