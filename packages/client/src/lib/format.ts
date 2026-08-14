import { getCard, getLeaderCard, getWonderSide, type Age, type Card, type CardColor, type CardEffect, type Cost, type MilitaryToken, type ResourceType, type ScienceSymbol } from "@sw/shared";
import { COLOR_EMOJI } from "./colors";

export const RESOURCE_ICON: Record<ResourceType, string> = {
  wood: "🪵",
  stone: "🪨",
  ore: "⛏️",
  clay: "🧱",
  glass: "🔷",
  loom: "🧵",
  papyrus: "📜",
};

export const SCIENCE_ICON: Record<ScienceSymbol, string> = {
  cog: "⚙️",
  compass: "🧭",
  tablet: "📐",
};

/** Matches the official 7 Wonders card-category names (see the wiki's color-group headers),
 *  used both in plain-text descriptions and as the highlighted phrase in the rich renderer. */
export const COLOR_LABEL: Record<CardColor, string> = {
  brown: `${COLOR_EMOJI.brown} Raw Material Buildings`,
  grey: `${COLOR_EMOJI.grey} Manufactured Buildings`,
  blue: `${COLOR_EMOJI.blue} Civilian Buildings`,
  yellow: `${COLOR_EMOJI.yellow} Commercial Buildings`,
  red: `${COLOR_EMOJI.red} Military Buildings`,
  green: `${COLOR_EMOJI.green} Science Buildings`,
  purple: `${COLOR_EMOJI.purple} Guilds`,
  black: `${COLOR_EMOJI.black} City Buildings`,
};

export function describeCost(cost: Cost): string {
  const parts = cost.map((option) => {
    const bits: string[] = [];
    if (option.coins) bits.push(`🪙${option.coins}`);
    if (option.resources) {
      for (const [res, qty] of Object.entries(option.resources)) {
        bits.push(`${RESOURCE_ICON[res as ResourceType]}${qty && qty > 1 ? qty : ""}`);
      }
    }
    return bits.length === 0 ? "Free" : bits.join(" ");
  });
  return parts.join(" or ");
}

const SCOPE_LABEL: Record<string, string> = {
  self: "your city",
  leftNeighbor: "your left neighbor's city",
  rightNeighbor: "your right neighbor's city",
  bothNeighbors: "each neighboring city",
};

