import { getCard, getLeaderCard, getWonderSide, type GameState, type RoundAction } from "@sw/shared";
import { getAffordability, getEffectiveCost } from "./actionResolution.js";
import { applyImmediateEffects } from "./effects.js";
import { payAndCredit } from "./applyAction.js";
import { getActiveEffectSources } from "./effectSources.js";
import { estimatePlayerValue } from "./scoring.js";
import { getNeighborIds } from "./seating.js";

/** A player's Leader recruitment cost for `baseCost`, after their own and their neighbors' wonder-granted discounts (Roma). */
export function getLeaderRecruitCost(state: GameState, playerId: string, baseCost: number): number {
  const activeEffects = getActiveEffectSources(state.players[playerId]!);
  if (activeEffects.some((e) => e.kind === "freeLeaderRecruitment")) return 0;

  let discount = 0;
  for (const e of activeEffects) if (e.kind === "leaderRecruitmentDiscount") discount += e.self;

  const { leftId, rightId } = getNeighborIds(state, playerId);
  for (const neighborId of [leftId, rightId]) {
    for (const e of getActiveEffectSources(state.players[neighborId]!)) {
      if (e.kind === "leaderRecruitmentDiscount") discount += e.neighbors;
    }
  }

  return Math.max(0, baseCost - discount);
}

export const LEADER_DRAFT_ROUNDS = 4; // matches the fixed 4-card deal to each player

function removeFrom(list: string[], id: string, label: string): void {
  const idx = list.indexOf(id);
  if (idx === -1) throw new Error(`${label} ${id} not found`);
  list.splice(idx, 1);
}

/** After a Solomon recruit, auto-pick and build for free the highest-value card in the shared discard pile. */
function recycleBestDiscard(state: GameState, playerId: string): void {
  const player = state.players[playerId]!;
  let bestId: string | null = null;
  let bestScore = -Infinity;

  for (const cardId of new Set(state.discardPile)) {
    if (player.builtCardIds.includes(cardId)) continue;
    const clone = structuredClone(state);
    const clonedPlayer = clone.players[playerId]!;
    const idx = clone.discardPile.indexOf(cardId);
    if (idx === -1) continue;
    clone.discardPile.splice(idx, 1);
    clonedPlayer.builtCardIds.push(cardId);
    try {
      applyImmediateEffects(clone, playerId, getCard(cardId).effects);
    } catch {
      continue;
    }
    const score = estimatePlayerValue(clone, playerId);
    if (score > bestScore) {
      bestScore = score;
      bestId = cardId;
    }
  }

  if (bestId === null) return;
  const idx = state.discardPile.indexOf(bestId);
  state.discardPile.splice(idx, 1);
  player.builtCardIds.push(bestId);
  applyImmediateEffects(state, playerId, getCard(bestId).effects);
  state.log.push({ round: state.round, age: state.age, message: `${player.name} recycles ${getCard(bestId).name} from the discard pile (Solomon).` });
}

/** Applies one player's Leader-phase action (draft pick or recruitment choice) to `state` in place. Throws if illegal. */
export function applyLeaderAction(state: GameState, playerId: string, action: RoundAction): void {
  const player = state.players[playerId]!;

  if (action.type === "draftLeader") {
    if (!player.leaderDraftPool.includes(action.cardId)) throw new Error(`Leader ${action.cardId} not in draft pool`);
    removeFrom(player.leaderDraftPool, action.cardId, "Leader");
    player.leaderHand.push(action.cardId);
    return;
  }

  if (action.type === "discardLeaderForCoins") {
    if (!player.leaderHand.includes(action.cardId)) throw new Error(`Leader ${action.cardId} not in hand`);
    removeFrom(player.leaderHand, action.cardId, "Leader");
    player.coins += 3;
    state.log.push({ round: state.round, age: state.age, message: `${player.name} discards ${getLeaderCard(action.cardId).name} for 3 coins.` });
    return;
  }

  if (action.type === "buildWonderStageFromLeader") {
    if (!player.leaderHand.includes(action.cardId)) throw new Error(`Leader ${action.cardId} not in hand`);
    const wonderSide = getWonderSide(player.wonderId, player.wonderSide);
    const stage = wonderSide.stages[player.wonderStagesBuilt];
    if (!stage) throw new Error("All wonder stages already built");
    const effectiveCost = getEffectiveCost(player, stage.cost, "wonderStage");
    const payment = getAffordability(state, playerId, effectiveCost);
    if (!payment.affordable) throw new Error("Cannot afford this wonder stage");

    removeFrom(player.leaderHand, action.cardId, "Leader");
    payAndCredit(state, playerId, payment.totalCoinCost, payment.purchases);
    player.wonderStagesBuilt += 1;
    const extraTurn = applyImmediateEffects(state, playerId, stage.effects);
    state.log.push({
      round: state.round,
      age: state.age,
      message: `${player.name} funds a wonder stage (${wonderSide.wonderName}, stage ${player.wonderStagesBuilt}) using ${getLeaderCard(action.cardId).name}.`,
    });
    // Wonder-stage builds never grant a bonus turn during the Recruitment phase — there's no follow-up action slot to spend it on.
    void extraTurn;
    return;
  }

  if (action.type === "recruitLeader") {
    if (!player.leaderHand.includes(action.cardId)) throw new Error(`Leader ${action.cardId} not in hand`);
    const leader = getLeaderCard(action.cardId);
    const cost = getLeaderRecruitCost(state, playerId, leader.coinCost);
    if (player.coins < cost) throw new Error(`Cannot afford to recruit ${leader.name}`);

    removeFrom(player.leaderHand, action.cardId, "Leader");
    player.coins -= cost;
    player.recruitedLeaderIds.push(action.cardId);
    applyImmediateEffects(state, playerId, leader.effects);
    state.log.push({ round: state.round, age: state.age, message: `${player.name} recruits ${leader.name}.` });

    if (leader.effects.some((e) => e.kind === "recycleDiscardOnRecruit") && state.discardPile.length > 0) {
      recycleBestDiscard(state, playerId);
    }
    return;
  }

  throw new Error(`applyLeaderAction cannot handle action type '${action.type}'`);
}

/** Rotates every player's draft pool to their right neighbor (Leaders draft rule), in place. */
export function rotateLeaderDraftPools(state: GameState): void {
  const snapshot = new Map(state.seats.map((id) => [id, state.players[id]!.leaderDraftPool]));
  for (const playerId of state.seats) {
    const { leftId } = getNeighborIds(state, playerId);
    state.players[playerId]!.leaderDraftPool = snapshot.get(leftId)!;
  }
}
