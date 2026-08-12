import type { LeaderCard } from "../types/leaders.js"

/**
 * The 36 unique Leaders from the original (2011) Leaders expansion. Numeric coin costs
 * are cross-referenced from a structured fan card database against the official
 * rulebook's effect text; see plan notes for the one disputed value (Croesus, resolved
 * to 6 coins per the rulebook and UltraBoardGames' transcription).
 */
export const LEADER_CARDS: LeaderCard[] = [
  {
    id: "alexander",
    name: "Alexander",
    coinCost: 3,
    effects: [{ kind: "vpPerMilitaryToken", result: "win", scope: "self", perToken: 1 }],
  },
  {
    id: "amytis",
    name: "Amytis",
    coinCost: 4,
    effects: [{ kind: "vpPerWonderStage", scope: "self", perStage: 2 }],
    image: "amytis.png",
  },
  {
    id: "archimedes",
    name: "Archimedes",
    coinCost: 4,
    effects: [{ kind: "buildDiscount", appliesTo: "green", units: 1 }],
  },
  { id: "aristotle", name: "Aristotle", coinCost: 3, effects: [{ kind: "vpPerScienceSet", perSet: 3 }] },
  { id: "bilkis", name: "Bilkis", coinCost: 4, effects: [{ kind: "bankPurchase", unitCost: 1 }] },
  { id: "caesar", name: "Caesar", coinCost: 5, effects: [{ kind: "shields", count: 2 }] },
  { id: "cleopatra", name: "Cleopatra", coinCost: 4, effects: [{ kind: "vp", amount: 5 }] },
  { id: "croesus", name: "Croesus", coinCost: 1, effects: [{ kind: "coins", amount: 6 }] },
  { id: "euclid", name: "Euclid", coinCost: 5, effects: [{ kind: "science", symbol: "compass" }] },
  {
    id: "hammurabi",
    name: "Hammurabi",
    coinCost: 2,
    effects: [{ kind: "buildDiscount", appliesTo: "blue", units: 1 }],
  },
  { id: "hannibal", name: "Hannibal", coinCost: 2, effects: [{ kind: "shields", count: 1 }] },
  { id: "hatshepsut", name: "Hatshepsut", coinCost: 2, effects: [{ kind: "neighborPurchaseRebate", amount: 1 }] },
  {
    id: "hiram",
    name: "Hiram",
    coinCost: 3,
    effects: [{ kind: "vpPerCard", color: "purple", scope: "self", perCard: 2 }],
  },
  {
    id: "hypatia",
    name: "Hypatia",
    coinCost: 4,
    effects: [{ kind: "vpPerCard", color: "green", scope: "self", perCard: 1 }],
  },
  {
    id: "imhotep",
    name: "Imhotep",
    coinCost: 3,
    effects: [{ kind: "buildDiscount", appliesTo: "wonderStage", units: 1 }],
  },
  {
    id: "justinian",
    name: "Justinian",
    coinCost: 3,
    effects: [{ kind: "vpPerColorSetBonus", colors: ["blue", "red", "green"], perSet: 3 }],
  },
  { id: "leonidas", name: "Leonidas", coinCost: 2, effects: [{ kind: "buildDiscount", appliesTo: "red", units: 1 }] },
  { id: "maecenas", name: "Maecenas", coinCost: 1, effects: [{ kind: "freeLeaderRecruitment" }] },
  { id: "midas", name: "Midas", coinCost: 3, effects: [{ kind: "vpPerCoinsHeld", coinsPerVp: 3 }] },
  {
    id: "nebuchadnezzar",
    name: "Nebuchadnezzar",
    coinCost: 4,
    effects: [{ kind: "vpPerCard", color: "blue", scope: "self", perCard: 1 }],
  },
  { id: "nefertiti", name: "Nefertiti", coinCost: 3, effects: [{ kind: "vp", amount: 4 }] },
  { id: "nero", name: "Nero", coinCost: 1, effects: [{ kind: "coinsOnMilitaryWin", amount: 2 }] },
  {
    id: "pericles",
    name: "Pericles",
    coinCost: 6,
    effects: [{ kind: "vpPerCard", color: "red", scope: "self", perCard: 2 }],
  },
  {
    id: "phidias",
    name: "Phidias",
    coinCost: 3,
    effects: [{ kind: "vpPerCard", color: "brown", scope: "self", perCard: 1 }],
  },
  {
    id: "plato",
    name: "Plato",
    coinCost: 4,
    effects: [
      { kind: "vpPerColorSetBonus", colors: ["brown", "grey", "blue", "yellow", "green", "red", "purple"], perSet: 7 },
    ],
  },
  {
    id: "praxiteles",
    name: "Praxiteles",
    coinCost: 3,
    effects: [{ kind: "vpPerCard", color: "grey", scope: "self", perCard: 2 }],
  },
  { id: "ptolemy", name: "Ptolemy", coinCost: 5, effects: [{ kind: "science", symbol: "tablet" }] },
  { id: "pythagoras", name: "Pythagoras", coinCost: 5, effects: [{ kind: "science", symbol: "cog" }] },
  { id: "ramses", name: "Ramses", coinCost: 5, effects: [{ kind: "freeBuildForColor", color: "purple" }] },
  { id: "sappho", name: "Sappho", coinCost: 1, effects: [{ kind: "vp", amount: 2 }] },
  { id: "solomon", name: "Solomon", coinCost: 3, effects: [{ kind: "recycleDiscardOnRecruit" }] },
  { id: "tomyris", name: "Tomyris", coinCost: 4, effects: [{ kind: "redirectDefeatToken" }] },
  {
    id: "varro",
    name: "Varro",
    coinCost: 3,
    effects: [{ kind: "vpPerCard", color: "yellow", scope: "self", perCard: 1 }],
  },
  { id: "vitruvius", name: "Vitruvius", coinCost: 1, effects: [{ kind: "coinsOnChainBuild", amount: 2 }] },
  {
    id: "xenophon",
    name: "Xenophon",
    coinCost: 2,
    effects: [{ kind: "coinsOnColorBuild", color: "yellow", amount: 2 }],
  },
  { id: "zenobia", name: "Zenobia", coinCost: 2, effects: [{ kind: "vp", amount: 3 }] },
]

export const LEADER_IDS: string[] = LEADER_CARDS.map((c) => c.id)

export const LEADER_CARDS_BY_ID: Record<string, LeaderCard> = Object.fromEntries(LEADER_CARDS.map((c) => [c.id, c]))

export function getLeaderCard(id: string): LeaderCard {
  const card = LEADER_CARDS_BY_ID[id]
  if (!card) throw new Error(`Unknown leader id: ${id}`)
  return card
}
