import type { Card } from "../types/cards.js";
import { FREE_COST } from "../types/cards.js";

const p = (options: string[], qty = 1) => ({ options: options as any, qty });

export const AGE_II_CARDS: Card[] = [
  // --- Brown: upgraded raw materials (produce 2 units, cost 1 coin) ---
  { id: "sawmill", name: "Sawmill", age: 2, color: "brown", cost: [{ coins: 1 }], effects: [{ kind: "resource", production: p(["wood"], 2) }] },
  { id: "quarry", name: "Quarry", age: 2, color: "brown", cost: [{ coins: 1 }], effects: [{ kind: "resource", production: p(["stone"], 2) }] },
  { id: "brickyard", name: "Brickyard", age: 2, color: "brown", cost: [{ coins: 1 }], effects: [{ kind: "resource", production: p(["clay"], 2) }] },
  { id: "foundry", name: "Foundry", age: 2, color: "brown", cost: [{ coins: 1 }], effects: [{ kind: "resource", production: p(["ore"], 2) }] },

  // --- Blue: civilian ---
  { id: "aqueduct", name: "Aqueduct", age: 2, color: "blue", cost: [{ resources: { stone: 3 } }], chainFrom: ["baths"], effects: [{ kind: "vp", amount: 5 }] },
  { id: "temple", name: "Temple", age: 2, color: "blue", cost: [{ resources: { wood: 1, clay: 1, glass: 1 } }], chainFrom: ["altar"], chainUnlocks: ["pantheon"], effects: [{ kind: "vp", amount: 4 }] },
  { id: "statue", name: "Statue", age: 2, color: "blue", cost: [{ resources: { ore: 2, wood: 1 } }], chainFrom: ["theatre"], chainUnlocks: ["gardens"], effects: [{ kind: "vp", amount: 4 }] },
  { id: "courthouse", name: "Courthouse", age: 2, color: "blue", cost: [{ resources: { clay: 2, loom: 1 } }], chainFrom: ["scriptorium"], effects: [{ kind: "vp", amount: 4 }] },

  // --- Yellow: commerce ---
  { id: "forum", name: "Forum", age: 2, color: "yellow", cost: [{ resources: { clay: 2 } }], effects: [{ kind: "resource", production: p(["glass", "loom", "papyrus"]) }] },
  { id: "caravansery", name: "Caravansery", age: 2, color: "yellow", cost: [{ resources: { wood: 2 } }], effects: [{ kind: "resource", production: p(["wood", "stone", "ore", "clay"]) }] },
  { id: "vineyard", name: "Vineyard", age: 2, color: "yellow", cost: FREE_COST, effects: [{ kind: "coinsPerCard", color: "brown", scope: "bothNeighbors", perCard: 1 }, { kind: "coinsPerCard", color: "brown", scope: "self", perCard: 1 }] },
  { id: "bazar", name: "Bazar", age: 2, color: "yellow", cost: FREE_COST, effects: [{ kind: "coinsPerCard", color: "grey", scope: "bothNeighbors", perCard: 2 }] },

  // --- Red: military ---
  { id: "walls", name: "Walls", age: 2, color: "red", cost: [{ resources: { stone: 3 } }], effects: [{ kind: "shields", count: 2 }] },
  { id: "training-ground", name: "Training Ground", age: 2, color: "red", cost: [{ resources: { wood: 2, ore: 1 } }], effects: [{ kind: "shields", count: 2 }] },
  { id: "stables", name: "Stables", age: 2, color: "red", cost: [{ resources: { ore: 1, clay: 1, wood: 1 } }], chainFrom: ["apothecary"], effects: [{ kind: "shields", count: 2 }] },
  { id: "archery-range", name: "Archery Range", age: 2, color: "red", cost: [{ resources: { wood: 2, ore: 1 } }], effects: [{ kind: "shields", count: 2 }] },

  // --- Green: science ---
  { id: "dispensary", name: "Dispensary", age: 2, color: "green", cost: [{ resources: { ore: 2, glass: 1 } }], chainFrom: ["apothecary"], chainUnlocks: ["lodge"], effects: [{ kind: "science", symbol: "compass" }] },
  { id: "laboratory", name: "Laboratory", age: 2, color: "green", cost: [{ resources: { clay: 2, papyrus: 1 } }], chainFrom: ["workshop"], chainUnlocks: ["observatory"], effects: [{ kind: "science", symbol: "cog" }] },
  { id: "library", name: "Library", age: 2, color: "green", cost: [{ resources: { stone: 2, loom: 1 } }], chainFrom: ["scriptorium"], chainUnlocks: ["university"], effects: [{ kind: "science", symbol: "tablet" }] },
  { id: "school", name: "School", age: 2, color: "green", cost: [{ resources: { papyrus: 2 } }], chainUnlocks: ["academy"], effects: [{ kind: "science", symbol: "tablet" }] },
];
