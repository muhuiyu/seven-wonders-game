import type { Card } from "../types/cards.js";

/**
 * The 9 base-game Guild (purple) cards. `players + 2` are drawn at random into the
 * Age III deck each game; the rest are removed from the game unseen (see deckComposition.ts).
 */
export const GUILD_CARDS: Card[] = [
  { id: "workers-guild", name: "Workers Guild", age: 3, color: "purple", cost: [{ resources: { ore: 2, clay: 1, stone: 1, wood: 1 } }], effects: [{ kind: "vpPerCard", color: "brown", scope: "bothNeighbors", perCard: 1 }] },
  { id: "craftsmens-guild", name: "Craftsmen's Guild", age: 3, color: "purple", cost: [{ resources: { ore: 2, stone: 2 } }], effects: [{ kind: "vpPerCard", color: "grey", scope: "bothNeighbors", perCard: 2 }] },
  { id: "traders-guild", name: "Traders Guild", age: 3, color: "purple", cost: [{ resources: { loom: 1, papyrus: 1, glass: 1 } }], effects: [{ kind: "vpPerCard", color: "yellow", scope: "bothNeighbors", perCard: 1 }] },
  { id: "philosophers-guild", name: "Philosophers Guild", age: 3, color: "purple", cost: [{ resources: { clay: 3, loom: 1, papyrus: 1 } }], effects: [{ kind: "vpPerCard", color: "green", scope: "bothNeighbors", perCard: 1 }] },
  { id: "spies-guild", name: "Spies Guild", age: 3, color: "purple", cost: [{ resources: { clay: 3, glass: 1 } }], effects: [{ kind: "vpPerCard", color: "red", scope: "bothNeighbors", perCard: 1 }] },
  { id: "strategists-guild", name: "Strategists Guild", age: 3, color: "purple", cost: [{ resources: { ore: 2, stone: 1, loom: 1 } }], effects: [{ kind: "vpPerDefeatToken", scope: "bothNeighbors", perToken: 1 }] },
  { id: "shipowners-guild", name: "Shipowners Guild", age: 3, color: "purple", cost: [{ resources: { wood: 3, papyrus: 1, glass: 1 } }], effects: [{ kind: "vpPerColorSet", colors: ["brown", "grey", "purple"], scope: "self", perCard: 1 }] },
  { id: "builders-guild", name: "Builders Guild", age: 3, color: "purple", cost: [{ resources: { stone: 4, clay: 2 } }], effects: [{ kind: "vpPerWonderStage", scope: "bothNeighbors", perStage: 1 }, { kind: "vpPerWonderStage", scope: "self", perStage: 1 }] },
  { id: "magistrates-guild", name: "Magistrates Guild", age: 3, color: "purple", cost: [{ resources: { wood: 3, stone: 1, loom: 1 } }], effects: [{ kind: "vpPerCard", color: "blue", scope: "bothNeighbors", perCard: 1 }] },

  // --- Cities expansion guilds (only drawn into the pool when Cities is enabled) ---
  {
    id: "counterfeiters-guild",
    name: "Counterfeiters Guild",
    age: 3,
    color: "purple",
    cost: [{ resources: { ore: 3, glass: 1, loom: 1 } }],
    effects: [{ kind: "vp", amount: 5 }, { kind: "opponentsPayOrDebt", amount: 3 }],
    requiresExpansion: "cities",
  },
  {
    id: "guild-of-shadows",
    name: "Guild of Shadows",
    age: 3,
    color: "purple",
    cost: [{ resources: { stone: 2, wood: 1, papyrus: 1 } }],
    effects: [{ kind: "vpPerCard", color: "black", scope: "bothNeighbors", perCard: 1 }],
    requiresExpansion: "cities",
  },
  {
    id: "mourners-guild",
    name: "Mourners Guild",
    age: 3,
    color: "purple",
    cost: [{ resources: { clay: 2, wood: 1, glass: 1, loom: 1 } }],
    effects: [{ kind: "vpPerMilitaryToken", result: "win", scope: "bothNeighbors", perToken: 1 }],
    requiresExpansion: "cities",
  },

  // --- Leaders expansion guilds (only drawn into the pool when Leaders is enabled).
  // Exact printed resource costs weren't confirmed by research (only effect text was);
  // costs below are set in line with the base 9 guilds' typical range. ---
  {
    id: "gamers-guild",
    name: "Gamer's Guild",
    age: 3,
    color: "purple",
    cost: [{ resources: { loom: 1, papyrus: 1, glass: 1 } }],
    effects: [{ kind: "vpPerCoinsHeld", coinsPerVp: 3 }],
    requiresExpansion: "leaders",
  },
  {
    id: "courtesans-guild",
    name: "Courtesan's Guild",
    age: 3,
    color: "purple",
    cost: [{ resources: { ore: 2, loom: 1 } }],
    effects: [{ kind: "copyNeighborLeader" }],
    requiresExpansion: "leaders",
  },
  {
    id: "diplomats-guild",
    name: "Diplomat's Guild",
    age: 3,
    color: "purple",
    cost: [{ resources: { clay: 2, stone: 1, papyrus: 1 } }],
    effects: [{ kind: "vpPerRecruitedLeader", scope: "bothNeighbors", perLeader: 1 }],
    requiresExpansion: "leaders",
  },
  {
    id: "architects-guild",
    name: "Architect's Guild",
    age: 3,
    color: "purple",
    cost: [{ resources: { stone: 2, wood: 2 } }],
    effects: [{ kind: "vpPerCard", color: "purple", scope: "bothNeighbors", perCard: 3 }],
    requiresExpansion: "leaders",
  },
];
