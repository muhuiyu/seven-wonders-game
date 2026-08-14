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
import victoryPoint1 from "../assets/icons/victory-point-1.png";
import victoryPoint2 from "../assets/icons/victory-point-2.png";
import victoryPoint3 from "../assets/icons/victory-point-3.png";
import victoryPoint4 from "../assets/icons/victory-point-4.png";
import victoryPoint5 from "../assets/icons/victory-point-5.png";
import victoryPoint6 from "../assets/icons/victory-point-6.png";
import victoryPoint7 from "../assets/icons/victory-point-7.png";
import victoryPoint8 from "../assets/icons/victory-point-8.png";

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

export function victoryPointIcon(points: number) {
  if (points < 1 || points > 8) throw new Error(`Invalid victory point icon: ${points}`);
  return {
    1: victoryPoint1,
    2: victoryPoint2,
    3: victoryPoint3,
    4: victoryPoint4,
    5: victoryPoint5,
    6: victoryPoint6,
    7: victoryPoint7,
    8: victoryPoint8,
  }[points];
}