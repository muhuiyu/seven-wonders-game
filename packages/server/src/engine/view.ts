import { getEffectiveWonderStages, getLeaderCard, getUnbuiltStageIndices, getWonderSide, type GameState, type GameStateView, type HandCardView, type LeaderHandCardView, type WonderStage } from "@sw/shared";
import { canBuildCard, canBuildWonderStage, getAffordability, getEffectiveCost, getPendingGreatWallMirror } from "./actionResolution.js";
import { getLeaderRecruitCost } from "./leaders.js";

/**
 * Whichever wonder-stage choice (if any) is needed to build `you`'s next stage right now:
 * "ownStage" for a Great Wall player picking which of their own unbuilt stages to build,
 * "mirrorStage" for a Manneken Pis player picking which of a Great-Wall-neighbor's 4
 * stages to copy. `null` when the next stage is a single fixed (or already-resolved)
 * cost/effect — the common case for every other wonder. Affordability here doesn't depend
 * on which card funds the build (any hand card works, and leader-funded builds don't need
 * one at all), so this computes cost/affordability directly rather than going through
 * `canBuildWonderStage`'s "card in hand" check.
 */
function getWonderStageChoice(
  state: GameState,
  viewerId: string,
): { kind: "ownStage" | "mirrorStage"; options: NonNullable<HandCardView["wonderStageOptions"]> } | null {
  const you = state.players[viewerId]!;
  const wonderSide = getWonderSide(you.wonderId, you.wonderSide);

  const toOption = (stageIndex: number, stage: WonderStage) => {
    const payment = getAffordability(state, viewerId, getEffectiveCost(you, stage.cost, "wonderStage"));
    return { stageIndex, cost: stage.cost, effects: stage.effects, affordable: payment.affordable, purchases: payment.purchases };
  };

  if (wonderSide.anyOrder) {
    const stages = getEffectiveWonderStages(you, wonderSide);
    const options = getUnbuiltStageIndices(you, wonderSide).map((stageIndex) => toOption(stageIndex, stages[stageIndex]!));
    return { kind: "ownStage", options };
  }

  const mirrorNeighborSide = getPendingGreatWallMirror(state, viewerId, wonderSide, you.wonderStagesBuilt);
  if (mirrorNeighborSide) {
    const options = mirrorNeighborSide.stages.map((stage, mirrorStageIndex) => toOption(mirrorStageIndex, stage));
    return { kind: "mirrorStage", options };
  }

  return null;
}

export function buildView(state: GameState, viewerId: string): GameStateView {
  const you = state.players[viewerId]!;
  const stageChoice = getWonderStageChoice(state, viewerId);

  const handView: HandCardView[] = you.hand.map((cardId) => {
    const buildCheck = canBuildCard(state, viewerId, cardId);

    let wonderStageAffordable: boolean;
    let wonderStagePurchases: HandCardView["wonderStagePurchases"];
    if (stageChoice) {
      wonderStageAffordable = stageChoice.options.some((o) => o.affordable);
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
      wonderStageOptions: stageChoice?.options,
      wonderStageChoiceKind: stageChoice?.kind,
      alreadyBuilt: you.builtCardIds.includes(cardId),
    };
  });

  let leaderStageAffordable: boolean;
  if (stageChoice) {
    leaderStageAffordable = stageChoice.options.some((o) => o.affordable);
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
      wonderStageOptions: stageChoice?.options,
      wonderStageChoiceKind: stageChoice?.kind,
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
  const stage = getEffectiveWonderStages(player, wonderSide)[player.wonderStagesBuilt];
  return stage && stage.cost.length > 0 ? getEffectiveCost(player, stage.cost, "wonderStage") : null;
}
