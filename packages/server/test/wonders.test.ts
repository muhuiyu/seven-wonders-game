import { getUnbuiltStageIndices, getWonderSide } from "@sw/shared";
import { describe, expect, it } from "vitest";
import { canBuildCard, canBuildWonderStage } from "../src/engine/actionResolution.js";
import { applyAction } from "../src/engine/applyAction.js";
import { applyLeaderAction } from "../src/engine/leaders.js";
import { getProductionSlots } from "../src/engine/productionSlots.js";
import { createGame, resolveMirroredWonderStages } from "../src/engine/setup.js";
import { getNeighborIds } from "../src/engine/seating.js";
import { getShieldCount } from "../src/engine/shields.js";
import { wonderVp } from "../src/engine/scoring.js";
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

describe("Manneken Pis — mirrors a neighbor's wonder stages", () => {
  it("resolves Side A's mirror stages against the human's actual neighbors at setup, seed-independently", () => {
    const state = createGame({
      playerCount: 4,
      humanName: "Human",
      seed: 42,
      humanWonderId: "mannekenpis",
      humanWonderSide: "A",
      expansions: { leaders: false, cities: false },
    });
    const human = state.players["human"]!;
    const { leftId, rightId } = getNeighborIds(state, "human");
    const leftSide = getWonderSide(state.players[leftId]!.wonderId, state.players[leftId]!.wonderSide);
    const rightSide = getWonderSide(state.players[rightId]!.wonderId, state.players[rightId]!.wonderSide);

    expect(human.resolvedWonderStages).toBeDefined();
    const resolved = human.resolvedWonderStages!;
    const expectedFor = (side: typeof leftSide, stageIndex: number) => (side.wonderId === "greatwall" ? { cost: [], effects: [] } : (side.stages[stageIndex] ?? { cost: [], effects: [] }));

    expect(resolved[0]).toEqual(expectedFor(leftSide, 0)); // dev 1: left's stage 1
    expect(resolved[1]).toEqual(expectedFor(rightSide, 1)); // dev 2: right's stage 2
    expect(resolved[2]).toEqual(expectedFor(leftSide, 2)); // dev 3: left's stage 3
  });

  it("a mirror target that doesn't exist on the neighbor's side (fewer stages) is a permanently unbuildable placeholder", () => {
    const human = makePlayer("human", {
      wonderId: "mannekenpis",
      wonderSide: "A",
      wonderStagesBuilt: 2, // dev 1 + dev 2 already built, so the next stage to check is dev 3 (index 2)
      hand: ["baths"],
      coins: 0,
    });
    const left = makePlayer("left", { wonderId: "rhodos", wonderSide: "B" }); // only 2 stages — no "third stage" to mirror for dev 3
    const right = makePlayer("right", { wonderId: "gizah", wonderSide: "A" });
    // seats order is [leftId, humanId, rightId] — getNeighborIds treats the previous seat as
    // "left" and the next seat as "right", so this ordering is what actually makes the
    // `left`/`right` player objects each other's real neighbors.
    const state = makeGameState(["left", "human", "right"], { human, left, right });

    resolveMirroredWonderStages(state);

    expect(state.players["human"]!.resolvedWonderStages![2]).toEqual({ cost: [], effects: [] });
    const check = canBuildWonderStage(state, "human", "baths");
    expect(check.legal).toBe(false);
    expect(check.reason).toBe("no valid stage to mirror");
  });

  it("mirroring a Great Wall neighbor requires an explicit mirrorStageIndex choice, and applyAction persists it", () => {
    const human = makePlayer("human", {
      wonderId: "mannekenpis",
      wonderSide: "A",
      wonderStagesBuilt: 0,
      hand: ["baths"],
      coins: 0,
      builtCardIds: ["press", "lumber-yard"], // papyrus + wood, covers Great Wall B stage 1's { papyrus: 1, wood: 1 } cost
    });
    const left = makePlayer("left", { wonderId: "greatwall", wonderSide: "B", coins: 3 }); // dev 1 mirrors left's stage index 0
    const right = makePlayer("right", { wonderId: "gizah", wonderSide: "A", coins: 3 });
    const state = makeGameState(["left", "human", "right"], { human, left, right }); // see seat-order note above
    resolveMirroredWonderStages(state);

    const withoutChoice = canBuildWonderStage(state, "human", "baths");
    expect(withoutChoice.legal).toBe(false);
    expect(withoutChoice.reason).toBe("choose which Great Wall stage to mirror");

    const withChoice = canBuildWonderStage(state, "human", "baths", undefined, 0);
    expect(withChoice.legal).toBe(true);

    applyAction(state, "human", { type: "buildWonderStage", cardId: "baths", mirrorStageIndex: 0 });

    const after = state.players["human"]!;
    expect(after.wonderStagesBuilt).toBe(1);
    expect(after.resolvedWonderStages![0]).toEqual(getWonderSide("greatwall", "B").stages[0]);
    // Great Wall B stage 1: bankGrantSelfAndNeighbors(self: 8, neighbors: 2) — applied as human's own effect.
    expect(after.coins).toBe(8);
    expect(state.players["left"]!.coins).toBe(5);
    expect(state.players["right"]!.coins).toBe(5);
  });

  it("Side B's single development grants coins, a shield, and VP all together", () => {
    const human = makePlayer("human", {
      wonderId: "mannekenpis",
      wonderSide: "B",
      wonderStagesBuilt: 0,
      hand: ["baths"],
      coins: 0,
      builtCardIds: ["lumber-yard", "stone-pit", "ore-vein", "clay-pool", "glassworks", "loom-good", "press"], // 1 of each raw resource
    });
    const state = makeGameState(["human", "left", "right"], { human, left: makePlayer("left"), right: makePlayer("right") });

    applyAction(state, "human", { type: "buildWonderStage", cardId: "baths" });

    const after = state.players["human"]!;
    expect(after.wonderStagesBuilt).toBe(1);
    expect(after.coins).toBe(7);
    expect(getShieldCount(after)).toBe(1);
  });

  it("gives +4 starting coins on top of the normal base (additive), with or without Leaders", () => {
    const base = createGame({ playerCount: 3, humanName: "Human", seed: 7, humanWonderId: "mannekenpis", expansions: { leaders: false, cities: false } });
    expect(base.players["human"]!.coins).toBe(3 + 4);

    const withLeaders = createGame({ playerCount: 3, humanName: "Human", seed: 7, humanWonderId: "mannekenpis", expansions: { leaders: true, cities: false } });
    expect(withLeaders.players["human"]!.coins).toBe(6 + 4);
  });
});

