import type { Card } from "../types/cards.js";
import { AGE_I_CARDS } from "./cards.ageI.js";
import { AGE_II_CARDS } from "./cards.ageII.js";
import { AGE_III_CARDS } from "./cards.ageIII.js";
import { GUILD_CARDS } from "./cards.guilds.js";
import { CITIES_I_CARDS } from "./cards.citiesI.js";
import { CITIES_II_CARDS } from "./cards.citiesII.js";
import { CITIES_III_CARDS } from "./cards.citiesIII.js";

export const ALL_CARDS: Card[] = [
  ...AGE_I_CARDS,
  ...AGE_II_CARDS,
  ...AGE_III_CARDS,
  ...GUILD_CARDS,
  ...CITIES_I_CARDS,
  ...CITIES_II_CARDS,
  ...CITIES_III_CARDS,
];

export const CARDS_BY_ID: Record<string, Card> = Object.fromEntries(ALL_CARDS.map((c) => [c.id, c]));

export function getCard(id: string): Card {
  const card = CARDS_BY_ID[id];
  if (!card) throw new Error(`Unknown card id: ${id}`);
  return card;
}
