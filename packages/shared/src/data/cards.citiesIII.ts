import type { Card } from "../types/cards.js";

/** The 9 Age III "black" City cards from the Cities expansion. */
export const CITIES_III_CARDS: Card[] = [
  {
    id: "brotherhood",
    name: "Brotherhood",
    age: 3,
    color: "black",
    cost: [{ coins: 2, resources: { clay: 2, stone: 2, glass: 1, papyrus: 1 } }],
    effects: [{ kind: "vp", amount: 4 }, { kind: "opponentsPayOrDebt", amount: 3 }],
  },
  {
    id: "builders-union",
    name: "Builders' Union",
    age: 3,
    color: "black",
    cost: [{ resources: { clay: 1, wood: 1, papyrus: 1, glass: 1 } }],
    effects: [{ kind: "vp", amount: 4 }, { kind: "opponentsPayPerOwnMetric", metric: "wonderStagesBuilt", perUnit: 1 }],
  },
  { id: "capitol", name: "Capitol", age: 3, color: "black", cost: [{ resources: { wood: 2, ore: 1, loom: 1 } }], effects: [{ kind: "vp", amount: 8 }] },
  {
    id: "cenotaph",
    name: "Cenotaph",
    age: 3,
    color: "black",
    cost: [{ resources: { clay: 2, stone: 1, loom: 1, glass: 1 } }],
    effects: [{ kind: "vp", amount: 5 }, { kind: "opponentsPayPerOwnMetric", metric: "militaryVictoryTokens", perUnit: 1 }],
  },
  { id: "contingent", name: "Contingent", age: 3, color: "black", cost: [{ coins: 5, resources: { loom: 1 } }], effects: [{ kind: "shields", count: 5 }] },
  { id: "embassy", name: "Embassy", age: 3, color: "black", cost: [{ resources: { stone: 1, loom: 1, papyrus: 1 } }], effects: [{ kind: "vp", amount: 3 }, { kind: "diplomacyToken" }] },
  {
    id: "secret-society",
    name: "Secret Society",
    age: 3,
    color: "black",
    cost: [{ resources: { stone: 1, papyrus: 1 } }],
    effects: [
      { kind: "coinsPerCard", color: "black", scope: "self", perCard: 1 },
      { kind: "vpPerCard", color: "black", scope: "self", perCard: 1 },
    ],
  },
  {
    id: "slave-market",
    name: "Slave Market",
    age: 3,
    color: "black",
    cost: [{ resources: { ore: 3, wood: 2 } }],
    effects: [
      { kind: "coinsPerMilitaryToken", result: "win", amount: 1 },
      { kind: "vpPerMilitaryToken", result: "win", scope: "self", perToken: 1 },
    ],
  },
  { id: "torture-chamber", name: "Torture Chamber", age: 3, color: "black", cost: [{ coins: 3, resources: { ore: 2, glass: 1 } }], effects: [{ kind: "copyNeighborScienceSymbol" }] },
];
