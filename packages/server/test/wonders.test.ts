import { describe, expect, it } from "vitest";
import { canBuildCard } from "../src/engine/actionResolution.js";
import { makeGameState, makePlayer } from "./fixtures.js";

// "baths" (blue, costs 1 stone) is a useful probe card: with 0 coins and no stone
// production anywhere at the table, it's only buildable for free via a wonder ability.
describe("Olympia Day (A) — freeBuildFirstOfEachColor", () => {
  it("makes the first card of an unbuilt color free once stage 2 is built", () => {
    const human = makePlayer("human", {
      wonderId: "olympia",
      wonderSide: "A",
      wonderStagesBuilt: 2, // stage 1 (vp) + stage 2 (freeBuildFirstOfEachColor)
      coins: 0,
      hand: ["baths"],
      builtCardIds: [],
    });
    const left = makePlayer("left", { coins: 0 });
    const right = makePlayer("right", { coins: 0 });
    const state = makeGameState(["human", "left", "right"], { human, left, right });

    const check = canBuildCard(state, "human", "baths");
    expect(check.legal).toBe(true);
    expect(check.free).toBe(true);
  });

  it("does not apply to a color the player already has in their city", () => {
    const human = makePlayer("human", {
      wonderId: "olympia",
      wonderSide: "A",
      wonderStagesBuilt: 2,
      coins: 0,
      hand: ["baths"],
      builtCardIds: ["well"], // already has a blue card
    });
    const left = makePlayer("left", { coins: 0 });
    const right = makePlayer("right", { coins: 0 });
    const state = makeGameState(["human", "left", "right"], { human, left, right });

    const check = canBuildCard(state, "human", "baths");
    expect(check.legal).toBe(false);
    expect(check.free).toBe(false);
  });

  it("is inactive before stage 2 is built", () => {
    const human = makePlayer("human", {
      wonderId: "olympia",
      wonderSide: "A",
      wonderStagesBuilt: 1, // only stage 1 (vp) built
      coins: 0,
      hand: ["baths"],
      builtCardIds: [],
    });
    const left = makePlayer("left", { coins: 0 });
    const right = makePlayer("right", { coins: 0 });
    const state = makeGameState(["human", "left", "right"], { human, left, right });

    const check = canBuildCard(state, "human", "baths");
    expect(check.legal).toBe(false);
  });
});

describe("Olympia Night (B) — freeBuildFirstCardOfAge / freeBuildLastCardOfAge", () => {
  it("makes the first build of the Age free once stage 1 is built", () => {
    const human = makePlayer("human", {
      wonderId: "olympia",
      wonderSide: "B",
      wonderStagesBuilt: 1, // stage 1: freeBuildFirstCardOfAge
      coins: 0,
      hand: ["baths"],
      builtCardIds: [],
    });
    const left = makePlayer("left", { coins: 0 });
    const right = makePlayer("right", { coins: 0 });
    const state = makeGameState(["human", "left", "right"], { human, left, right }, { round: 1 });

    expect(canBuildCard(state, "human", "baths").free).toBe(true);
  });

  it("is not free mid-Age even with stage 1 built", () => {
    const human = makePlayer("human", {
      wonderId: "olympia",
      wonderSide: "B",
      wonderStagesBuilt: 1,
      coins: 0,
      hand: ["baths"],
      builtCardIds: [],
    });
    const left = makePlayer("left", { coins: 0 });
    const right = makePlayer("right", { coins: 0 });
    const state = makeGameState(["human", "left", "right"], { human, left, right }, { round: 3 });

    const check = canBuildCard(state, "human", "baths");
    expect(check.legal).toBe(false);
  });

  it("makes the last build of the Age free once stage 2 is also built", () => {
    const human = makePlayer("human", {
      wonderId: "olympia",
      wonderSide: "B",
      wonderStagesBuilt: 2, // stage 1 + stage 2: freeBuildLastCardOfAge
      coins: 0,
      hand: ["baths"],
      builtCardIds: [],
    });
    const left = makePlayer("left", { coins: 0 });
    const right = makePlayer("right", { coins: 0 });
    const state = makeGameState(["human", "left", "right"], { human, left, right }, { round: 6 });

    expect(canBuildCard(state, "human", "baths").free).toBe(true);
  });
});
