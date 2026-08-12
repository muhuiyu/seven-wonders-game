import type { GameState, PlayerState } from "@sw/shared";

export function makePlayer(id: string, overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id,
    name: id,
    isBot: id !== "human",
    wonderId: "gizah",
    wonderSide: "A",
    wonderStagesBuilt: 0,
    builtCardIds: [],
    discardedCardIds: [],
    coins: 3,
    militaryTokens: [],
    hand: [],
    usedFreeBuildThisAge: false,
    chosenScienceSymbols: [],
    leaderDraftPool: [],
    leaderHand: [],
    recruitedLeaderIds: [],
    debtVp: 0,
    diplomacyTokens: 0,
    ...overrides,
  };
}

export function makeGameState(seats: string[], players: Record<string, PlayerState>, overrides: Partial<GameState> = {}): GameState {
  return {
    id: "test-game",
    createdAt: Date.now(),
    seats,
    players,
    age: 1,
    round: 1,
    discardPile: [],
    log: [],
    phase: "drafting",
    rngSeed: 1,
    expansions: { leaders: false, cities: false },
    futureDecks: { age2Deck: [], age3Deck: [] },
    ...overrides,
  };
}
