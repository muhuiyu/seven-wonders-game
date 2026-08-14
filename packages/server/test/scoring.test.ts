import { describe, expect, it } from "vitest";
import { getScienceSymbolCounts, scoreScience } from "../src/engine/science.js";
import { resolveMilitary, militaryVp } from "../src/engine/military.js";
import { computeFinalScore } from "../src/engine/scoring.js";
import { makeGameState, makePlayer } from "./fixtures.js";

describe("science scoring", () => {
  it("scores squares with no matched set", () => {
    // 2 cog, 1 compass, 0 tablet -> 4 + 1 + 0 = 5, no set (min = 0)
    expect(scoreScience({ cog: 2, compass: 1, tablet: 0 })).toBe(5);
  });

  it("adds 7 per complete set of one-each", () => {
    // 2 of each -> squares 4+4+4=12, sets = min(2,2,2) = 2 -> 12 + 14 = 26
    expect(scoreScience({ cog: 2, compass: 2, tablet: 2 })).toBe(26);
  });

  it("derives counts from built cards plus chosen wonder-granted symbols", () => {
    const player = makePlayer("p1", {
      builtCardIds: ["apothecary", "workshop", "scriptorium"], // compass, cog, tablet
      chosenScienceSymbols: ["cog"],
    });
    const counts = getScienceSymbolCounts(player);
    expect(counts).toEqual({ cog: 2, compass: 1, tablet: 1 });
  });
});

describe("military resolution", () => {
  it("awards the age token value to the higher-shield player and -1 to the loser", () => {
    const a = makePlayer("a", { builtCardIds: ["stockade"] }); // 1 shield
    const b = makePlayer("b", { builtCardIds: [] }); // 0 shields
    const c = makePlayer("c", { builtCardIds: [] });
    const state = makeGameState(["a", "b", "c"], { a, b, c });

    resolveMilitary(state, 1);

    // a has more shields than both neighbors (b and c), so a wins both conflicts.
    expect(state.players.a!.militaryTokens.filter((t) => t.result === "win")).toHaveLength(2);
    expect(state.players.b!.militaryTokens.filter((t) => t.result === "lose")).toHaveLength(1);
    // c ties with b (0 vs 0) but loses to a (0 vs 1).
    expect(state.players.c!.militaryTokens.filter((t) => t.result === "tie")).toHaveLength(1);
    expect(state.players.c!.militaryTokens.filter((t) => t.result === "lose")).toHaveLength(1);
  });

  it("gives no tokens on a tie", () => {
    const a = makePlayer("a");
    const b = makePlayer("b");
    const state = makeGameState(["a", "b"], { a, b });
    resolveMilitary(state, 2);
    // With only 2 players, each pair is adjacent twice around the cycle in our seat model,
    // but shields are equal (0-0) both times, so every token should be a tie.
    expect(state.players.a!.militaryTokens.every((t) => t.result === "tie")).toBe(true);
  });

  it("computes militaryVp using the age-scaled token values and -1 per loss", () => {
    const player = makePlayer("p", {
      militaryTokens: [
        { age: 1, result: "win" },
        { age: 2, result: "win" },
        { age: 3, result: "lose" },
      ],
    });
    expect(militaryVp(player)).toBe(1 + 3 - 1);
  });
});

describe("final scoring breakdown", () => {
  it("sums military, treasury, wonder, civil, science, guild, commerce into total", () => {
    const human = makePlayer("human", {
      coins: 10, // treasury = floor(10/3) = 3
      builtCardIds: ["baths", "apothecary"], // baths: vp 3 (blue); apothecary: compass (science)
      wonderStagesBuilt: 1, // gizah A stage 1: cost wood:2, vp 3
      militaryTokens: [{ age: 1, result: "win" }], // +1
    });
    const bot = makePlayer("bot", { wonderId: "rhodos", wonderSide: "A" });
    const state = makeGameState(["human", "bot"], { human, bot });

    const scores = computeFinalScore(state);
    const humanScore = scores.find((s) => s.playerId === "human")!;

    expect(humanScore.treasury).toBe(3);
    expect(humanScore.civil).toBe(3);
    expect(humanScore.wonder).toBe(3);
    expect(humanScore.science).toBe(1); // 1 compass -> 1^2
    expect(humanScore.military).toBe(1);
    expect(humanScore.total).toBe(3 + 3 + 3 + 1 + 1);
  });

  it("scores a guild's vpPerCard against neighbor board state, not the guild owner's own cards", () => {
    // Workers Guild: 1 VP per brown card in EACH neighboring city.
    const left = makePlayer("left", { builtCardIds: ["lumber-yard", "stone-pit"] }); // 2 brown
    const guildOwner = makePlayer("owner", { builtCardIds: ["workers-guild", "ore-vein"] }); // 1 brown of their own (shouldn't count)
    const right = makePlayer("right", { builtCardIds: ["clay-pool"] }); // 1 brown
    const state = makeGameState(["left", "owner", "right"], { left, owner: guildOwner, right });

    const scores = computeFinalScore(state);
    const ownerScore = scores.find((s) => s.playerId === "owner")!;
    expect(ownerScore.guild).toBe(2 + 1);
  });
});
