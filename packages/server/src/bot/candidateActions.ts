import { getEffectiveWonderStages, getUnbuiltStageIndices, getWonderSide, type Cost, type GameState, type RoundAction } from "@sw/shared";
import { canBuildCard, canBuildWonderStage, getAffordability, getEffectiveCost, getPendingGreatWallMirror } from "../engine/actionResolution.js";

export function enumerateCandidateActions(state: GameState, playerId: string): RoundAction[] {
  const player = state.players[playerId]!;
  const candidates: RoundAction[] = [];
  const wonderSide = getWonderSide(player.wonderId, player.wonderSide);

  for (const cardId of player.hand) {
    if (canBuildCard(state, playerId, cardId).legal) candidates.push({ type: "build", cardId });
    if (wonderSide.anyOrder) {
      for (const stageIndex of getUnbuiltStageIndices(player, wonderSide)) {
        if (canBuildWonderStage(state, playerId, cardId, stageIndex).legal) candidates.push({ type: "buildWonderStage", cardId, stageIndex });
      }
    } else {
      const mirrorNeighborSide = getPendingGreatWallMirror(state, playerId, wonderSide, player.wonderStagesBuilt);
      if (mirrorNeighborSide) {
        mirrorNeighborSide.stages.forEach((_, mirrorStageIndex) => {
          if (canBuildWonderStage(state, playerId, cardId, undefined, mirrorStageIndex).legal) {
            candidates.push({ type: "buildWonderStage", cardId, mirrorStageIndex });
          }
        });
      } else if (canBuildWonderStage(state, playerId, cardId).legal) {
        candidates.push({ type: "buildWonderStage", cardId });
      }
    }
    candidates.push({ type: "discard", cardId });
  }

  return candidates;
}

/** Every leader in the player's current draft pool — picking one is the only legal move each draft round. */
export function enumerateLeaderDraftCandidates(state: GameState, playerId: string): RoundAction[] {
  return state.players[playerId]!.leaderDraftPool.map((cardId) => ({ type: "draftLeader", cardId }));
}

/** For each leader in hand: recruit / fund an affordable wonder stage / discard for coins. */
export function enumerateLeaderRecruitCandidates(state: GameState, playerId: string): RoundAction[] {
  const player = state.players[playerId]!;
  const candidates: RoundAction[] = [];
  const wonderSide = getWonderSide(player.wonderId, player.wonderSide);
  const affordable = (cost: Cost) => getAffordability(state, playerId, getEffectiveCost(player, cost, "wonderStage")).affordable;

  let fundableStages: { stageIndex?: number; mirrorStageIndex?: number }[];
  if (wonderSide.anyOrder) {
    const stages = getEffectiveWonderStages(player, wonderSide);
    fundableStages = getUnbuiltStageIndices(player, wonderSide)
      .filter((idx) => affordable(stages[idx]!.cost))
      .map((stageIndex) => ({ stageIndex }));
  } else {
    const mirrorNeighborSide = getPendingGreatWallMirror(state, playerId, wonderSide, player.wonderStagesBuilt);
    if (mirrorNeighborSide) {
      fundableStages = mirrorNeighborSide.stages
        .map((stage, mirrorStageIndex) => ({ mirrorStageIndex, affordable: affordable(stage.cost) }))
        .filter((o) => o.affordable)
        .map(({ mirrorStageIndex }) => ({ mirrorStageIndex }));
    } else {
      const nextStage = getEffectiveWonderStages(player, wonderSide)[player.wonderStagesBuilt];
      const canFundStage = !!nextStage && nextStage.cost.length > 0 && affordable(nextStage.cost);
      fundableStages = canFundStage ? [{}] : [];
    }
  }

  for (const cardId of player.leaderHand) {
    candidates.push({ type: "recruitLeader", cardId });
    candidates.push({ type: "discardLeaderForCoins", cardId });
    for (const fund of fundableStages) {
      candidates.push({ type: "buildWonderStageFromLeader", cardId, stageIndex: fund.stageIndex, mirrorStageIndex: fund.mirrorStageIndex });
    }
  }

  return candidates;
}
