import type { ResourceType, ScienceSymbol } from "@sw/shared"

import wood from "../assets/icons/wood.png"
import stone from "../assets/icons/stone.png"
import ore from "../assets/icons/ore.png"
import clay from "../assets/icons/clay.png"
import glass from "../assets/icons/glass.png"
import loom from "../assets/icons/loom.png"
import papyrus from "../assets/icons/papyrus.png"
import cog from "../assets/icons/cog.png"
import compass from "../assets/icons/compass.png"
import tablet from "../assets/icons/tablet.png"
import shield from "../assets/icons/shield.png"
import diplomacyToken from "../assets/icons/diplomacy-token.png"
import victoryPoint1 from "../assets/icons/victory-point-1.png"
import victoryPoint2 from "../assets/icons/victory-point-2.png"
import victoryPoint3 from "../assets/icons/victory-point-3.png"
import victoryPoint4 from "../assets/icons/victory-point-4.png"
import victoryPoint5 from "../assets/icons/victory-point-5.png"
import victoryPoint6 from "../assets/icons/victory-point-6.png"
import victoryPoint7 from "../assets/icons/victory-point-7.png"
import victoryPoint8 from "../assets/icons/victory-point-8.png"
import victoryPoint14 from "../assets/icons/victory-point-14.png" // Special icon for Wonder Petra
import coin1 from "../assets/icons/coin-1.png"
import coin2 from "../assets/icons/coin-2.png"
import coin3 from "../assets/icons/coin-3.png"
import coin4 from "../assets/icons/coin-4.png"
import coin5 from "../assets/icons/coin-5.png"
import coin6 from "../assets/icons/coin-6.png"
import coin7 from "../assets/icons/coin-7.png"
import coin8 from "../assets/icons/coin-8.png"
import coin9 from "../assets/icons/coin-9.png"
import coin10 from "../assets/icons/coin-10.png"
import coin11 from "../assets/icons/coin-11.png"
import coin12 from "../assets/icons/coin-12.png"
import coin13 from "../assets/icons/coin-13.png"
import coin14 from "../assets/icons/coin-14.png"
import coin15 from "../assets/icons/coin-15.png"
import coinBlank from "../assets/icons/coin-blank.png"
import coinLoss1 from "../assets/icons/coin-loss-1.png"
import coinLoss2 from "../assets/icons/coin-loss-2.png"
import coinLoss3 from "../assets/icons/coin-loss-3.png"
import coinLoss4 from "../assets/icons/coin-loss-4.png"
import coinLoss5 from "../assets/icons/coin-loss-5.png"
import coinLoss6 from "../assets/icons/coin-loss-6.png"
import coinLoss7 from "../assets/icons/coin-loss-7.png"
import coinLoss8 from "../assets/icons/coin-loss-8.png"
import coinLoss9 from "../assets/icons/coin-loss-9.png"
import coinLoss10 from "../assets/icons/coin-loss-10.png"
import copyNeighborScience from "../assets/icons/copy-neighbor-science.png"
import buildFromDiscard from "../assets/icons/build-from-discard.png"
import tradingPostLeft from "../assets/icons/trading-post-left.png"
import tradingPostRight from "../assets/icons/trading-post-right.png"

/** Real card-art icons sourced from the 7 Wonders wiki (static.wikia.nocookie.net), used in
 *  place of emoji for resources, science symbols, and military shields. Coins and victory
 *  points stay emoji — the wiki only hosts those with a digit baked into the icon. */
export const RESOURCE_IMG: Record<ResourceType, string> = {
  wood,
  stone,
  ore,
  clay,
  glass,
  loom,
  papyrus,
}

export const SCIENCE_IMG: Record<ScienceSymbol, string> = {
  cog,
  compass,
  tablet,
}

export const SHIELD_IMG = shield

export const DIPLOMACY_TOKEN_IMG = diplomacyToken

/** Unnumbered coin icon for displaying a running coin total as "🪙 N" — avoids needing a
 *  distinct numbered icon (or a text fallback) for every possible total a player can hold. */
export const COIN_BLANK_IMG = coinBlank

/** Returns the matching victory-point icon, or undefined if we don't have art for this amount
 *  (only 1-8 and the special-cased 14 are available) — callers should fall back to text. */
export function victoryPointIcon(points: number): string | undefined {
  if (points === 14) return victoryPoint14 // Special case for Wonder Petra

  return ({
    1: victoryPoint1,
    2: victoryPoint2,
    3: victoryPoint3,
    4: victoryPoint4,
    5: victoryPoint5,
    6: victoryPoint6,
    7: victoryPoint7,
    8: victoryPoint8,
  } as Record<number, string>)[points]
}

/** Returns the matching coin icon, or undefined if we don't have art for this amount (only
 *  1-15 are available) — callers should fall back to text. */
export function coinIcon(amount: number): string | undefined {
  return ({
    1: coin1,
    2: coin2,
    3: coin3,
    4: coin4,
    5: coin5,
    6: coin6,
    7: coin7,
    8: coin8,
    9: coin9,
    10: coin10,
    11: coin11,
    12: coin12,
    13: coin13,
    14: coin14,
    15: coin15,
  } as Record<number, string>)[amount]
}

export const COPY_NEIGHBOR_SCIENCE_ICON = copyNeighborScience

export const BUILD_FROM_DISCARD_ICON = buildFromDiscard

/** Returns the matching "cracked coin" loss icon, or undefined if we don't have art for this
 *  amount (only 1-10 are available) — callers should fall back to text. */
export function coinLossIcon(amount: number): string | undefined {
  return ({
    1: coinLoss1,
    2: coinLoss2,
    3: coinLoss3,
    4: coinLoss4,
    5: coinLoss5,
    6: coinLoss6,
    7: coinLoss7,
    8: coinLoss8,
    9: coinLoss9,
    10: coinLoss10,
  } as Record<number, string>)[amount]
}
