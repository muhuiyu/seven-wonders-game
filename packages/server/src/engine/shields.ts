import type { PlayerState } from "@sw/shared";
import { getActiveEffectSources } from "./effectSources.js";

export function getShieldCount(player: PlayerState): number {
  let total = 0;
  for (const effect of getActiveEffectSources(player)) {
    if (effect.kind === "shields") total += effect.count;
  }
  return total;
}
