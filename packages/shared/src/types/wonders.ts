import type { Cost, CardEffect, ExpansionId } from "./cards.js";
import type { ResourceType } from "./resources.js";

export interface WonderStage {
  cost: Cost;
  effects: CardEffect[];
}

export interface WonderSide {
  wonderId: string;
  wonderName: string;
  side: "A" | "B";
  /** Raw resource this wonder produces for free from the start of the game. Absent for wonders (e.g. Roma) whose starting bonus isn't a resource. */
  startingResource?: ResourceType;
  /** Effects active from the start of the game, independent of any wonder stage being built (e.g. Roma's Leader recruitment bonus). */
  startingEffects?: CardEffect[];
  stages: WonderStage[];
  requiresExpansion?: ExpansionId;
  /** When true, stages may be built in any order (currently only The Great Wall) instead of the usual strict left-to-right order. */
  anyOrder?: boolean;
}
