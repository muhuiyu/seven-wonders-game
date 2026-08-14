import { getCard, getEffectiveWonderStages, getLeaderCard, getWonderSide, type BotStrategyId, type CardColor, type CardEffect, type GameState, type RoundAction } from "@sw/shared";
import { applyAction } from "../engine/applyAction.js";
import { getPendingGreatWallMirror } from "../engine/actionResolution.js";
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

/**
 * Per-archetype nudges layered on top of WEIGHTS: `colorMultiplier` scales the VP delta
 * attributable to building a card of that color, `weightOverrides` replaces specific
 * WEIGHTS entries outright. Assigned once per bot at setup (see strategyAssignment.ts)
 * and kept for the whole game.
 */
const STRATEGY_PROFILES: Record<BotStrategyId, { colorMultiplier: Partial<Record<CardColor, number>>; weightOverrides?: Partial<typeof WEIGHTS> }> = {
  balanced: { colorMultiplier: {} },
  science: { colorMultiplier: { green: 1.8 } },
  commerce: { colorMultiplier: { yellow: 1.7 }, weightOverrides: { coin: WEIGHTS.coin * 1.5, tradeDiscountBonus: WEIGHTS.tradeDiscountBonus * 1.5 } },
  civilian: { colorMultiplier: { blue: 1.6 } },
  military: { colorMultiplier: {}, weightOverrides: { militaryDeficitReduction: WEIGHTS.militaryDeficitReduction * 1.8, shieldBaseline: WEIGHTS.shieldBaseline * 1.8 } },
};

/**
 * Leaders whose own effect rewards color *diversity* actively fight a specialized
 * archetype's color-multiplier bonuses — so recruiting one pulls the bot back toward
 * balanced play. Value is how strongly to pull (0 = no effect, 1 = fully balanced,
 * ignoring the assigned archetype entirely).
 */
const BALANCE_PULL_LEADERS: Record<string, number> = {
  plato: 1, // rewards one of every non-military color — full specialization directly opposes it
  justinian: 0.5, // rewards a blue+red+green set — partial pull away from single-color focus
};

function balancePull(state: GameState, playerId: string): number {
  const recruited = state.players[playerId]!.recruitedLeaderIds;
  return recruited.reduce((max, leaderId) => Math.max(max, BALANCE_PULL_LEADERS[leaderId] ?? 0), 0);
}

/**
 * Resolves the effective color multipliers/weights a bot scores with this turn: starts
 * from its assigned archetype, blends that toward the neutral "balanced" profile by
 * `balancePull` (e.g. a Plato recruit), then layers on the Age III guild nudge — once a
 * bot has actually built one of these guilds, its own future builds of the color that
 * guild rewards *itself* (not neighbors — the bot can't influence their hands) become a
 * bit more attractive. Only the two guilds with a `scope: "self"` effect give the bot
 * anything it can actually act on; the guild nudge applies after the balance pull since
 * it's a concrete, already-built payoff rather than a specialization bet.
 */
function effectiveStrategyWeights(state: GameState, playerId: string, strategy: BotStrategyId): { colorMultiplier: Partial<Record<CardColor, number>>; weights: typeof WEIGHTS } {
  const profile = STRATEGY_PROFILES[strategy];
  const pull = balancePull(state, playerId);

  const colorMultiplier: Partial<Record<CardColor, number>> = {};
  for (const [color, mult] of Object.entries(profile.colorMultiplier) as [CardColor, number][]) {
    colorMultiplier[color] = 1 + (mult - 1) * (1 - pull);
  }

  const weights = { ...WEIGHTS };
  for (const [key, value] of Object.entries(profile.weightOverrides ?? {}) as [keyof typeof WEIGHTS, number][]) {
    weights[key] = WEIGHTS[key] + (value - WEIGHTS[key]) * (1 - pull);
  }

  const built = state.players[playerId]!.builtCardIds;
  if (built.includes("shipowners-guild")) {
    for (const color of ["brown", "grey", "purple"] as const) colorMultiplier[color] = (colorMultiplier[color] ?? 1) + 0.3;
  }
  if (built.includes("builders-guild")) {
    weights.wonderStageBonus *= 1.5;
  }

  return { colorMultiplier, weights };
}