describe("Stonehenge — resource-producer and marked-color scoring", () => {
  it("Side A stage 3 scores VP per dedicated stone-producing card, not flex producers", () => {
    const human = makePlayer("human", {
      wonderId: "stonehenge",
      wonderSide: "A",
      wonderStagesBuilt: 3, // all 3 stages built
      builtWonderStageIndices: [],
      builtCardIds: ["stone-pit", "stone-pit", "timber-yard"], // 2 dedicated stone producers; timber-yard is wood-OR-stone, doesn't count
    });
    const state = makeGameState(["human", "left", "right"], { human, left: makePlayer("left"), right: makePlayer("right") });

    expect(wonderVp(state, "human")).toBe(3 + 5 + 2 * 2); // stage1 vp3 + stage2 vp5 + stage3 (2 producers * 2)
  });

  it("Side B stage 1 grants immediate coins and endgame VP per built stone-producing card", () => {
    const human = makePlayer("human", {
      wonderId: "stonehenge",
      wonderSide: "B",
      wonderStagesBuilt: 0,
      builtCardIds: ["stone-pit", "stone-pit", "stone-pit", "ore-vein", "ore-vein", "ore-vein"], // 3 stone producers + 3 ore for the { ore: 3 } cost
      hand: ["baths"],
      coins: 0,
    });
    const state = makeGameState(["human", "left", "right"], { human, left: makePlayer("left"), right: makePlayer("right") });

    applyAction(state, "human", { type: "buildWonderStage", cardId: "baths" });

    const after = state.players["human"]!;
    expect(after.coins).toBe(3); // 3 stone producers * 1 coin, immediate
    expect(wonderVp(state, "human")).toBe(3); // 3 stone producers * 1 VP, endgame
  });

  it("Side B stage 2 marks the funding card's color and scores VP per matching-color card held by neighbors", () => {
    const human = makePlayer("human", {
      wonderId: "stonehenge",
      wonderSide: "B",
      wonderStagesBuilt: 1, // stage 1 already built, so this build resolves stage index 1 (dev 2)
      builtCardIds: ["clay-pool", "clay-pool", "clay-pool", "press"], // covers { clay: 3, papyrus: 1 }
      hand: ["baths"], // blue card — its color gets marked
      coins: 0,
    });
    const left = makePlayer("left", { builtCardIds: ["baths"] }); // 1 blue card
    const right = makePlayer("right", { builtCardIds: ["baths", "baths"] }); // 2 blue cards
    const state = makeGameState(["human", "left", "right"], { human, left, right });

    applyAction(state, "human", { type: "buildWonderStage", cardId: "baths" });

    expect(state.players["human"]!.markedCardColor).toBe("blue");
    expect(wonderVp(state, "human")).toBe(3); // 1 (left) + 2 (right) blue cards, 1 VP each
  });

  it("Side A stage 3 counts stone units, not just cards — a Quarry (2 stone) counts double", () => {
    const human = makePlayer("human", {
      wonderId: "stonehenge",
      wonderSide: "A",
      wonderStagesBuilt: 3,
      builtWonderStageIndices: [],
      builtCardIds: ["stone-pit", "quarry"], // 1 unit + 2 units = 3 stone units
    });
    const state = makeGameState(["human", "left", "right"], { human, left: makePlayer("left"), right: makePlayer("right") });

    expect(wonderVp(state, "human")).toBe(3 + 5 + 3 * 2); // stage1 vp3 + stage2 vp5 + stage3 (3 stone units * 2)
  });

  it("building this stage via a Leader leaves markedCardColor unset (no bonus VP), since leaders aren't card-colored", () => {
    const human = makePlayer("human", {
      wonderId: "stonehenge",
      wonderSide: "B",
      wonderStagesBuilt: 1,
      builtCardIds: ["clay-pool", "clay-pool", "clay-pool", "press"],
      leaderHand: ["aristotle"],
      coins: 0,
    });
    const left = makePlayer("left", { builtCardIds: ["baths"] });
    const state = makeGameState(["human", "left", "right"], { human, left, right: makePlayer("right") });

    applyLeaderAction(state, "human", { type: "buildWonderStageFromLeader", cardId: "aristotle" });

    expect(state.players["human"]!.markedCardColor).toBeUndefined();
    expect(wonderVp(state, "human")).toBe(0);
  });
});
