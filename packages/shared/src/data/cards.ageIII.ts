import type { Card } from "../types/cards.js";

export const AGE_III_CARDS: Card[] = [
  // --- Blue: civilian ---
  { id: "pantheon", name: "Pantheon", age: 3, color: "blue", cost: [{ resources: { clay: 2, ore: 1, glass: 1, loom: 1, papyrus: 1 } }], chainFrom: ["altar"], effects: [{ kind: "vp", amount: 7 }] },
  { id: "gardens", name: "Gardens", age: 3, color: "blue", cost: [{ resources: { clay: 2, wood: 1 } }], chainFrom: ["theatre"], effects: [{ kind: "vp", amount: 5 }] },
  { id: "town-hall", name: "Town Hall", age: 3, color: "blue", cost: [{ resources: { stone: 3, glass: 1 } }], effects: [{ kind: "vp", amount: 6 }] },
  { id: "palace", name: "Palace", age: 3, color: "blue", cost: [{ resources: { wood: 1, stone: 1, clay: 1, ore: 1, glass: 1, loom: 1, papyrus: 1 } }], effects: [{ kind: "vp", amount: 8 }] },
  { id: "senate", name: "Senate", age: 3, color: "blue", cost: [{ resources: { wood: 2, stone: 1, ore: 1 } }], chainFrom: ["courthouse"], effects: [{ kind: "vp", amount: 6 }] },
  { id: "obelisk", name: "Obelisk", age: 3, color: "blue", cost: [{ resources: { wood: 2, stone: 2 } }], effects: [{ kind: "vp", amount: 5 }] },

  // --- Red: military ---
  { id: "fortifications", name: "Fortifications", age: 3, color: "red", cost: [{ resources: { ore: 3, clay: 1 } }], chainFrom: ["walls"], effects: [{ kind: "shields", count: 2 }] },
  { id: "circus", name: "Circus", age: 3, color: "red", cost: [{ resources: { clay: 3, ore: 1 } }], chainFrom: ["training-ground"], effects: [{ kind: "shields", count: 2 }] },
  { id: "arsenal", name: "Arsenal", age: 3, color: "red", cost: [{ resources: { wood: 2, ore: 1, loom: 1 } }], effects: [{ kind: "shields", count: 3 }] },
  { id: "siege-workshop", name: "Siege Workshop", age: 3, color: "red", cost: [{ resources: { clay: 3, wood: 1 } }], chainFrom: ["laboratory"], effects: [{ kind: "shields", count: 2 }] },

  // --- Green: science ---
  { id: "academy", name: "Academy", age: 3, color: "green", cost: [{ resources: { stone: 3, glass: 1 } }], chainFrom: ["school"], effects: [{ kind: "science", symbol: "compass" }] },
  { id: "university", name: "University", age: 3, color: "green", cost: [{ resources: { wood: 2, glass: 1, papyrus: 1 } }], chainFrom: ["library"], effects: [{ kind: "science", symbol: "tablet" }] },
  { id: "observatory", name: "Observatory", age: 3, color: "green", cost: [{ resources: { ore: 2, glass: 1, loom: 1 } }], chainFrom: ["laboratory"], effects: [{ kind: "science", symbol: "cog" }] },
  { id: "lodge", name: "Lodge", age: 3, color: "green", cost: [{ resources: { clay: 2, loom: 1, papyrus: 1 } }], chainFrom: ["dispensary"], effects: [{ kind: "science", symbol: "compass" }] },
  { id: "study", name: "Study", age: 3, color: "green", cost: [{ resources: { wood: 1, papyrus: 1, loom: 1 } }], chainFrom: ["school"], effects: [{ kind: "science", symbol: "cog" }] },

  // --- Yellow: commerce ---
  { id: "chamber-of-commerce", name: "Chamber of Commerce", age: 3, color: "yellow", cost: [{ resources: { clay: 2, papyrus: 1 } }], effects: [{ kind: "vpAndCoinsPerCard", color: "grey", scope: "self", vpPer: 1, coinsPer: 2 }] },
  { id: "arena", name: "Arena", age: 3, color: "yellow", cost: [{ resources: { clay: 2, ore: 1 } }], effects: [{ kind: "vpPerWonderStage", scope: "self", perStage: 1 }, { kind: "coins", amount: 3 }] },
  { id: "lighthouse", name: "Lighthouse", age: 3, color: "yellow", cost: [{ resources: { stone: 1, glass: 1 } }], effects: [{ kind: "vpAndCoinsPerCard", color: "yellow", scope: "self", vpPer: 1, coinsPer: 1 }] },
  { id: "haven", name: "Haven", age: 3, color: "yellow", cost: [{ resources: { loom: 1, ore: 1, wood: 1 } }], effects: [{ kind: "vpAndCoinsPerCard", color: "brown", scope: "self", vpPer: 1, coinsPer: 1 }] },
];
