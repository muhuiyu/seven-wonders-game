import type { ResourceType, ScienceSymbol } from "@sw/shared";

import wood from "../assets/icons/wood.png";
import stone from "../assets/icons/stone.png";
import ore from "../assets/icons/ore.png";
import clay from "../assets/icons/clay.png";
import glass from "../assets/icons/glass.png";
import loom from "../assets/icons/loom.png";
import papyrus from "../assets/icons/papyrus.png";
import cog from "../assets/icons/cog.png";
import compass from "../assets/icons/compass.png";
import tablet from "../assets/icons/tablet.png";
import shield from "../assets/icons/shield.png";
import diplomacyToken from "../assets/icons/diplomacy-token.png";

/** Real card-art icons sourced from the 7 Wonders wiki (static.wikia.nocookie.net), used in
 *  place of emoji for resources, science symbols, and military shields. Coins and victory
 *  points stay emoji — the wiki only hosts those with a digit baked into the icon. */
export const RESOURCE_IMG: Record<ResourceType, string> = {
  wood,
  stone,
  ore,
  clay,
  glass,
  loom,
  papyrus,
};

export const SCIENCE_IMG: Record<ScienceSymbol, string> = {
  cog,
  compass,
  tablet,
};

export const SHIELD_IMG = shield;

export const DIPLOMACY_TOKEN_IMG = diplomacyToken;
