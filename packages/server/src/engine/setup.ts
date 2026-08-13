import { randomUUID } from "node:crypto";
import {
  buildAgeIDeck,
  buildAgeIIDeck,
  buildAgeIIINonGuildDeck,
  getAvailableWonderIds,
  LEADER_IDS,
  selectBlackCards,
  selectGuilds,
  type ExpansionOptions,
  type GameState,
  type PlayerState,
} from "@sw/shared";
import { mulberry32, shuffle } from "./rng.js";
import { assignBotStrategy } from "../bot/strategyAssignment.js";

export interface SetupOptions {
  playerCount: number;
  humanName: string;
  humanWonderId?: string;
  humanWonderSide?: "A" | "B";
  seed?: number;
  expansions?: { leaders?: boolean; cities?: boolean };
}

const BASE_STARTING_COINS = 3;
const LEADERS_STARTING_COINS = 6; // Leaders expansion rule: everyone starts with 6 coins instead of 3.
const LEADER_DRAFT_HAND_SIZE = 4;
const BOT_NAMES = ["Athenea", "Cyrus", "Livia", "Kaan", "Nefer", "Boudica"];

export function createGame(opts: SetupOptions): GameState {
  const { playerCount } = opts;
  if (playerCount < 3 || playerCount > 7) throw new Error("playerCount must be between 3 and 7");

  const expansions: ExpansionOptions = { leaders: opts.expansions?.leaders ?? false, cities: opts.expansions?.cities ?? false };

  const seed = opts.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rng = mulberry32(seed);

  const availableWonderIds = getAvailableWonderIds(expansions);
  const humanWonderId = opts.humanWonderId ?? shuffle([...availableWonderIds], rng)[0]!;
  if (!availableWonderIds.includes(humanWonderId)) {
    throw new Error(`Unknown wonder id: ${humanWonderId}`);
  }
  const remainingWonders = shuffle(
    availableWonderIds.filter((w) => w !== humanWonderId),
    rng,
  );
  const botWonderIds = remainingWonders.slice(0, playerCount - 1);

  const humanId = "human";
  const botIds = botWonderIds.map((_, i) => `bot-${i + 1}`);
  const seats = shuffle([humanId, ...botIds], rng);
  const botNames = new Map(botIds.map((botId, i) => [botId, BOT_NAMES[i % BOT_NAMES.length]!]));

  const wonderAssignment = new Map<string, { id: string; side: "A" | "B" }>();
  wonderAssignment.set(humanId, { id: humanWonderId, side: opts.humanWonderSide ?? (rng() < 0.5 ? "A" : "B") });
  botIds.forEach((botId, i) => {
    wonderAssignment.set(botId, { id: botWonderIds[i]!, side: rng() < 0.5 ? "A" : "B" });
  });

  const ageIDeck = shuffle(buildAgeIDeck(playerCount), rng);
  const ageIIDeck = shuffle(buildAgeIIDeck(playerCount), rng);
  const guildIds = selectGuilds(playerCount, rng, expansions);
  const ageIIIDeck = shuffle([...buildAgeIIINonGuildDeck(playerCount, expansions), ...guildIds], rng);

  if (expansions.cities) {
    // Mix `playerCount` black City cards into each Age's deck, bringing hand size from 7 to 8.
    ageIDeck.push(...selectBlackCards(1, playerCount, rng));
    ageIIDeck.push(...selectBlackCards(2, playerCount, rng));
    ageIIIDeck.push(...selectBlackCards(3, playerCount, rng));
    shuffle(ageIDeck, rng);
    shuffle(ageIIDeck, rng);
    shuffle(ageIIIDeck, rng);
  }
  const handSize = expansions.cities ? 8 : 7;

  const leaderDraftHands = new Map<string, string[]>();
  if (expansions.leaders) {
    const shuffledLeaders = shuffle([...LEADER_IDS], rng);
    seats.forEach((playerId, i) => {
      leaderDraftHands.set(playerId, shuffledLeaders.slice(i * LEADER_DRAFT_HAND_SIZE, i * LEADER_DRAFT_HAND_SIZE + LEADER_DRAFT_HAND_SIZE));
    });
  }

  const startingCoins = expansions.leaders ? LEADERS_STARTING_COINS : BASE_STARTING_COINS;

  const players: Record<string, PlayerState> = {};
  seats.forEach((playerId, i) => {
    const wonder = wonderAssignment.get(playerId)!;
    const hand = expansions.leaders ? [] : ageIDeck.slice(i * handSize, i * handSize + handSize);
    const isBot = playerId !== humanId;
    const botStrategy = isBot ? assignBotStrategy(wonder.id, rng) : undefined;
    if (botStrategy) console.log(`[bot-strategy] ${playerId} (${wonder.id}) -> ${botStrategy}`);
    players[playerId] = {
      id: playerId,
      name: playerId === humanId ? opts.humanName : botNames.get(playerId)!,
      isBot,
      botStrategy,
      wonderId: wonder.id,
      wonderSide: wonder.side,
      wonderStagesBuilt: 0,
      builtCardIds: [],
      discardedCardIds: [],
      coins: startingCoins,
      militaryTokens: [],
      hand,
      usedFreeBuildThisAge: false,
      chosenScienceSymbols: [],
      leaderDraftPool: leaderDraftHands.get(playerId) ?? [],
      leaderHand: [],
      recruitedLeaderIds: [],
      debtVp: 0,
      diplomacyTokens: 0,
    };
  });

  return {
    id: randomUUID(),
    createdAt: Date.now(),
    seats,
    players,
    age: 1,
    round: 1,
    discardPile: [],
    log: [{ round: 1, age: 1, message: "The game begins." }],
    phase: expansions.leaders ? "leaderDraft" : "drafting",
    rngSeed: seed,
    expansions,
    futureDecks: { age1Deck: expansions.leaders ? ageIDeck : undefined, age2Deck: ageIIDeck, age3Deck: ageIIIDeck },
  };
}
