import { describe, expect, it } from "vitest";
import { createGame } from "../src/engine/setup.js";
import { resolveRound } from "../src/engine/resolveRound.js";
import { chooseBotAction, chooseBotLeaderDraftAction, chooseBotLeaderRecruitAction } from "../src/bot/heuristics.js";

/** Runs a fully-bot game by also driving the "human" seat with the bot heuristic. */
function simulateFullGame(playerCount: number, seed: number, expansions: { leaders: boolean; cities: boolean } = { leaders: false, cities: false }) {
  let state = createGame({ playerCount, humanName: "Human", seed, expansions });
  let rounds = 0;
  while (state.phase !== "complete") {
    const humanAction =
      state.phase === "leaderDraft"
        ? chooseBotLeaderDraftAction(state, "human")
        : state.phase === "leaderRecruit"
          ? chooseBotLeaderRecruitAction(state, "human")
          : chooseBotAction(state, "human");
    state = resolveRound(state, humanAction);
    rounds++;
    if (rounds > 200) throw new Error("Game did not complete within 200 rounds — likely an infinite loop");
  }
  return { state, rounds };
}

function expectedRoundCount(expansions: { leaders: boolean; cities: boolean }): number {
  return (expansions.leaders ? 4 + 3 : 0) + (expansions.cities ? 7 : 6) * 3;
}

describe("bot-vs-bot full game simulation", () => {
  for (const playerCount of [3, 4, 5, 6, 7]) {
    for (const seed of [1, 2, 3]) {
      it(`completes a full ${playerCount}-player game (seed ${seed}) without errors`, () => {
        const { state, rounds } = simulateFullGame(playerCount, seed);

        expect(state.phase).toBe("complete");
        expect(rounds).toBe(18); // 3 ages x 6 rounds
        expect(state.finalScores).toBeDefined();
        expect(state.finalScores).toHaveLength(playerCount);

        for (const playerId of state.seats) {
          const player = state.players[playerId]!;
          expect(player.coins).toBeGreaterThanOrEqual(0);
          expect(player.hand).toHaveLength(0);
          expect(player.wonderStagesBuilt).toBeGreaterThanOrEqual(0);
          expect(player.wonderStagesBuilt).toBeLessThanOrEqual(4);
        }

        for (const score of state.finalScores!) {
          const sum = score.military + score.treasury + score.wonder + score.civil + score.science + score.guild + score.commerce + score.cities + score.leaders + score.debt;
          expect(sum).toBeCloseTo(score.total, 5);
          // Loose sanity bound consistent with real-game score ranges; catches gross scoring bugs.
          expect(score.total).toBeGreaterThan(-20);
          expect(score.total).toBeLessThan(150);
        }
      });
    }
  }

  it("never lets a player build the same card twice", () => {
    const { state } = simulateFullGame(5, 42);
    for (const playerId of state.seats) {
      const built = state.players[playerId]!.builtCardIds;
      expect(new Set(built).size).toBe(built.length);
    }
  });

  it("is deterministic given the same seed", () => {
    const a = simulateFullGame(4, 777);
    const b = simulateFullGame(4, 777);
    expect(a.state.finalScores).toEqual(b.state.finalScores);
  });
});

describe("bot-vs-bot full game simulation — expansions", () => {
  const expansionSets = [
    { leaders: true, cities: false },
    { leaders: false, cities: true },
    { leaders: true, cities: true },
  ];

  for (const playerCount of [3, 4, 5, 6, 7]) {
    for (const expansions of expansionSets) {
      for (const seed of [1, 2, 3]) {
        const label = `leaders=${expansions.leaders} cities=${expansions.cities}`;
        it(`completes a full ${playerCount}-player game (${label}, seed ${seed}) without errors`, () => {
          const { state, rounds } = simulateFullGame(playerCount, seed, expansions);

          expect(state.phase).toBe("complete");
          expect(rounds).toBe(expectedRoundCount(expansions));
          expect(state.finalScores).toHaveLength(playerCount);

          for (const playerId of state.seats) {
            const player = state.players[playerId]!;
            expect(player.coins).toBeGreaterThanOrEqual(0);
            expect(player.hand).toHaveLength(0);
            expect(player.wonderStagesBuilt).toBeGreaterThanOrEqual(0);
            expect(player.wonderStagesBuilt).toBeLessThanOrEqual(4);
            expect(player.debtVp).toBeLessThanOrEqual(0);
            // Exactly 1 of the 4 drafted leaders is never played, by rule (see plan notes).
            if (expansions.leaders) expect(player.leaderHand.length).toBeLessThanOrEqual(1);
            const built = player.builtCardIds;
            expect(new Set(built).size).toBe(built.length);
          }

          for (const score of state.finalScores!) {
            const sum = score.military + score.treasury + score.wonder + score.civil + score.science + score.guild + score.commerce + score.cities + score.leaders + score.debt;
            expect(sum).toBeCloseTo(score.total, 5);
          }
        });
      }
    }
  }

  it("is deterministic given the same seed with both expansions on", () => {
    const expansions = { leaders: true, cities: true };
    const a = simulateFullGame(4, 555, expansions);
    const b = simulateFullGame(4, 555, expansions);
    expect(a.state.finalScores).toEqual(b.state.finalScores);
  });
});
