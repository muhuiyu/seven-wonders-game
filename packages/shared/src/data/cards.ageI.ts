import type { Card } from "../types/cards.js";
import { FREE_COST } from "../types/cards.js";

const p = (options: string[], qty = 1) => ({ options: options as any, qty });

export const AGE_I_CARDS: Card[] = [
  // --- Brown: raw materials ---
  { id: "lumber-yard", name: "Lumber Yard", age: 1, color: "brown", cost: FREE_COST, effects: [{ kind: "resource", production: p(["wood"]) }] },
  { id: "stone-pit", name: "Stone Pit", age: 1, color: "brown", cost: FREE_COST, effects: [{ kind: "resource", production: p(["stone"]) }] },
  { id: "clay-pool", name: "Clay Pool", age: 1, color: "brown", cost: FREE_COST, effects: [{ kind: "resource", production: p(["clay"]) }] },
  { id: "ore-vein", name: "Ore Vein", age: 1, color: "brown", cost: FREE_COST, effects: [{ kind: "resource", production: p(["ore"]) }] },
  { id: "timber-yard", name: "Timber Yard", age: 1, color: "brown", cost: FREE_COST, effects: [{ kind: "resource", production: p(["wood", "stone"]) }] },
  { id: "clay-pit", name: "Clay Pit", age: 1, color: "brown", cost: FREE_COST, effects: [{ kind: "resource", production: p(["clay", "ore"]) }] },
  { id: "excavation", name: "Excavation", age: 1, color: "brown", cost: FREE_COST, effects: [{ kind: "resource", production: p(["stone", "clay"]) }] },
  { id: "forest-cave", name: "Forest Cave", age: 1, color: "brown", cost: FREE_COST, effects: [{ kind: "resource", production: p(["wood", "ore"]) }] },

  // --- Grey: manufactured goods ---
  { id: "glassworks", name: "Glassworks", age: 1, color: "grey", cost: FREE_COST, effects: [{ kind: "resource", production: p(["glass"]) }] },
  { id: "press", name: "Press", age: 1, color: "grey", cost: FREE_COST, effects: [{ kind: "resource", production: p(["papyrus"]) }] },
  { id: "loom-good", name: "Loom", age: 1, color: "grey", cost: FREE_COST, effects: [{ kind: "resource", production: p(["loom"]) }] },

  // --- Blue: civilian ---
  { id: "pawnshop", name: "Pawnshop", age: 1, color: "blue", cost: FREE_COST, effects: [{ kind: "vp", amount: 3 }] },
  { id: "baths", name: "Baths", age: 1, color: "blue", cost: [{ resources: { stone: 1 } }], chainUnlocks: ["aqueduct"], effects: [{ kind: "vp", amount: 3 }] },
  { id: "altar", name: "Altar", age: 1, color: "blue", cost: FREE_COST, chainUnlocks: ["temple"], effects: [{ kind: "vp", amount: 2 }] },
  { id: "theatre", name: "Theatre", age: 1, color: "blue", cost: FREE_COST, chainUnlocks: ["statue"], effects: [{ kind: "vp", amount: 2 }] },

  // --- Yellow: commerce ---
  { id: "tavern", name: "Tavern", age: 1, color: "yellow", cost: FREE_COST, effects: [{ kind: "coins", amount: 5 }] },
  { id: "east-trading-post", name: "East Trading Post", age: 1, color: "yellow", cost: FREE_COST, effects: [{ kind: "tradeDiscount", resources: ["wood", "stone", "ore", "clay"], sides: ["right"], unitCost: 1 }] },
  { id: "west-trading-post", name: "West Trading Post", age: 1, color: "yellow", cost: FREE_COST, effects: [{ kind: "tradeDiscount", resources: ["wood", "stone", "ore", "clay"], sides: ["left"], unitCost: 1 }] },
  { id: "marketplace", name: "Marketplace", age: 1, color: "yellow", cost: FREE_COST, effects: [{ kind: "tradeDiscount", resources: ["glass", "loom", "papyrus"], sides: ["left", "right"], unitCost: 1 }] },

  // --- Red: military ---
  { id: "stockade", name: "Stockade", age: 1, color: "red", cost: [{ resources: { wood: 1 } }], effects: [{ kind: "shields", count: 1 }] },
  { id: "barracks", name: "Barracks", age: 1, color: "red", cost: [{ resources: { ore: 1 } }], effects: [{ kind: "shields", count: 1 }] },
  { id: "guard-tower", name: "Guard Tower", age: 1, color: "red", cost: [{ resources: { clay: 1 } }], effects: [{ kind: "shields", count: 1 }] },

  // --- Green: science ---
  { id: "apothecary", name: "Apothecary", age: 1, color: "green", cost: [{ resources: { loom: 1 } }], chainUnlocks: ["stables", "dispensary"], effects: [{ kind: "science", symbol: "compass" }] },
  { id: "workshop", name: "Workshop", age: 1, color: "green", cost: [{ resources: { glass: 1 } }], chainUnlocks: ["laboratory"], effects: [{ kind: "science", symbol: "cog" }] },
  { id: "scriptorium", name: "Scriptorium", age: 1, color: "green", cost: [{ resources: { papyrus: 1 } }], chainUnlocks: ["courthouse", "library"], effects: [{ kind: "science", symbol: "tablet" }] },
];
