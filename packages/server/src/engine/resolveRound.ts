import { AGE_PASS_DIRECTION, type Age, type GameState, type RoundAction } from "@sw/shared";
import { applyAction } from "./applyAction.js";
import { resolveDeferredOpponentEffects, type PendingOpponentEffect } from "./effects.js";
import { applyLeaderAction, LEADER_DRAFT_ROUNDS, rotateLeaderDraftPools } from "./leaders.js";
import { chooseBotAction, chooseBotLeaderDraftAction, chooseBotLeaderRecruitAction } from "../bot/heuristics.js";
import { getNeighborIds } from "./seating.js";
import { resolveMilitary } from "./military.js";
import { computeFinalScore } from "./scoring.js";

const HUMAN_ID = "human";

function rotateHands(state: GameState, direction: "left" | "right"): void {
  const snapshot = new Map(state.seats.map((id) => [id, state.players[id]!.hand]));
  for (const playerId of state.seats) {
    const { leftId, rightId } = getNeighborIds(state, playerId);
    const sourceId = direction === "left" ? rightId : leftId;
    state.players[playerId]!.hand = snapshot.get(sourceId)!;
  }
}

function collectActions(state: GameState, humanAction: RoundAction, chooseBot: (state: GameState, playerId: string) => RoundAction): Record<string, RoundAction> {
  const actions: Record<string, RoundAction> = { [HUMAN_ID]: humanAction };
  for (const playerId of state.seats) {
    if (playerId !== HUMAN_ID) actions[playerId] = chooseBot(state, playerId);
  }
  return actions;
}

/** Deals `state.age`'s hand from the pre-shuffled deck, transitions to the normal drafting phase. */
function dealCurrentAgeHand(state: GameState): void {
  const deck = state.age === 1 ? state.futureDecks.age1Deck! : state.age === 2 ? state.futureDecks.age2Deck : state.futureDecks.age3Deck;
  const handSize = deck.length / state.seats.length;
  state.seats.forEach((playerId, i) => {
    state.players[playerId]!.hand = deck.slice(i * handSize, i * handSize + handSize);
  });
  state.round = 1;
  state.phase = "drafting";
  state.log.push({ round: 1, age: state.age, message: `Age ${state.age} begins.` });
}

function resolveLeaderDraftRound(state: GameState, humanAction: RoundAction): GameState {
  const actions = collectActions(state, humanAction, chooseBotLeaderDraftAction);
  for (const playerId of state.seats) applyLeaderAction(state, playerId, actions[playerId]!);

  if (state.round < LEADER_DRAFT_ROUNDS) {
    rotateLeaderDraftPools(state);
    state.round += 1;
    return state;
  }

  state.phase = "leaderRecruit";
  state.log.push({ round: state.round, age: state.age, message: "The Leader draft is complete." });
  return state;
}

function resolveLeaderRecruitRound(state: GameState, humanAction: RoundAction): GameState {
  const actions = collectActions(state, humanAction, chooseBotLeaderRecruitAction);
  for (const playerId of state.seats) applyLeaderAction(state, playerId, actions[playerId]!);

  dealCurrentAgeHand(state);
  return state;
}

function resolveDraftingRound(prev: GameState, humanAction: RoundAction): GameState {
  const state: GameState = structuredClone(prev);
  const actions = collectActions(state, humanAction, chooseBotAction);
  const deferredOpponentEffects: PendingOpponentEffect[] = [];

  const bonusTurnPlayers: string[] = [];
  for (const playerId of state.seats) {
    const grantedBonus = applyAction(state, playerId, actions[playerId]!, deferredOpponentEffects);
    if (grantedBonus) bonusTurnPlayers.push(playerId);
  }

  for (const playerId of bonusTurnPlayers) {
    if (state.players[playerId]!.hand.length === 0) continue;
    const bonusAction = chooseBotAction(state, playerId);
    applyAction(state, playerId, bonusAction, deferredOpponentEffects);
    state.log.push({ round: state.round, age: state.age, message: `${state.players[playerId]!.name} takes a bonus build from the Hanging Gardens of Babylon.` });
  }

  // Cities' coin-loss effects (Hideout, Sepulcher, etc.) resolve only after every build/payment this round has settled.
  resolveDeferredOpponentEffects(state, deferredOpponentEffects);

  // Cities' 8-card hand ("Extra Turn" rule) means 7 turns/Age instead of 6; either way exactly 1 leftover card is discarded unseen.
  const roundsPerAge = state.expansions.cities ? 7 : 6;
  if (state.round < roundsPerAge) {
    rotateHands(state, AGE_PASS_DIRECTION[state.age]);
    state.round += 1;
    return state;
  }

  // End of age: discard any leftover 1-card hands, then resolve military.
  for (const playerId of state.seats) {
    const player = state.players[playerId]!;
    if (player.hand.length > 0) {
      state.discardPile.push(...player.hand);
      player.hand = [];
    }
    player.usedFreeBuildThisAge = false;
  }
  resolveMilitary(state, state.age);

  if (state.age < 3) {
    const nextAge = (state.age + 1) as Age;
    state.age = nextAge;
    if (state.expansions.leaders) {
      state.phase = "leaderRecruit";
      state.log.push({ round: state.round, age: nextAge, message: `Leader recruitment begins for Age ${nextAge}.` });
    } else {
      dealCurrentAgeHand(state);
    }
  } else {
    state.phase = "complete";
    state.finalScores = computeFinalScore(state);
    state.log.push({ round: state.round, age: state.age, message: "The game is complete! Final scores are tallied." });
  }

  return state;
}

export function resolveRound(prev: GameState, humanAction: RoundAction): GameState {
  if (prev.phase === "complete") throw new Error("Cannot submit an action while game phase is 'complete'");

  if (prev.phase === "leaderDraft") {
    const state: GameState = structuredClone(prev);
    return resolveLeaderDraftRound(state, humanAction);
  }
  if (prev.phase === "leaderRecruit") {
    const state: GameState = structuredClone(prev);
    return resolveLeaderRecruitRound(state, humanAction);
  }

  return resolveDraftingRound(prev, humanAction);
}
