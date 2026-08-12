export const BASIC_RESOURCES = ["wood", "stone", "ore", "clay"] as const;
export const MANUFACTURED_RESOURCES = ["glass", "loom", "papyrus"] as const;

export type BasicResource = (typeof BASIC_RESOURCES)[number];
export type ManufacturedResource = (typeof MANUFACTURED_RESOURCES)[number];
export type ResourceType = BasicResource | ManufacturedResource;

export const ALL_RESOURCES: ResourceType[] = [...BASIC_RESOURCES, ...MANUFACTURED_RESOURCES];

/** A single production slot: qty units, each independently chosen from `options` (length 1 = fixed). */
export type ProductionOption = {
  options: ResourceType[];
  qty: number;
};

export type NeighborSide = "left" | "right";
export type PlayerScope = "self" | "leftNeighbor" | "rightNeighbor" | "bothNeighbors";
