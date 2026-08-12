import type { Card } from "../types/cards.js";
import { FREE_COST } from "../types/cards.js";

/** The 9 Age I "black" City cards from the Cities expansion. `playerCount` of these are drawn into the Age I deck each game (see deckComposition.ts). */
export const CITIES_I_CARDS: Card[] = [
  { id: "residence", name: "Residence", age: 1, color: "black", cost: [{ resources: { clay: 1 } }], effects: [{ kind: "diplomacyToken" }, { kind: "vp", amount: 1 }] },
  { id: "hideout", name: "Hideout", age: 1, color: "black", cost: FREE_COST, effects: [{ kind: "vp", amount: 2 }, { kind: "opponentsPayOrDebt", amount: 2 }] },
  { id: "gates-of-the-city", name: "Gates of the City", age: 1, color: "black", cost: [{ coins: 1, resources: { wood: 1 } }], effects: [{ kind: "vp", amount: 4 }] },
  { id: "militia", name: "Militia", age: 1, color: "black", cost: [{ coins: 3 }], effects: [{ kind: "shields", count: 2 }] },
  { id: "gambling-den", name: "Gambling Den", age: 1, color: "black", cost: FREE_COST, effects: [{ kind: "bankGrantSelfAndNeighbors", self: 6, neighbors: 1 }] },
  { id: "clandestine-dock-west", name: "Clandestine Dock (West)", age: 1, color: "black", cost: [{ coins: 1 }], effects: [{ kind: "tradeRebate", side: "left", amount: 1 }] },
  { id: "clandestine-dock-east", name: "Clandestine Dock (East)", age: 1, color: "black", cost: [{ coins: 1 }], effects: [{ kind: "tradeRebate", side: "right", amount: 1 }] },
  { id: "pigeon-loft", name: "Pigeon Loft", age: 1, color: "black", cost: [{ coins: 1, resources: { ore: 1 } }], effects: [{ kind: "copyNeighborScienceSymbol" }] },
  { id: "secret-warehouse", name: "Secret Warehouse", age: 1, color: "black", cost: [{ coins: 2 }], effects: [{ kind: "dynamicResource", mode: "matchOwn" }] },
];
