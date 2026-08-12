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
  startingResource: ResourceType;
  stages: WonderStage[];
  requiresExpansion?: ExpansionId;
}
