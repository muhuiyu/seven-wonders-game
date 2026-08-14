import { getUnbuiltStageIndices, getWonderSide, type GameState, type RoundAction } from "@sw/shared";
import { canBuildCard, canBuildWonderStage, getAffordability, getEffectiveCost } from "../engine/actionResolution.js";

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
    } else if (canBuildWonderStage(state, playerId, cardId).legal) {
      candidates.push({ type: "buildWonderStage", cardId });
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

  const fundableStageIndices = wonderSide.anyOrder
    ? getUnbuiltStageIndices(player, wonderSide).filter((idx) => getAffordability(state, playerId, getEffectiveCost(player, wonderSide.stages[idx]!.cost, "wonderStage")).affordable)
    : (() => {
        const nextStage = wonderSide.stages[player.wonderStagesBuilt];
        const canFundStage = !!nextStage && getAffordability(state, playerId, getEffectiveCost(player, nextStage.cost, "wonderStage")).affordable;
        return canFundStage ? [player.wonderStagesBuilt] : [];
      })();

  for (const cardId of player.leaderHand) {
    candidates.push({ type: "recruitLeader", cardId });
    candidates.push({ type: "discardLeaderForCoins", cardId });
    for (const stageIndex of fundableStageIndices) {
      candidates.push({ type: "buildWonderStageFromLeader", cardId, stageIndex: wonderSide.anyOrder ? stageIndex : undefined });
    }
  }

  return candidates;
}
