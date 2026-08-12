import { getWonderSide, type GameState, type RoundAction } from "@sw/shared";
import { canBuildCard, canBuildWonderStage, getAffordability, getEffectiveCost } from "../engine/actionResolution.js";

export function enumerateCandidateActions(state: GameState, playerId: string): RoundAction[] {
  const player = state.players[playerId]!;
  const candidates: RoundAction[] = [];

  for (const cardId of player.hand) {
    if (canBuildCard(state, playerId, cardId).legal) candidates.push({ type: "build", cardId });
    if (canBuildWonderStage(state, playerId, cardId).legal) candidates.push({ type: "buildWonderStage", cardId });
    candidates.push({ type: "discard", cardId });
  }

  return candidates;
}

/** Every leader in the player's current draft pool — picking one is the only legal move each draft round. */
export function enumerateLeaderDraftCandidates(state: GameState, playerId: string): RoundAction[] {
  return state.players[playerId]!.leaderDraftPool.map((cardId) => ({ type: "draftLeader", cardId }));
}

/** For each leader in hand: recruit / fund the next wonder stage (if affordable) / discard for coins. */
export function enumerateLeaderRecruitCandidates(state: GameState, playerId: string): RoundAction[] {
  const player = state.players[playerId]!;
  const candidates: RoundAction[] = [];
  const wonderSide = getWonderSide(player.wonderId, player.wonderSide);
  const nextStage = wonderSide.stages[player.wonderStagesBuilt];
  const canFundStage = !!nextStage && getAffordability(state, playerId, getEffectiveCost(player, nextStage.cost, "wonderStage")).affordable;

  for (const cardId of player.leaderHand) {
    candidates.push({ type: "recruitLeader", cardId });
    candidates.push({ type: "discardLeaderForCoins", cardId });
    if (canFundStage) candidates.push({ type: "buildWonderStageFromLeader", cardId });
  }

  return candidates;
}