export function describeEffect(effect: CardEffect): string {
  switch (effect.kind) {
    case "resource":
      return `Produce ${effect.production.qty > 1 ? effect.production.qty + "x " : ""}${effect.production.options.map((r) => RESOURCE_ICON[r]).join("/")}`;
    case "shields":
      return `+${effect.count} 🛡️ shield${effect.count > 1 ? "s" : ""}`;
    case "science":
      return `+1 ${SCIENCE_ICON[effect.symbol]}`;
    case "scienceChoice":
      return `+1 science symbol of your choice`;
    case "coins":
      return `+${effect.amount} 🪙`;
    case "vp":
      return `+${effect.amount} 🏆 VP`;
    case "vpPerCard":
      return `+${effect.perCard} 🏆 per ${COLOR_LABEL[effect.color]} card in ${SCOPE_LABEL[effect.scope]}`;
    case "coinsPerCard":
      return `+${effect.perCard} 🪙 per ${COLOR_LABEL[effect.color]} card in ${SCOPE_LABEL[effect.scope]}`;
    case "vpAndCoinsPerCard":
      return `+${effect.coinsPer} 🪙 now, +${effect.vpPer} 🏆 per ${COLOR_LABEL[effect.color]} card in ${SCOPE_LABEL[effect.scope]}`;
    case "vpPerWonderStage":
      return `+${effect.perStage} 🏆 per Wonder stage built in ${SCOPE_LABEL[effect.scope]}`;
    case "vpPerDefeatToken":
      return `+${effect.perToken} 🏆 per defeat token in ${SCOPE_LABEL[effect.scope]}`;
    case "vpPerColorSet":
      return `+${effect.perCard} 🏆 per ${effect.colors.map((c) => COLOR_LABEL[c]).join("/")} card in your city`;
    case "tradeDiscount":
      return `Trade ${effect.resources.map((r) => RESOURCE_ICON[r]).join("")} from ${effect.sides.join("/")} neighbor for ${effect.unitCost} 🪙`;
    case "copyGuild":
      return `Copy a neighboring Guild card`;
    case "freeBuildFirstOfEachColor":
      return `Build the first card of each color in your city for free`;
    case "freeBuildFirstCardOfAge":
      return `The first card you build each Age is free`;
    case "freeBuildLastCardOfAge":
      return `The last card you build each Age is free`;
    case "playSeventhCard":
      return `Play your last Age card as a bonus turn instead of discarding it`;
    case "extraTurn":
      return `Take another turn immediately`;
    case "buildFromDiscardPile":
      return `Build a free card of your choice from the discard pile`;
    case "diplomacyToken":
      return `Gain a Diplomacy token (skip your next military conflict)`;
    case "opponentsPayOrDebt":
      return `Every other player pays ${effect.amount} 🪙 or takes Debt`;
    case "opponentsPayPerOwnMetric":
      return `Every other player pays ${effect.perUnit} 🪙 per ${effect.metric === "wonderStagesBuilt" ? "Wonder stage" : "military victory"} they have`;
    case "bankGrantSelfAndNeighbors":
      return `+${effect.self} 🪙 for you, +${effect.neighbors} 🪙 for each neighbor`;
    case "tradeRebate":
      return `Refund ${effect.amount} 🪙 the first time you buy from your ${effect.side} neighbor this turn`;
    case "dynamicResource":
      return effect.mode === "matchOwn" ? `Produce 1 extra unit of a resource you already produce` : `Produce 1 unit of a resource you don't already produce`;
    case "copyNeighborScienceSymbol":
      return `Copy 1 science symbol from a neighboring Science card`;
    case "vpPerMilitaryToken":
      return `+${effect.perToken} 🏆 per military ${effect.result} token in ${SCOPE_LABEL[effect.scope]}`;
    case "coinsPerMilitaryToken":
      return `+${effect.amount} 🪙 per military ${effect.result} token`;
    case "buildDiscount":
      return `Build ${effect.appliesTo === "wonderStage" ? "Wonder stages" : COLOR_LABEL[effect.appliesTo]} for ${effect.units} fewer resource${effect.units > 1 ? "s" : ""}`;
    case "freeWonderStageResourceCost":
      return `Build Wonder stages ignoring their resource cost`;
    case "bankPurchase":
      return `Once per turn, buy 1 resource from the bank for ${effect.unitCost} 🪙`;
    case "neighborPurchaseRebate":
      return `Refund ${effect.amount} 🪙 per neighbor you trade with this turn`;
    case "vpPerColorSetBonus":
      return `+${effect.perSet} 🏆 per complete set of {${effect.colors.map((c) => COLOR_LABEL[c]).join(", ")}} in your city`;
    case "freeLeaderRecruitment":
      return `Future Leader recruitment costs 0 🪙`;
    case "coinsOnMilitaryWin":
      return `+${effect.amount} 🪙 whenever you win a military conflict`;
    case "freeBuildForColor":
      return `Build ${COLOR_LABEL[effect.color]} ignoring their resource cost`;
    case "recycleDiscardOnRecruit":
      return `Build a free card of your choice from the discard pile`;
    case "redirectDefeatToken":
      return `Your defeat tokens are instead given to your victorious neighbor`;
    case "coinsOnChainBuild":
      return `+${effect.amount} 🪙 whenever you build for free via chaining`;
    case "coinsOnColorBuild":
      return `+${effect.amount} 🪙 whenever you build a ${COLOR_LABEL[effect.color]} card`;
    case "vpPerCoinsHeld":
      return `+1 🏆 per ${effect.coinsPerVp} 🪙 held at game end`;
    case "vpPerRecruitedLeader":
      return `+${effect.perLeader} 🏆 per recruited Leader in ${SCOPE_LABEL[effect.scope]}`;
    case "vpPerScienceSet":
      return `+${effect.perSet} 🏆 per complete science symbol set`;
    case "copyNeighborLeader":
      return `Gain the effects of one recruited Leader in a neighboring city`;
    default:
      return "";
  }
}

export function describeCard(card: Card): string {
  return card.effects.map(describeEffect).join(" · ");
}

export function cardById(id: string) {
  return getCard(id);
}

export function leaderById(id: string) {
  return getLeaderCard(id);
}

/** Cards this one chains from (built for free if you already have one of these). */
export function chainParents(card: Card): Card[] {
  return (card.chainFrom ?? []).map(getCard);
}

/** Cards this one unlocks a free build of, in a later Age. */
export function chainChildren(card: Card): Card[] {
  return (card.chainUnlocks ?? []).map(getCard);
}

export function wonderSideOf(wonderId: string, side: "A" | "B") {
  return getWonderSide(wonderId, side);
}

export function countByColor(builtCardIds: string[]): Partial<Record<CardColor, number>> {
  const counts: Partial<Record<CardColor, number>> = {};
  for (const id of builtCardIds) {
    const color = getCard(id).color;
    counts[color] = (counts[color] ?? 0) + 1;
  }
  return counts;
}

const AGE_TOKEN_VALUE: Record<Age, number> = { 1: 1, 2: 3, 3: 5 };

/** Groups a player's military tokens by their scored VP value (win tokens: +1/+3/+5 by Age,
 *  lose tokens: always -1, tie tokens: 0), sorted best-first. */
export function summarizeMilitaryTokens(tokens: MilitaryToken[]): { value: number; count: number }[] {
  const counts = new Map<number, number>();
  for (const t of tokens) {
    const value = t.result === "win" ? AGE_TOKEN_VALUE[t.age] : t.result === "lose" ? -1 : 0;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[0] - a[0]).map(([value, count]) => ({ value, count }));
}

export function estimateShields(builtCardIds: string[], wonderId: string, wonderSide: "A" | "B", wonderStagesBuilt: number): number {
  let total = 0;
  for (const id of builtCardIds) {
    for (const effect of getCard(id).effects) if (effect.kind === "shields") total += effect.count;
  }
  const side = getWonderSide(wonderId, wonderSide);
  for (let i = 0; i < wonderStagesBuilt; i++) {
    for (const effect of side.stages[i]?.effects ?? []) if (effect.kind === "shields") total += effect.count;
  }
  return total;
}
