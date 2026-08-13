import { getLeaderCard, getWonderSide, type GameState, type GameStateView, type HandCardView, type LeaderHandCardView } from "@sw/shared";
import { canBuildCard, canBuildWonderStage, getAffordability, getEffectiveCost } from "./actionResolution.js";
import { getLeaderRecruitCost } from "./leaders.js";

export function buildView(state: GameState, viewerId: string): GameStateView {
  const you = state.players[viewerId]!;

  const handView: HandCardView[] = you.hand.map((cardId) => {
    const buildCheck = canBuildCard(state, viewerId, cardId);
    const stageCheck = canBuildWonderStage(state, viewerId, cardId);
    return {
      cardId,
      buildAffordable: buildCheck.legal,
      buildFree: buildCheck.legal && buildCheck.free,
      buildPurchases: buildCheck.payment?.purchases ?? [],
      wonderStageAffordable: stageCheck.legal,
      wonderStageFree: false,
      wonderStagePurchases: stageCheck.payment?.purchases ?? [],
      alreadyBuilt: you.builtCardIds.includes(cardId),
    };
  });

  const leaderHandView: LeaderHandCardView[] = you.leaderHand.map((cardId) => {
    const leader = getLeaderCard(cardId);
    const cost = getLeaderRecruitCost(state, viewerId, leader.coinCost);
    const nextStageCost = getEffectiveWonderStageCost(state, viewerId);
    return {
      cardId,
      recruitAffordable: you.coins >= cost,
      recruitFree: cost === 0,
      wonderStageAffordable: nextStageCost !== null && getAffordability(state, viewerId, nextStageCost).affordable,
    };
  });

  const players: GameStateView["players"] = {};
  for (const [id, p] of Object.entries(state.players)) {
    const { hand, leaderDraftPool, leaderHand, ...rest } = p;
    players[id] = { ...rest, handSize: hand.length, leaderHandSize: leaderHand.length, leaderDraftPoolSize: leaderDraftPool.length };
  }

  const { players: _omit, ...stateRest } = state;
  return {
    ...stateRest,
    players,
    you: { ...you, handView, leaderHandView },
  };
}

function getEffectiveWonderStageCost(state: GameState, playerId: string) {
  const player = state.players[playerId]!;
  const wonderSide = getWonderSide(player.wonderId, player.wonderSide);
  const stage = wonderSide.stages[player.wonderStagesBuilt];
  return stage ? getEffectiveCost(player, stage.cost, "wonderStage") : null;
}
