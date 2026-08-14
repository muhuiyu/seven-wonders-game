import { getUnbuiltStageIndices, getWonderSide } from "@sw/shared";
import { describe, expect, it } from "vitest";
import { canBuildCard, canBuildWonderStage } from "../src/engine/actionResolution.js";
import { applyAction } from "../src/engine/applyAction.js";
import { getProductionSlots } from "../src/engine/productionSlots.js";
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

describe("The Great Wall — anyOrder stage building", () => {
  it("side B: stage 4 (dynamicResource) is legal before any earlier stage is built", () => {
    const human = makePlayer("human", {
      wonderId: "greatwall",
      wonderSide: "B",
      wonderStagesBuilt: 0,
      builtWonderStageIndices: [],
      builtCardIds: ["stone-pit", "stone-pit"], // 2 stone production, covers stage 4's { stone: 2 } cost
      coins: 0,
      hand: ["baths"],
    });
    const left = makePlayer("left", { coins: 0 });
    const right = makePlayer("right", { coins: 0 });
    const state = makeGameState(["human", "left", "right"], { human, left, right });

    // Stage 1 (index 0, { papyrus: 1, wood: 1 }) is unaffordable — proves this player really
    // can't build in order, yet stage 4 (index 3) is still legal.
    expect(canBuildWonderStage(state, "human", "baths", 0).legal).toBe(false);
    expect(canBuildWonderStage(state, "human", "baths", 3).legal).toBe(true);
  });

  it("rejects a stage index that's already been built or is out of range", () => {
    const human = makePlayer("human", {
      wonderId: "greatwall",
      wonderSide: "B",
      wonderStagesBuilt: 1,
      builtWonderStageIndices: [3],
      builtCardIds: ["stone-pit", "stone-pit"],
      coins: 0,
      hand: ["baths"],
    });
    const state = makeGameState(["human", "left", "right"], { human, left: makePlayer("left"), right: makePlayer("right") });

    expect(canBuildWonderStage(state, "human", "baths", 3).legal).toBe(false); // already built
    expect(canBuildWonderStage(state, "human", "baths").legal).toBe(false); // no stageIndex supplied for an anyOrder wonder
  });

  it("applyAction records the built index and leaves the rest unbuilt", () => {
    const human = makePlayer("human", {
      wonderId: "greatwall",
      wonderSide: "B",
      wonderStagesBuilt: 0,
      builtWonderStageIndices: [],
      builtCardIds: ["stone-pit", "stone-pit"],
      coins: 0,
      hand: ["baths"],
    });
    const state = makeGameState(["human", "left", "right"], { human, left: makePlayer("left"), right: makePlayer("right") });

    applyAction(state, "human", { type: "buildWonderStage", cardId: "baths", stageIndex: 3 });

    const after = state.players["human"]!;
    expect(after.wonderStagesBuilt).toBe(1);
    expect(after.builtWonderStageIndices).toEqual([3]);
    expect(after.hand).not.toContain("baths");
    expect(state.discardPile).toContain("baths");

    const wonderSide = getWonderSide("greatwall", "B");
    expect(getUnbuiltStageIndices(after, wonderSide)).toEqual([0, 1, 2]);
  });

  it("side B stage 4 (dynamicResource: fillGap) contributes a production slot once built", () => {
    const human = makePlayer("human", {
      wonderId: "greatwall",
      wonderSide: "B",
      wonderStagesBuilt: 1,
      builtWonderStageIndices: [3],
      builtCardIds: ["stone-pit", "stone-pit"], // produces stone; starting resource is loom
      coins: 0,
      hand: [],
    });

    const slots = getProductionSlots(human);
    const dynamicSlot = slots.find((s) => s.id === "wonder:3:dynamic");
    expect(dynamicSlot).toBeDefined();
    expect(dynamicSlot!.domain).not.toContain("stone");
    expect(dynamicSlot!.domain).not.toContain("loom");
    expect(dynamicSlot!.domain).toContain("wood");
  });

  it("side B stage 3 grants a diplomacy token and makes every other player pay 2 coins", () => {
    const human = makePlayer("human", {
      wonderId: "greatwall",
      wonderSide: "B",
      wonderStagesBuilt: 0,
      builtWonderStageIndices: [],
      builtCardIds: ["press", "timber-yard", "timber-yard"], // 1 papyrus + 2 wood, covers stage 3's { papyrus: 1, wood: 2 } cost
      coins: 0,
      diplomacyTokens: 0,
      hand: ["baths"],
    });
    const left = makePlayer("left", { coins: 5 });
    const right = makePlayer("right", { coins: 5 });
    const state = makeGameState(["human", "left", "right"], { human, left, right });

    applyAction(state, "human", { type: "buildWonderStage", cardId: "baths", stageIndex: 2 });

    expect(state.players["human"]!.diplomacyTokens).toBe(1);
    expect(state.players["left"]!.coins).toBe(3);
    expect(state.players["right"]!.coins).toBe(3);
  });

  it("a normal sequential wonder (Gizah) ignores any stageIndex and always resolves the next stage", () => {
    const human = makePlayer("human", {
      wonderId: "gizah",
      wonderSide: "A",
      wonderStagesBuilt: 0,
      builtWonderStageIndices: [],
      coins: 0,
      hand: ["baths"],
    });
    const state = makeGameState(["human", "left", "right"], { human, left: makePlayer("left"), right: makePlayer("right") });

    const withoutIndex = canBuildWonderStage(state, "human", "baths");
    const withIrrelevantIndex = canBuildWonderStage(state, "human", "baths", 2);
    expect(withIrrelevantIndex.legal).toBe(withoutIndex.legal);
    expect(withIrrelevantIndex.reason).toBe(withoutIndex.reason);
  });
});
