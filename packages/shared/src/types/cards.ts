import type { NeighborSide, PlayerScope, ProductionOption, ResourceType } from "./resources.js"

export const CARD_COLORS = ["brown", "grey", "blue", "yellow", "red", "green", "purple", "black"] as const
export type CardColor = (typeof CARD_COLORS)[number]

export type ExpansionId = "leaders" | "cities"
export type MilitaryResult = "win" | "lose" | "tie"

export type ScienceSymbol = "cog" | "compass" | "tablet"

/** A cost is a list of alternative payment options; a card can be paid for by satisfying ANY one option. */
export interface CostOption {
  coins?: number
  resources?: Partial<Record<ResourceType, number>>
}
export type Cost = CostOption[]

export const FREE_COST: Cost = [{}]

export type CardEffect =
  | { kind: "resource"; production: ProductionOption }
  | { kind: "shields"; count: number }
  | { kind: "science"; symbol: ScienceSymbol }
  | { kind: "scienceChoice" } // wonder/guild effect: 1 symbol of choice (e.g. Age III wonder stages)
  | { kind: "coins"; amount: number }
  | { kind: "vp"; amount: number }
  | { kind: "vpPerCard"; color: CardColor; scope: PlayerScope; perCard: number }
  | { kind: "coinsPerCard"; color: CardColor; scope: PlayerScope; perCard: number }
  | { kind: "vpAndCoinsPerCard"; color: CardColor; scope: PlayerScope; vpPer: number; coinsPer: number }
  | { kind: "vpPerWonderStage"; scope: PlayerScope; perStage: number }
  | { kind: "vpPerDefeatToken"; scope: PlayerScope; perToken: number }
  | { kind: "vpPerColorSet"; colors: CardColor[]; scope: "self"; perCard: number } // Shipowners Guild style
  | { kind: "tradeDiscount"; resources: ResourceType[]; sides: NeighborSide[]; unitCost: number }
  | { kind: "copyGuild" } // Strategists-style "copy one neighbor guild" (Diplomats Guild variant, unused in base but supported)
  | { kind: "freeBuildPerAge" } // wonder ability: once per age, build one card for free
  | { kind: "playSeventhCard" } // wonder ability: build the leftover card at end of age for free
  | { kind: "extraTurn" } // wonder ability (Halikarnassos-style): build another card immediately
  // --- Cities expansion ---
  | { kind: "diplomacyToken" } // grants a token that skips the player's next military conflict entirely
  | { kind: "opponentsPayOrDebt"; amount: number } // every other player pays `amount` coins or takes Debt (-1 VP per unpaid coin)
  | { kind: "opponentsPayPerOwnMetric"; metric: "militaryVictoryTokens" | "wonderStagesBuilt"; perUnit: number } // each other player pays perUnit x their OWN metric count, or takes Debt
  | { kind: "bankGrantSelfAndNeighbors"; self: number; neighbors: number } // Gambling Den/House style
  | { kind: "tradeRebate"; side: NeighborSide; amount: number } // refund `amount` coins the first time this turn a resource is bought from `side`
  | { kind: "dynamicResource"; mode: "matchOwn" | "fillGap" } // Secret Warehouse / Black Market: 1 flex production slot computed from the player's other production
  | { kind: "copyNeighborScienceSymbol" } // Pigeon Loft/Spy Ring/Torture Chamber: copy 1 science symbol from a neighbor's green card
  | { kind: "vpPerMilitaryToken"; result: MilitaryResult; scope: PlayerScope; perToken: number }
  | { kind: "coinsPerMilitaryToken"; result: MilitaryResult; amount: number } // immediate, self only, at build time
  // --- Leaders expansion ---
  | { kind: "buildDiscount"; appliesTo: CardColor | "wonderStage"; units: number } // waive `units` resources (player's choice which) when building matching cards
  | { kind: "freeWonderStageResourceCost" } // Architect Cabinet (Cities): from now on, build Wonder stages ignoring their resource cost entirely (coin costs still apply)
  | { kind: "bankPurchase"; unitCost: number } // once per turn, buy 1 resource of choice directly from the bank
  | { kind: "neighborPurchaseRebate"; amount: number } // refund `amount` coins per distinct neighbor side traded with this turn
  | { kind: "vpPerColorSetBonus"; colors: CardColor[]; perSet: number } // min-count set bonus across `colors` (Justinian/Plato style)
  | { kind: "freeLeaderRecruitment" } // this player's future Leader recruitment costs 0 coins
  | { kind: "leaderRecruitmentDiscount"; self: number; neighbors: number } // Roma (Night): this player's Leader recruitment costs `self` fewer coins; each neighbor's costs `neighbors` fewer
  | { kind: "coinsOnMilitaryWin"; amount: number } // credited whenever this player gains a new military victory token
  | { kind: "freeBuildForColor"; color: CardColor } // cards of this color can always be built ignoring their resource cost
  | { kind: "recycleDiscardOnRecruit" } // one-time: on recruit, take the best card from the discard pile and build it free
  | { kind: "redirectDefeatToken" } // this player's defeat tokens are instead given to their victorious neighbor
  | { kind: "coinsOnChainBuild"; amount: number } // credited whenever this player builds a card for free via chaining
  | { kind: "coinsOnColorBuild"; color: CardColor; amount: number } // credited whenever this player builds a card of this color
  | { kind: "vpPerCoinsHeld"; coinsPerVp: number } // extra VP per `coinsPerVp` coins held at game end (stacks with treasury scoring)
  | { kind: "vpPerRecruitedLeader"; scope: PlayerScope; perLeader: number }
  | { kind: "vpPerScienceSet"; perSet: number } // Aristotle: extra VP per complete science-symbol set, on top of the base 7/set
  | { kind: "copyNeighborLeader" } // Courtesan's Guild: on build, gain the effects of one recruited leader in a neighboring city

export interface Card {
  id: string
  name: string
  age: 1 | 2 | 3
  color: CardColor
  cost: Cost
  chainFrom?: string[]
  chainUnlocks?: string[]
  effects: CardEffect[]
  requiresExpansion?: ExpansionId
  /** Filename (e.g. "lumber-yard.png") of this card's artwork inside packages/client/public/cards/. Falls back to a placeholder when absent. */
  image?: string
}
