import type { Card, ExpansionId } from "../types/cards.js";
import type { Age } from "../types/gameState.js";
import { AGE_I_CARDS } from "./cards.ageI.js";
import { AGE_II_CARDS } from "./cards.ageII.js";
import { AGE_III_CARDS } from "./cards.ageIII.js";
import { GUILD_CARDS } from "./cards.guilds.js";
import { CITIES_I_CARDS } from "./cards.citiesI.js";
import { CITIES_II_CARDS } from "./cards.citiesII.js";
import { CITIES_III_CARDS } from "./cards.citiesIII.js";

export interface ExpansionFlags {
  leaders?: boolean;
  cities?: boolean;
}

/** Cards that only enter the deck once the game has at least this many players (default 3). */
export const MIN_PLAYERS: Record<string, number> = {
  excavation: 4,
  "forest-cave": 5,
  well: 4,
  tavern: 4,
  obelisk: 4,
  "siege-workshop": 4,
};

const AGE_I_PADDING = [
  "lumber-yard", "stone-pit", "clay-pool", "ore-vein", "timber-yard", "clay-pit",
  "glassworks", "press", "loom-good", "baths", "altar", "theatre",
  "east-trading-post", "west-trading-post", "marketplace",
  "stockade", "barracks", "guard-tower", "apothecary", "workshop", "scriptorium",
];
const AGE_II_PADDING = [
  "sawmill", "quarry", "brickyard", "foundry", "aqueduct", "temple", "statue", "courthouse",
  "forum", "caravansery", "walls", "training-ground", "stables", "archery-range",
  "dispensary", "laboratory", "library", "school",
];
const AGE_III_PADDING = [
  "pantheon", "gardens", "town-hall", "palace", "senate", "obelisk",
  "fortifications", "circus", "arsenal", "siege-workshop",
  "academy", "university", "observatory", "lodge", "study",
  "chamber-of-commerce", "arena", "lighthouse", "haven",
];

/** AGE I passes hands left, AGE II passes right, AGE III passes left again. */
export const AGE_PASS_DIRECTION: Record<Age, "left" | "right"> = { 1: "left", 2: "right", 3: "left" };

function buildDeck(cards: Card[], playerCount: number, paddingOrder: string[], targetSize: number): string[] {
  const included = cards.filter((c) => (MIN_PLAYERS[c.id] ?? 3) <= playerCount).map((c) => c.id);
  const eligiblePadding = paddingOrder.filter((id) => included.includes(id));
  const deck = [...included];
  let i = 0;
  while (deck.length < targetSize) {
    if (eligiblePadding.length === 0) throw new Error("No eligible padding cards to fill deck");
    deck.push(eligiblePadding[i % eligiblePadding.length]!);
    i++;
  }
  return deck.slice(0, targetSize);
}

export function buildAgeIDeck(playerCount: number): string[] {
  return buildDeck(AGE_I_CARDS, playerCount, AGE_I_PADDING, 7 * playerCount);
}

export function buildAgeIIDeck(playerCount: number): string[] {
  return buildDeck(AGE_II_CARDS, playerCount, AGE_II_PADDING, 7 * playerCount);
}

function eligible(cards: Card[], expansions?: ExpansionFlags): Card[] {
  return cards.filter((c) => !c.requiresExpansion || expansions?.[c.requiresExpansion as ExpansionId]);
}

export function guildCountForPlayers(playerCount: number, expansions?: ExpansionFlags): number {
  return Math.min(playerCount + 2, eligible(GUILD_CARDS, expansions).length);
}

export function buildAgeIIINonGuildDeck(playerCount: number, expansions?: ExpansionFlags): string[] {
  const target = 7 * playerCount - guildCountForPlayers(playerCount, expansions);
  return buildDeck(AGE_III_CARDS, playerCount, AGE_III_PADDING, target);
}

function fisherYates<T>(pool: T[], rng: () => number): T[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Fisher-Yates using an injected RNG so the whole game setup can be reproducible from a seed. */
export function selectGuilds(playerCount: number, rng: () => number, expansions?: ExpansionFlags): string[] {
  const pool = eligible(GUILD_CARDS, expansions).map((c) => c.id);
  return fisherYates(pool, rng).slice(0, guildCountForPlayers(playerCount, expansions));
}

const CITIES_CARDS_BY_AGE: Record<Age, Card[]> = { 1: CITIES_I_CARDS, 2: CITIES_II_CARDS, 3: CITIES_III_CARDS };

/** Cities expansion: draws `playerCount` black City cards for the given Age, to be mixed into that Age's deck (hand size becomes 8 instead of 7). */
export function selectBlackCards(age: Age, playerCount: number, rng: () => number): string[] {
  const pool = CITIES_CARDS_BY_AGE[age].map((c) => c.id);
  return fisherYates(pool, rng).slice(0, Math.min(playerCount, pool.length));
}
