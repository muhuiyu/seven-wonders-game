import { getLeaderCard, getUnbuiltStageIndices, getWonderSide, type GameState, type GameStateView, type HandCardView, type LeaderHandCardView } from "@sw/shared";
import { canBuildCard, canBuildWonderStage, getAffordability, getEffectiveCost } from "./actionResolution.js";
import { getLeaderRecruitCost } from "./leaders.js";

export function buildView(state: GameState, viewerId: string): GameStateView {
  const you = state.players[viewerId]!;
  const wonderSide = getWonderSide(you.wonderId, you.wonderSide);

  const handView: HandCardView[] = you.hand.map((cardId) => {
    const buildCheck = canBuildCard(state, viewerId, cardId);

    let wonderStageAffordable: boolean;
    let wonderStagePurchases: HandCardView["wonderStagePurchases"];
    let wonderStageOptions: HandCardView["wonderStageOptions"];
    if (wonderSide.anyOrder) {
      wonderStageOptions = getUnbuiltStageIndices(you, wonderSide).map((stageIndex) => {
        const c = canBuildWonderStage(state, viewerId, cardId, stageIndex);
        return { stageIndex, affordable: c.legal, purchases: c.payment?.purchases ?? [] };
      });
      wonderStageAffordable = wonderStageOptions.some((o) => o.affordable);
      wonderStagePurchases = [];
    } else {
      const stageCheck = canBuildWonderStage(state, viewerId, cardId);
      wonderStageAffordable = stageCheck.legal;
      wonderStagePurchases = stageCheck.payment?.purchases ?? [];
    }

    return {
      cardId,
      buildAffordable: buildCheck.legal,
      buildFree: buildCheck.legal && buildCheck.free,
      buildPurchases: buildCheck.payment?.purchases ?? [],
      wonderStageAffordable,
      wonderStageFree: false,
      wonderStagePurchases,
      wonderStageOptions,
      alreadyBuilt: you.builtCardIds.includes(cardId),
    };
  });

  let leaderStageAffordable: boolean;
  let leaderWonderStageOptions: LeaderHandCardView["wonderStageOptions"];
  if (wonderSide.anyOrder) {
    leaderWonderStageOptions = getUnbuiltStageIndices(you, wonderSide).map((stageIndex) => {
      const stage = wonderSide.stages[stageIndex]!;
      const affordable = getAffordability(state, viewerId, getEffectiveCost(you, stage.cost, "wonderStage")).affordable;
      return { stageIndex, affordable };
    });
    leaderStageAffordable = leaderWonderStageOptions.some((o) => o.affordable);
  } else {
    const nextStageCost = getEffectiveWonderStageCost(state, viewerId);
    leaderStageAffordable = nextStageCost !== null && getAffordability(state, viewerId, nextStageCost).affordable;
  }

  const leaderHandView: LeaderHandCardView[] = you.leaderHand.map((cardId) => {
    const leader = getLeaderCard(cardId);
    const cost = getLeaderRecruitCost(state, viewerId, leader.coinCost);
    return {
      cardId,
      recruitAffordable: you.coins >= cost,
      recruitFree: cost === 0,
      wonderStageAffordable: leaderStageAffordable,
      wonderStageOptions: leaderWonderStageOptions,
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
