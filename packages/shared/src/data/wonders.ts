import type { WonderSide } from "../types/wonders.js";

function side(
  wonderId: string,
  wonderName: string,
  s: "A" | "B",
  startingResource: WonderSide["startingResource"],
  stages: WonderSide["stages"],
): WonderSide {
  return { wonderId, wonderName, side: s, startingResource, stages };
}

export const WONDER_SIDES: WonderSide[] = [
  // --- Gizah (Egypt) — starting resource: stone ---
  side("gizah", "The Pyramids of Gizah", "A", "stone", [
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { wood: 3 } }], effects: [{ kind: "vp", amount: 5 }] },
    { cost: [{ resources: { stone: 4 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),
  // Gizah B has no special ability, just VP on every stage (3+5+5+7 = 20 total).
  side("gizah", "The Pyramids of Gizah", "B", "stone", [
    { cost: [{ resources: { wood: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { stone: 3 } }], effects: [{ kind: "vp", amount: 5 }] },
    { cost: [{ resources: { clay: 3 } }], effects: [{ kind: "vp", amount: 5 }] },
    { cost: [{ resources: { stone: 4, papyrus: 1 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),

  // --- Rhodos (Rhodes) — starting resource: ore ---
  side("rhodos", "The Colossus of Rhodos", "A", "ore", [
    { cost: [{ resources: { wood: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { clay: 3 } }], effects: [{ kind: "shields", count: 2 }] },
    { cost: [{ resources: { ore: 4 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),
  // Rhodos B has only 2 stages (not the usual 4).
  side("rhodos", "The Colossus of Rhodos", "B", "ore", [
    { cost: [{ resources: { clay: 3 } }], effects: [{ kind: "shields", count: 1 }, { kind: "coins", amount: 3 }, { kind: "vp", amount: 3 }] },
    { cost: [{ resources: { ore: 4 } }], effects: [{ kind: "shields", count: 1 }, { kind: "coins", amount: 4 }, { kind: "vp", amount: 4 }] },
  ]),

  // --- Ephesos (Ephesus) — starting resource: papyrus. Unlike most wonders, both sides
  // have only 3 stages (no 4-stage B side). ---
  side("ephesos", "The Temple of Artemis", "A", "papyrus", [
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { wood: 2 } }], effects: [{ kind: "coins", amount: 9 }] },
    { cost: [{ resources: { papyrus: 2 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),
  side("ephesos", "The Temple of Artemis", "B", "papyrus", [
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "coins", amount: 4 }, { kind: "vp", amount: 2 }] },
    { cost: [{ resources: { wood: 2 } }], effects: [{ kind: "coins", amount: 4 }, { kind: "vp", amount: 3 }] },
    { cost: [{ resources: { glass: 1, loom: 1, papyrus: 1 } }], effects: [{ kind: "coins", amount: 4 }, { kind: "vp", amount: 5 }] },
  ]),

  // --- Babylon — starting resource: clay ---
  side("babylon", "The Hanging Gardens of Babylon", "A", "clay", [
    { cost: [{ resources: { clay: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { wood: 3 } }], effects: [{ kind: "scienceChoice" }] },
    { cost: [{ resources: { clay: 4 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),
  // Babylon B has only 3 stages (not the usual 4).
  side("babylon", "The Hanging Gardens of Babylon", "B", "clay", [
    { cost: [{ resources: { loom: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { wood: 2, glass: 1 } }], effects: [{ kind: "extraTurn" }] },
    { cost: [{ resources: { clay: 3, papyrus: 1 } }], effects: [{ kind: "scienceChoice" }] },
  ]),

  // --- Olympia — starting resource: wood ---
  side("olympia", "The Statue of Zeus in Olympia", "A", "wood", [
    { cost: [{ resources: { wood: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "freeBuildPerAge" }] },
    { cost: [{ resources: { ore: 2 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),
  // Olympia B has only 3 stages (not the usual 4): a trading discount (equivalent to both
  // Trading Posts), a VP stage, then copying a neighboring Guild card at game end.
  side("olympia", "The Statue of Zeus in Olympia", "B", "wood", [
    { cost: [{ resources: { wood: 2 } }], effects: [{ kind: "tradeDiscount", resources: ["wood", "stone", "ore", "clay"], sides: ["left", "right"], unitCost: 1 }] },
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "vp", amount: 5 }] },
    { cost: [{ resources: { ore: 2, loom: 1 } }], effects: [{ kind: "copyGuild" }] },
  ]),

  // --- Halikarnassos (Halicarnassus) — starting resource: loom. Each stage's ability is to
  // immediately build a free card of choice from the shared discard pile (not a per-age free
  // build — that's Olympia's ability). ---
  side("halikarnassos", "The Mausoleum of Halikarnassos", "A", "loom", [
    { cost: [{ resources: { clay: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { ore: 3 } }], effects: [{ kind: "buildFromDiscardPile" }] },
    { cost: [{ resources: { loom: 2 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),
  // Halikarnassos B has only 3 stages (not the usual 4), and every stage grants buildFromDiscardPile.
  side("halikarnassos", "The Mausoleum of Halikarnassos", "B", "loom", [
    { cost: [{ resources: { ore: 2 } }], effects: [{ kind: "vp", amount: 2 }, { kind: "buildFromDiscardPile" }] },
    { cost: [{ resources: { clay: 3 } }], effects: [{ kind: "vp", amount: 1 }, { kind: "buildFromDiscardPile" }] },
    { cost: [{ resources: { glass: 1, loom: 1, papyrus: 1 } }], effects: [{ kind: "buildFromDiscardPile" }] },
  ]),

  // --- Alexandria — starting resource: glass ---
  side("alexandria", "The Lighthouse of Alexandria", "A", "glass", [
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { ore: 2 } }], effects: [{ kind: "resource", production: { options: ["wood", "stone", "ore", "clay"], qty: 1 } }] },
    { cost: [{ resources: { glass: 2 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),
  // Alexandria B has only 3 stages (not the usual 4).
  side("alexandria", "The Lighthouse of Alexandria", "B", "glass", [
    { cost: [{ resources: { clay: 2 } }], effects: [{ kind: "resource", production: { options: ["wood", "stone", "ore", "clay"], qty: 1 } }] },
    { cost: [{ resources: { wood: 2 } }], effects: [{ kind: "resource", production: { options: ["loom", "glass", "papyrus"], qty: 1 } }] },
    { cost: [{ resources: { stone: 3 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),

  // --- Roma (Leaders expansion) — no starting resource. Its bonus is instead a Leader
  // recruitment discount active from the start of the game (not gated behind building a
  // stage): Day side recruits Leaders for free, Night side gets a partial discount that
  // also extends 1 coin to each neighbor. Stage costs/VP below match the wonder board.
  // The physical game's Night-side "draw 4 fresh Leaders mid-game" (stage 1) and "recruit
  // an extra Leader" (stages 2-3) effects aren't modeled — there's no in-engine mechanic
  // for post-draft leader-pool draws or a second recruitment slot — so those stages grant
  // coins/VP instead, keeping the wonder a coherent, playable option. ---
  { ...side("roma", "Roma", "A", undefined, [
    { cost: [{ resources: { wood: 1, ore: 1, clay: 1 } }], effects: [{ kind: "vp", amount: 4 }] },
    { cost: [{ resources: { stone: 2, clay: 1, loom: 1 } }], effects: [{ kind: "vp", amount: 6 }] },
  ]), requiresExpansion: "leaders", startingEffects: [{ kind: "freeLeaderRecruitment" }] },
  { ...side("roma", "Roma", "B", undefined, [
    { cost: [{ resources: { wood: 1, clay: 1 } }], effects: [{ kind: "coins", amount: 5 }] },
    { cost: [{ resources: { stone: 1, clay: 1, glass: 1 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { stone: 2, papyrus: 1 } }], effects: [{ kind: "vp", amount: 3 }] },
  ]), requiresExpansion: "leaders", startingEffects: [{ kind: "leaderRecruitmentDiscount", self: 2, neighbors: 1 }] },

  // --- Petra (Cities expansion) — starting resource: clay ---
  { ...side("petra", "Al-Khazneh of Petra", "A", "clay", [
    { cost: [{ resources: { wood: 1, stone: 1 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ coins: 5 }], effects: [{ kind: "vp", amount: 7 }] },
    { cost: [{ resources: { stone: 2, wood: 1, papyrus: 1 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]), requiresExpansion: "cities" },
  { ...side("petra", "Al-Khazneh of Petra", "B", "clay", [
    { cost: [{ resources: { ore: 2, clay: 2 } }], effects: [{ kind: "vp", amount: 3 }, { kind: "opponentsPayOrDebt", amount: 2 }] },
    { cost: [{ coins: 10 }], effects: [{ kind: "vp", amount: 14 }] },
  ]), requiresExpansion: "cities" },

  // --- Byzantium (Cities expansion) — starting resource: stone ---
  { ...side("byzantium", "Hagia Sophia of Byzantium", "A", "stone", [
    { cost: [{ resources: { ore: 1, clay: 1 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { wood: 2, papyrus: 1 } }], effects: [{ kind: "diplomacyToken" }, { kind: "vp", amount: 4 }] },
    { cost: [{ resources: { clay: 2, glass: 1, loom: 1 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]), requiresExpansion: "cities" },
  { ...side("byzantium", "Hagia Sophia of Byzantium", "B", "stone", [
    { cost: [{ resources: { wood: 1, ore: 1, papyrus: 1 } }], effects: [{ kind: "diplomacyToken" }, { kind: "vp", amount: 4 }] },
    { cost: [{ resources: { ore: 2, glass: 1, loom: 1 } }], effects: [{ kind: "diplomacyToken" }, { kind: "vp", amount: 6 }] },
  ]), requiresExpansion: "cities" },
];

export const WONDER_IDS = ["gizah", "rhodos", "ephesos", "babylon", "olympia", "halikarnassos", "alexandria"] as const;

export const EXPANSION_WONDER_IDS = ["roma", "petra", "byzantium"] as const;

export function getWonderSide(wonderId: string, side: "A" | "B"): WonderSide {
  const found = WONDER_SIDES.find((w) => w.wonderId === wonderId && w.side === side);
  if (!found) throw new Error(`Unknown wonder side: ${wonderId} ${side}`);
  return found;
}

/** All wonder ids selectable given the active expansions (base 7 always included). */
export function getAvailableWonderIds(expansions: { leaders: boolean; cities: boolean }): string[] {
  const ids: string[] = [...WONDER_IDS];
  for (const id of EXPANSION_WONDER_IDS) {
    const anySide = WONDER_SIDES.find((w) => w.wonderId === id);
    if (anySide?.requiresExpansion && expansions[anySide.requiresExpansion]) ids.push(id);
  }
  return ids;
}
