import { getBuiltStageIndices, getCard, getEffectiveWonderStages, getWonderSide, type CardColor, type CardEffect, type GameState, type PlayerState, type ScoreBreakdown } from "@sw/shared";
import { countByScope, countCardsOfColor, countDefeatTokensByScope, countMilitaryTokensByScope, countRecruitedLeadersByScope, countResourceProducerUnits, countWonderStagesByScope } from "./colorCounts.js";
import { militaryVp } from "./military.js";
import { getEffectiveScienceCounts, scoreScience } from "./science.js";
import { getLeaderEffectSources } from "./effectSources.js";

function vpFromEffect(state: GameState, playerId: string, player: PlayerState, effect: CardEffect): number {
  switch (effect.kind) {
    case "vp":
      return effect.amount;
    case "vpPerCard":
      return countByScope(state, playerId, effect.color, effect.scope) * effect.perCard;
    case "vpPerWonderStage":
      return countWonderStagesByScope(state, playerId, effect.scope) * effect.perStage;
    case "vpPerDefeatToken":
      return countDefeatTokensByScope(state, playerId, effect.scope) * effect.perToken;
    case "vpAndCoinsPerCard":
      return countByScope(state, playerId, effect.color, effect.scope) * effect.vpPer;
    case "vpPerColorSet":
      return effect.colors.reduce((sum, c) => sum + countCardsOfColor(player, c), 0) * effect.perCard;
    case "vpPerMilitaryToken":
      return countMilitaryTokensByScope(state, playerId, effect.result, effect.scope) * effect.perToken;
    case "vpPerColorSetBonus":
      return Math.min(...effect.colors.map((c) => countCardsOfColor(player, c))) * effect.perSet;
    case "vpPerCoinsHeld":
      return Math.floor(player.coins / effect.coinsPerVp);
    case "vpPerRecruitedLeader":
      return countRecruitedLeadersByScope(state, playerId, effect.scope) * effect.perLeader;
    case "vpPerScienceSet": {
      const counts = getEffectiveScienceCounts(state, playerId);
      return Math.min(counts.cog, counts.compass, counts.tablet) * effect.perSet;
    }
    case "vpPerResourceProducer":
      return countResourceProducerUnits(player, effect.resource) * effect.perProducer;
    case "vpPerNeighborCardOfMarkedColor":
      return player.markedCardColor ? countByScope(state, playerId, player.markedCardColor, "bothNeighbors") * effect.perCard : 0;
    default:
      return 0;
  }
}

export function sumVpForColor(state: GameState, playerId: string, color: CardColor): number {
  const player = state.players[playerId]!;
  let total = 0;
  for (const cardId of player.builtCardIds) {
    const card = getCard(cardId);
    if (card.color !== color) continue;
    for (const effect of card.effects) total += vpFromEffect(state, playerId, player, effect);
  }
  return total;
}

/** VP granted directly by this player's recruited (or Courtesan's-Guild-copied) Leaders — not tied to a card color. */
export function leaderVp(state: GameState, playerId: string): number {
  const player = state.players[playerId]!;
  let total = 0;
  for (const effect of getLeaderEffectSources(player)) total += vpFromEffect(state, playerId, player, effect);
  return total;
}

export function wonderVp(state: GameState, playerId: string): number {
  const player = state.players[playerId]!;
  const wonderSide = getWonderSide(player.wonderId, player.wonderSide);
  let total = 0;
  const stages = getEffectiveWonderStages(player, wonderSide);
  for (const i of getBuiltStageIndices(player, wonderSide)) {
    const stage = stages[i];
    if (!stage) continue;
    for (const effect of stage.effects) total += vpFromEffect(state, playerId, player, effect);
  }
  return total;
}

/** Non-military running estimate of a player's value, used by the bot heuristic to score candidate moves mid-game. */
export function estimatePlayerValue(state: GameState, playerId: string): number {
  const player = state.players[playerId]!;
  const wonder = wonderVp(state, playerId);
  const civil = sumVpForColor(state, playerId, "blue");
  const science = scoreScience(getEffectiveScienceCounts(state, playerId));
  const guild = sumVpForColor(state, playerId, "purple");
  const commerce = sumVpForColor(state, playerId, "yellow");
  const cities = sumVpForColor(state, playerId, "black");
  const leaders = leaderVp(state, playerId);
  const treasury = player.coins / 3;
  return wonder + civil + science + guild + commerce + cities + leaders + treasury + player.debtVp;
}

export function computeFinalScore(state: GameState): ScoreBreakdown[] {
  return state.seats.map((playerId) => {
    const player = state.players[playerId]!;
    const military = militaryVp(player);
    const treasury = Math.floor(player.coins / 3);
    const wonder = wonderVp(state, playerId);
    const civil = sumVpForColor(state, playerId, "blue");
    const science = scoreScience(getEffectiveScienceCounts(state, playerId));
    const guild = sumVpForColor(state, playerId, "purple");
    const commerce = sumVpForColor(state, playerId, "yellow");
    const cities = sumVpForColor(state, playerId, "black");
    const leaders = leaderVp(state, playerId);
    const debt = player.debtVp;
    const total = military + treasury + wonder + civil + science + guild + commerce + cities + leaders + debt;
    return { playerId, military, treasury, wonder, civil, science, guild, commerce, cities, leaders, debt, total };
  });
}
