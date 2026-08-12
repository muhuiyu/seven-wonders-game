import type { CardEffect } from "./cards.js";

/** Leaders expansion card. Coin-only cost, no age/color/chain — recruited via the Recruitment phase, not built during a normal turn. */
export interface LeaderCard {
  id: string;
  name: string;
  coinCost: number;
  effects: CardEffect[];
  /** Filename (e.g. "alexander.png") of this leader's artwork inside packages/client/public/cards/. Falls back to a placeholder when absent. */
  image?: string;
}
