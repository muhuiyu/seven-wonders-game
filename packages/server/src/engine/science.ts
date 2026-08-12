import { getCard, type GameState, type PlayerState, type ScienceSymbol } from "@sw/shared";
import { getActiveEffectSources } from "./effectSources.js";
import { getNeighbors } from "./seating.js";

export type SymbolCounts = Record<ScienceSymbol, number>;

export function getScienceSymbolCounts(player: PlayerState): SymbolCounts {
  const counts: SymbolCounts = { cog: 0, compass: 0, tablet: 0 };
  for (const effect of getActiveEffectSources(player)) {
    if (effect.kind === "science") counts[effect.symbol]++;
  }
  for (const symbol of player.chosenScienceSymbols) counts[symbol]++;
  return counts;
}

interface ScienceCopyCandidate {
  key: string;
  symbol: ScienceSymbol;
}

function collectNeighborScienceCandidates(state: GameState, playerId: string): ScienceCopyCandidate[] {
  const { left, right } = getNeighbors(state, playerId);
  const candidates: ScienceCopyCandidate[] = [];
  for (const [side, neighbor] of [["left", left] as const, ["right", right] as const]) {
    for (const cardId of neighbor.builtCardIds) {
      const card = getCard(cardId);
      if (card.color !== "green") continue;
      for (const effect of card.effects) {
        if (effect.kind === "science") candidates.push({ key: `${side}:${cardId}`, symbol: effect.symbol });
      }
    }
  }
  return candidates;
}

/**
 * Cities' "copy a neighbor's science symbol" cards (Pigeon Loft/Spy Ring/Torture
 * Chamber) are auto-resolved to whichever available neighbor green-card symbols
 * maximize the final science score, greedily re-evaluating after each pick (mirrors
 * bestScienceChoice's existing auto-resolution pattern elsewhere in this file).
 */
export function getEffectiveScienceCounts(state: GameState, playerId: string): SymbolCounts {
  const player = state.players[playerId]!;
  const counts = getScienceSymbolCounts(player);
  const copyCount = getActiveEffectSources(player).filter((e) => e.kind === "copyNeighborScienceSymbol").length;
  if (copyCount === 0) return counts;

  const pool = collectNeighborScienceCandidates(state, playerId);
  for (let i = 0; i < copyCount && pool.length > 0; i++) {
    let bestIdx = 0;
    let bestGain = -Infinity;
    for (let j = 0; j < pool.length; j++) {
      const symbol = pool[j]!.symbol;
      const next = { ...counts, [symbol]: counts[symbol] + 1 };
      const gain = scoreScience(next) - scoreScience(counts);
      if (gain > bestGain) {
        bestGain = gain;
        bestIdx = j;
      }
    }
    counts[pool[bestIdx]!.symbol]++;
    pool.splice(bestIdx, 1);
  }
  return counts;
}

/** Standard Seven Wonders science formula: sum of squares + 7 points per complete matched set. */
export function scoreScience(counts: SymbolCounts): number {
  const squares = counts.cog ** 2 + counts.compass ** 2 + counts.tablet ** 2;
  const sets = Math.min(counts.cog, counts.compass, counts.tablet);
  return squares + 7 * sets;
}

/** Picks the science symbol that yields the highest marginal VP if added to `counts` — used to auto-resolve "scienceChoice" effects. */
export function bestScienceChoice(counts: SymbolCounts): ScienceSymbol {
  const symbols: ScienceSymbol[] = ["cog", "compass", "tablet"];
  let best: ScienceSymbol = "cog";
  let bestGain = -Infinity;
  for (const s of symbols) {
    const next = { ...counts, [s]: counts[s] + 1 };
    const gain = scoreScience(next) - scoreScience(counts);
    if (gain > bestGain) {
      bestGain = gain;
      best = s;
    }
  }
  return best;
}
