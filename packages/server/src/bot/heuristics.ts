import { getCard, getLeaderCard, getWonderSide, type CardEffect, type GameState, type RoundAction } from "@sw/shared";
import { applyAction } from "../engine/applyAction.js";
import { applyLeaderAction } from "../engine/leaders.js";
import { getNeighbors } from "../engine/seating.js";
import { estimatePlayerValue } from "../engine/scoring.js";
import { getShieldCount } from "../engine/shields.js";
import { enumerateCandidateActions, enumerateLeaderDraftCandidates, enumerateLeaderRecruitCandidates } from "./candidateActions.js";

const WEIGHTS = {
  vp: 3,
  coin: 0.4,
  militaryDeficitReduction: 1.2,
  wonderStageBonus: 2,
  chainingBonus: 1.5,
  extraTurnBonus: 2,
  // Passive effects (resource production, raw shields, trade discounts) don't move
  // estimatePlayerValue or coins directly, so without an explicit bonus a free
  // resource card would score exactly the same as doing nothing — always losing to
  // discard's flat 3-coin baseline. These bonuses give bots a reason to build economy.
  resourceUnit: 2.2,
  shieldBaseline: 0.8,
  tradeDiscountBonus: 1.5,
};

/** The effects a candidate action would actually put into play — from the card, or from the wonder stage it funds. */
function effectsForAction(state: GameState, playerId: string, action: RoundAction): CardEffect[] {
  if (action.type === "build") return getCard(action.cardId).effects;
  if (action.type === "buildWonderStage") {
    const player = state.players[playerId]!;
    const wonderSide = getWonderSide(player.wonderId, player.wonderSide);
    return wonderSide.stages[player.wonderStagesBuilt]?.effects ?? [];
  }
  return [];
}

const TYPE_PRIORITY: Partial<Record<RoundAction["type"], number>> = { buildWonderStage: 0, build: 1, discard: 2 };

function sortKey(action: RoundAction): string {
  return `${TYPE_PRIORITY[action.type] ?? 9}-${action.cardId}`;
}

function scoreCandidate(state: GameState, playerId: string, action: RoundAction): number {
  if (action.type === "discard") return 3 * WEIGHTS.coin;

  const clone = structuredClone(state);
  let extraTurn: boolean;
  try {
    extraTurn = applyAction(clone, playerId, action);
  } catch {
    return -Infinity;
  }

  const before = state.players[playerId]!;
  const after = clone.players[playerId]!;

  const valueDelta = estimatePlayerValue(clone, playerId) - estimatePlayerValue(state, playerId);
  const coinDelta = after.coins - before.coins;

  const { left, right } = getNeighbors(state, playerId);
  const leftShields = getShieldCount(left);
  const rightShields = getShieldCount(right);
  const deficitBefore = Math.max(0, leftShields - getShieldCount(before)) + Math.max(0, rightShields - getShieldCount(before));
  const deficitAfter = Math.max(0, leftShields - getShieldCount(after)) + Math.max(0, rightShields - getShieldCount(after));

  let score = 0;
  score += valueDelta * WEIGHTS.vp;
  score += coinDelta * WEIGHTS.coin;
  score += (deficitBefore - deficitAfter) * WEIGHTS.militaryDeficitReduction;
  if (action.type === "buildWonderStage") score += WEIGHTS.wonderStageBonus;
  if (action.type === "build" && (getCard(action.cardId).chainUnlocks?.length ?? 0) > 0) score += WEIGHTS.chainingBonus;
  if (extraTurn) score += WEIGHTS.extraTurnBonus;

  for (const effect of effectsForAction(state, playerId, action)) {
    if (effect.kind === "resource") score += effect.production.qty * WEIGHTS.resourceUnit;
    if (effect.kind === "shields") score += effect.count * WEIGHTS.shieldBaseline;
    if (effect.kind === "tradeDiscount") score += WEIGHTS.tradeDiscountBonus;
  }

  return score;
}

/** Single-ply greedy heuristic bot: scores every legal candidate action and picks the best, deterministically. */
export function chooseBotAction(state: GameState, playerId: string): RoundAction {
  const candidates = enumerateCandidateActions(state, playerId).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  if (candidates.length === 0) throw new Error(`No legal actions for ${playerId} (empty hand?)`);

  let best = candidates[0]!;
  let bestScore = scoreCandidate(state, playerId, best);
  for (const candidate of candidates.slice(1)) {
    const score = scoreCandidate(state, playerId, candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

/** Scores a leader-phase candidate by simulating `apply` on a clone and comparing estimated value + coins, same shape as scoreCandidate above. */
function scoreLeaderCandidate(state: GameState, playerId: string, apply: (clone: GameState) => void): number {
  const clone = structuredClone(state);
  try {
    apply(clone);
  } catch {
    return -Infinity;
  }
  const valueDelta = estimatePlayerValue(clone, playerId) - estimatePlayerValue(state, playerId);
  const coinDelta = clone.players[playerId]!.coins - state.players[playerId]!.coins;
  return valueDelta * WEIGHTS.vp + coinDelta * WEIGHTS.coin;
}

/** Values a draft pick by simulating an immediate recruit (a reasonable proxy for "how good is this leader") net of its coin cost. */
export function chooseBotLeaderDraftAction(state: GameState, playerId: string): RoundAction {
  const candidates = enumerateLeaderDraftCandidates(state, playerId).sort((a, b) => a.cardId.localeCompare(b.cardId));
  if (candidates.length === 0) throw new Error(`No legal leader draft picks for ${playerId}`);

  let best = candidates[0]!;
  let bestScore = -Infinity;
  for (const candidate of candidates) {
    const leader = getLeaderCard(candidate.cardId);
    const score = scoreLeaderCandidate(state, playerId, (clone) => {
      clone.players[playerId]!.recruitedLeaderIds.push(candidate.cardId);
      clone.players[playerId]!.coins -= leader.coinCost;
    });
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

export function chooseBotLeaderRecruitAction(state: GameState, playerId: string): RoundAction {
  const candidates = enumerateLeaderRecruitCandidates(state, playerId).sort((a, b) => `${a.type}-${a.cardId}`.localeCompare(`${b.type}-${b.cardId}`));
  if (candidates.length === 0) throw new Error(`No legal leader recruitment actions for ${playerId}`);

  let best = candidates[0]!;
  let bestScore = -Infinity;
  for (const candidate of candidates) {
    const score = scoreLeaderCandidate(state, playerId, (clone) => applyLeaderAction(clone, playerId, candidate));
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}