/** The effects a candidate action would actually put into play — from the card, or from the wonder stage it funds. */
function effectsForAction(state: GameState, playerId: string, action: RoundAction): CardEffect[] {
  if (action.type === "build") return getCard(action.cardId).effects;
  if (action.type === "buildWonderStage") {
    const player = state.players[playerId]!;
    const wonderSide = getWonderSide(player.wonderId, player.wonderSide);
    const idx = wonderSide.anyOrder ? action.stageIndex! : player.wonderStagesBuilt;
    const mirrorNeighborSide = getPendingGreatWallMirror(state, playerId, wonderSide, idx);
    if (mirrorNeighborSide) return mirrorNeighborSide.stages[action.mirrorStageIndex!]?.effects ?? [];
    return getEffectiveWonderStages(player, wonderSide)[idx]?.effects ?? [];
  }
  return [];
}

const TYPE_PRIORITY: Partial<Record<RoundAction["type"], number>> = { buildWonderStage: 0, build: 1, discard: 2 };

function sortKey(action: RoundAction): string {
  const stageIndex = action.type === "buildWonderStage" || action.type === "buildWonderStageFromLeader" ? (action.stageIndex ?? "") : "";
  const mirrorStageIndex = action.type === "buildWonderStage" || action.type === "buildWonderStageFromLeader" ? (action.mirrorStageIndex ?? "") : "";
  return `${TYPE_PRIORITY[action.type] ?? 9}-${action.cardId}-${stageIndex}-${mirrorStageIndex}`;
}

function scoreCandidate(state: GameState, playerId: string, action: RoundAction): number {
  const strategy = state.players[playerId]!.botStrategy ?? "balanced";
  const { colorMultiplier, weights } = effectiveStrategyWeights(state, playerId, strategy);

  if (action.type === "discard") return 3 * weights.coin;

  const clone = structuredClone(state);
  let extraTurn: boolean;
  try {
    extraTurn = applyAction(clone, playerId, action);
  } catch {
    return -Infinity;
  }

  const before = state.players[playerId]!;
  const after = clone.players[playerId]!;

  let valueDelta = estimatePlayerValue(clone, playerId) - estimatePlayerValue(state, playerId);
  if (action.type === "build") valueDelta *= colorMultiplier[getCard(action.cardId).color] ?? 1;
  const coinDelta = after.coins - before.coins;

  const { left, right } = getNeighbors(state, playerId);
  const leftShields = getShieldCount(left);
  const rightShields = getShieldCount(right);
  const deficitBefore = Math.max(0, leftShields - getShieldCount(before)) + Math.max(0, rightShields - getShieldCount(before));
  const deficitAfter = Math.max(0, leftShields - getShieldCount(after)) + Math.max(0, rightShields - getShieldCount(after));

  let score = 0;
  score += valueDelta * weights.vp;
  score += coinDelta * weights.coin;
  score += (deficitBefore - deficitAfter) * weights.militaryDeficitReduction;
  if (action.type === "buildWonderStage") score += weights.wonderStageBonus;
  if (action.type === "build" && (getCard(action.cardId).chainUnlocks?.length ?? 0) > 0) score += weights.chainingBonus;
  if (extraTurn) score += weights.extraTurnBonus;

  for (const effect of effectsForAction(state, playerId, action)) {
    if (effect.kind === "resource") score += effect.production.qty * weights.resourceUnit;
    if (effect.kind === "shields") score += effect.count * weights.shieldBaseline;
    if (effect.kind === "tradeDiscount") score += weights.tradeDiscountBonus;
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

  const strategy = state.players[playerId]!.botStrategy ?? "balanced";
  const pull = balancePull(state, playerId);
  const color = best.type === "build" || best.type === "buildWonderStage" ? getCard(best.cardId).color : undefined;
  console.log(
    `[bot:${playerId}] strategy=${strategy}${pull > 0 ? ` (balance-pull=${pull.toFixed(2)})` : ""} age=${state.age} round=${state.round} -> ${best.type} ${best.cardId}${color ? ` (${color})` : ""} score=${bestScore.toFixed(2)}`,
  );

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
