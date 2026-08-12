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
  side("gizah", "The Pyramids of Gizah", "B", "stone", [
    { cost: [{ resources: { wood: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { stone: 3 } }], effects: [{ kind: "vp", amount: 5 }] },
    { cost: [{ resources: { clay: 3, wood: 2 } }], effects: [{ kind: "shields", count: 2 }, { kind: "vp", amount: 2 }] },
    { cost: [{ resources: { stone: 4, clay: 4 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),

  // --- Rhodos (Rhodes) — starting resource: ore ---
  side("rhodos", "The Colossus of Rhodos", "A", "ore", [
    { cost: [{ resources: { wood: 2 } }], effects: [{ kind: "coins", amount: 3 }, { kind: "shields", count: 1 }] },
    { cost: [{ resources: { clay: 3 } }], effects: [{ kind: "coins", amount: 4 }, { kind: "shields", count: 1 }] },
    { cost: [{ resources: { ore: 4 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),
  side("rhodos", "The Colossus of Rhodos", "B", "ore", [
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "shields", count: 1 }] },
    { cost: [{ resources: { ore: 3 } }], effects: [{ kind: "coins", amount: 6 }, { kind: "vp", amount: 3 }] },
    { cost: [{ resources: { wood: 3, clay: 2 } }], effects: [{ kind: "shields", count: 2 }] },
    { cost: [{ resources: { ore: 4, loom: 1, papyrus: 1 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),

  // --- Ephesos (Ephesus) — starting resource: papyrus ---
  side("ephesos", "The Temple of Artemis", "A", "papyrus", [
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "coins", amount: 4 }] },
    { cost: [{ resources: { wood: 2, papyrus: 1 } }], effects: [{ kind: "coins", amount: 4 }, { kind: "vp", amount: 2 }] },
    { cost: [{ resources: { papyrus: 2, glass: 1 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),
  side("ephesos", "The Temple of Artemis", "B", "papyrus", [
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "coins", amount: 4 }] },
    { cost: [{ resources: { wood: 2, ore: 1 } }], effects: [{ kind: "coins", amount: 4 }, { kind: "vp", amount: 2 }] },
    { cost: [{ resources: { papyrus: 1, loom: 1, glass: 1 } }], effects: [{ kind: "vp", amount: 5 }] },
    { cost: [{ resources: { ore: 2, glass: 2 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),

  // --- Babylon — starting resource: clay ---
  side("babylon", "The Hanging Gardens of Babylon", "A", "clay", [
    { cost: [{ resources: { clay: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { wood: 3 } }], effects: [{ kind: "scienceChoice" }] },
    { cost: [{ resources: { clay: 4, loom: 1 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),
  side("babylon", "The Hanging Gardens of Babylon", "B", "clay", [
    { cost: [{ resources: { clay: 2 } }], effects: [{ kind: "vp", amount: 2 }] },
    { cost: [{ resources: { wood: 2, ore: 1 } }], effects: [{ kind: "extraTurn" }] },
    { cost: [{ resources: { clay: 3, papyrus: 1 } }], effects: [{ kind: "scienceChoice" }] },
    { cost: [{ resources: { clay: 4, loom: 2 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),

  // --- Olympia — starting resource: wood ---
  side("olympia", "The Statue of Zeus in Olympia", "A", "wood", [
    { cost: [{ resources: { wood: 2 } }], effects: [{ kind: "resource", production: { options: ["wood", "stone", "ore", "clay"], qty: 1 } }] },
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "vp", amount: 5 }] },
    { cost: [{ resources: { ore: 3, loom: 1 } }], effects: [{ kind: "freeBuildPerAge" }] },
  ]),
  side("olympia", "The Statue of Zeus in Olympia", "B", "wood", [
    { cost: [{ resources: { wood: 2 } }], effects: [{ kind: "resource", production: { options: ["loom", "glass", "papyrus"], qty: 1 } }] },
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "vp", amount: 4 }] },
    { cost: [{ resources: { ore: 2, clay: 2 } }], effects: [{ kind: "freeBuildPerAge" }] },
    { cost: [{ resources: { wood: 3, stone: 3, ore: 2 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),

  // --- Halikarnassos (Halicarnassus) — starting resource: loom ---
  side("halikarnassos", "The Mausoleum of Halikarnassos", "A", "loom", [
    { cost: [{ resources: { clay: 2 } }], effects: [{ kind: "freeBuildPerAge" }] },
    { cost: [{ resources: { wood: 3 } }], effects: [{ kind: "vp", amount: 5 }] },
    { cost: [{ resources: { glass: 2, loom: 1 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),
  side("halikarnassos", "The Mausoleum of Halikarnassos", "B", "loom", [
    { cost: [{ resources: { clay: 2 } }], effects: [{ kind: "coins", amount: 6 }] },
    { cost: [{ resources: { wood: 2, glass: 1 } }], effects: [{ kind: "freeBuildPerAge" }] },
    { cost: [{ resources: { ore: 3, loom: 1 } }], effects: [{ kind: "vp", amount: 5 }] },
    { cost: [{ resources: { clay: 3, papyrus: 2 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),

  // --- Alexandria — starting resource: glass ---
  side("alexandria", "The Lighthouse of Alexandria", "A", "glass", [
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "resource", production: { options: ["wood", "stone", "ore", "clay"], qty: 1 } }] },
    { cost: [{ resources: { ore: 2 } }], effects: [{ kind: "resource", production: { options: ["loom", "glass", "papyrus"], qty: 1 } }] },
    { cost: [{ resources: { glass: 2, papyrus: 1 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),
  side("alexandria", "The Lighthouse of Alexandria", "B", "glass", [
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "resource", production: { options: ["wood", "stone", "ore", "clay"], qty: 1 } }] },
    { cost: [{ resources: { ore: 2 } }], effects: [{ kind: "coins", amount: 4 }, { kind: "vp", amount: 2 }] },
    { cost: [{ resources: { glass: 1, loom: 1, papyrus: 1 } }], effects: [{ kind: "resource", production: { options: ["loom", "glass", "papyrus"], qty: 1 } }] },
    { cost: [{ resources: { stone: 3, ore: 3 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]),

  // --- Roma (Leaders expansion) — starting resource: ore. Simplified digital rendition:
  // side B's physical-game "draw 4 fresh Leaders mid-game / extra discounted recruit"
  // ability isn't modeled (no in-engine mechanic for post-draft leader redraws); it's
  // replaced with a straightforward coin/VP stage so the wonder is still a coherent,
  // playable option distinct from side A's free-recruitment focus. ---
  { ...side("roma", "Roma", "A", "ore", [
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "vp", amount: 4 }, { kind: "freeLeaderRecruitment" }] },
    { cost: [{ resources: { wood: 3 } }], effects: [{ kind: "vp", amount: 6 }] },
  ]), requiresExpansion: "leaders" },
  { ...side("roma", "Roma", "B", "ore", [
    { cost: [{ resources: { clay: 2 } }], effects: [{ kind: "coins", amount: 5 }] },
    { cost: [{ resources: { stone: 2, ore: 1 } }], effects: [{ kind: "vp", amount: 3 }, { kind: "freeLeaderRecruitment" }] },
    { cost: [{ resources: { wood: 2, clay: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
  ]), requiresExpansion: "leaders" },

  // --- Petra (Cities expansion) — starting resource: stone. Stage 2's 7-coin cost is
  // the one number confirmed by research; the other stage resource costs are set in
  // line with the base wonders' typical range. ---
  { ...side("petra", "Al-Khazneh of Petra", "A", "stone", [
    { cost: [{ resources: { clay: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ coins: 7 }], effects: [{ kind: "vp", amount: 7 }] },
    { cost: [{ resources: { stone: 3, clay: 2 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]), requiresExpansion: "cities" },
  { ...side("petra", "Al-Khazneh of Petra", "B", "stone", [
    { cost: [{ resources: { stone: 2 } }], effects: [{ kind: "vp", amount: 3 }, { kind: "opponentsPayOrDebt", amount: 2 }] },
    { cost: [{ coins: 14 }], effects: [{ kind: "vp", amount: 14 }] },
  ]), requiresExpansion: "cities" },

  // --- Byzantium (Cities expansion) — starting resource: papyrus. Stage resource costs
  // are set in line with the base wonders' typical range (research confirmed the VP
  // and Diplomacy-token grants but not resource costs). ---
  { ...side("byzantium", "Hagia Sophia of Byzantium", "A", "papyrus", [
    { cost: [{ resources: { wood: 2 } }], effects: [{ kind: "vp", amount: 3 }] },
    { cost: [{ resources: { ore: 2, loom: 1 } }], effects: [{ kind: "diplomacyToken" }, { kind: "vp", amount: 2 }] },
    { cost: [{ resources: { stone: 3, papyrus: 1 } }], effects: [{ kind: "vp", amount: 7 }] },
  ]), requiresExpansion: "cities" },
  { ...side("byzantium", "Hagia Sophia of Byzantium", "B", "papyrus", [
    { cost: [{ resources: { clay: 2 } }], effects: [{ kind: "diplomacyToken" }, { kind: "vp", amount: 3 }] },
    { cost: [{ resources: { ore: 2, stone: 2 } }], effects: [{ kind: "diplomacyToken" }, { kind: "vp", amount: 4 }] },
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
