import type { ResourceType, NeighborSide, ResourcePurchase } from "./resources.js";
import type { ScienceSymbol, MilitaryResult, Cost, CardEffect, CardColor } from "./cards.js";
import type { WonderStage } from "./wonders.js";

export type Age = 1 | 2 | 3;

export const BOT_STRATEGIES = ["balanced", "science", "commerce", "civilian", "military"] as const;
export type BotStrategyId = (typeof BOT_STRATEGIES)[number];

export interface MilitaryToken {
  age: Age;
  result: MilitaryResult;
}

export interface PlayerState {
  id: string;
  name: string;
  isBot: boolean;
  botStrategy?: BotStrategyId; // archetype the bot heuristic leans toward for the whole game; undefined for the human
  wonderId: string;
  wonderSide: "A" | "B";
  wonderStagesBuilt: number;
  /** Indices of stages built so far (board order). Only ever populated for `anyOrder` wonders (currently The Great Wall) — empty for every other wonder. */
  builtWonderStageIndices: number[];
  /** Per-player override of the wonder's static stages, resolved once at setup. Only populated for wonders with `mirrors`-marked stages (currently Manneken Pis); `undefined` for every other wonder. */
  resolvedWonderStages?: WonderStage[];
  builtCardIds: string[];
  discardedCardIds: string[]; // cards this player discarded for coins (own history, for guild/UI purposes)
  coins: number;
  militaryTokens: MilitaryToken[];
  hand: string[];
  chosenScienceSymbols: ScienceSymbol[]; // symbols granted by "scienceChoice" effects, resolved at build time
  /** Leaders expansion. */
  leaderDraftPool: string[]; // cards currently circulating to this player during the pre-game draft (transient)
  leaderHand: string[]; // leaders owned but not yet recruited/built/discarded
  recruitedLeaderIds: string[]; // face-up, active leaders
  copiedLeaderId?: string; // Courtesan's Guild: id of a neighbor's leader whose effects this player also gets
  /** Cities expansion. */
  debtVp: number; // cumulative unpayable-debt penalty, always <= 0
  diplomacyTokens: number; // pending tokens; each skips this player's next military conflict resolution entirely
  /** Stonehenge Side B stage 2: the color of whichever card was spent to build that stage, captured at build time. Unset if built via a Leader (no card color available) or if the player's wonder never grants this effect. */
  markedCardColor?: CardColor;
}

export type RoundAction =
  | { type: "build"; cardId: string; payment?: PaymentPlan }
  | { type: "buildWonderStage"; cardId: string; payment?: PaymentPlan; discardPickId?: string; stageIndex?: number; mirrorStageIndex?: number }
  | { type: "discard"; cardId: string }
  | { type: "draftLeader"; cardId: string }
  | { type: "recruitLeader"; cardId: string; discardPickId?: string }
  | { type: "buildWonderStageFromLeader"; cardId: string; discardPickId?: string; stageIndex?: number; mirrorStageIndex?: number }
  | { type: "discardLeaderForCoins"; cardId: string };

export interface PaymentPlan {
  /** How the player resolves their own choice-producers: slotId -> chosen resource. */
  ownChoices: Record<string, ResourceType>;
  /** Units purchased from neighbors. */
  purchases: { resource: ResourceType; from: NeighborSide; unitCost: number }[];
}

export interface GameEvent {
  round: number;
  age: Age;
  message: string;
}

export type GamePhase = "leaderDraft" | "leaderRecruit" | "drafting" | "ageEndMilitary" | "complete";

export interface ScoreBreakdown {
  playerId: string;
  military: number;
  treasury: number;
  wonder: number;
  civil: number;
  science: number;
  guild: number;
  commerce: number;
  cities: number;
  leaders: number;
  debt: number;
  total: number;
}

export interface ExpansionOptions {
  leaders: boolean;
  cities: boolean;
}

export interface GameState {
  id: string;
  createdAt: number;
  seats: string[]; // playerIds, clockwise seating order (fixed for the whole game)
  players: Record<string, PlayerState>;
  age: Age;
  round: number; // 1..6 within the age (also reused as the round counter for leaderDraft/leaderRecruit phases)
  discardPile: string[];
  log: GameEvent[];
  phase: GamePhase;
  finalScores?: ScoreBreakdown[];
  rngSeed: number;
  expansions: ExpansionOptions;
  /**
   * Pre-shuffled decks for full-game determinism from the seed. `age1Deck` is only
   * populated (and dealt out later, once the pre-Age-I Leader draft/recruitment phases
   * finish) when the Leaders expansion delays Age I's hand deal past setup time.
   */
  futureDecks: { age1Deck?: string[]; age2Deck: string[]; age3Deck: string[] };
}

export interface HandCardView {
  cardId: string;
  buildAffordable: boolean;
  buildFree: boolean;
  /** Resource units the build cost can't cover from own production — bought from a neighbor/bank. Empty when self-sufficient (or free). */
  buildPurchases: ResourcePurchase[];
  wonderStageAffordable: boolean;
  wonderStageFree: boolean;
  wonderStagePurchases: ResourcePurchase[];
  /**
   * Present whenever building the next wonder stage requires the player to pick among
   * several options, so the client can offer a stage-choice picker — either "which of my
   * own unbuilt stages" (`ownStage`, `anyOrder` wonders like Great Wall) or "which of my
   * neighbor's Great Wall stages to mirror" (`mirrorStage`, Manneken Pis). Cost/effects are
   * inlined per-option since for `mirrorStage` they belong to the neighbor's wonder, which
   * the client has no other clean way to look up. Absent when no choice is needed.
   */
  wonderStageOptions?: { stageIndex: number; cost: Cost; effects: CardEffect[]; affordable: boolean; purchases: ResourcePurchase[] }[];
  wonderStageChoiceKind?: "ownStage" | "mirrorStage";
  alreadyBuilt: boolean; // can't build a duplicate civilian/etc. card
}

export interface LeaderHandCardView {
  cardId: string;
  recruitAffordable: boolean;
  recruitFree: boolean;
  wonderStageAffordable: boolean; // via buildWonderStageFromLeader
  /** See HandCardView.wonderStageOptions/wonderStageChoiceKind. */
  wonderStageOptions?: { stageIndex: number; cost: Cost; effects: CardEffect[]; affordable: boolean; purchases: ResourcePurchase[] }[];
  wonderStageChoiceKind?: "ownStage" | "mirrorStage";
}

/** Client-facing view: adds derived affordability info for the human's hand without leaking bot hands. */
export interface GameStateView extends Omit<GameState, "players"> {
  players: Record<
    string,
    Omit<PlayerState, "hand" | "leaderDraftPool" | "leaderHand"> & {
      handSize: number;
      leaderHandSize: number;
      leaderDraftPoolSize: number;
    }
  >;
  you: PlayerState & { handView: HandCardView[]; leaderHandView: LeaderHandCardView[] };
}
