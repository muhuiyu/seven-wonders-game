import type { ReactNode } from "react";
import type { Card } from "@sw/shared";
import { chainChildren, chainParents } from "../lib/format";
import { HoverTooltip } from "./HoverTooltip";
import { CardEffectsView, CostView } from "./CardEffects";
import { ChainPreview } from "./ChainPreview";

interface Props {
  card: Card;
  children: ReactNode;
}

/** Wraps `children` with a hover tooltip showing the card's name, cost, effect, and (if it
 *  has any) the cards it chains from/into. */
export function CardTooltip({ card, children }: Props) {
  const hasChains = chainParents(card).length > 0 || chainChildren(card).length > 0;

  return (
    <HoverTooltip
      wide={hasChains}
      content={
        <>
          <span className="card-tooltip-name">{card.name}</span>
          <span className="card-tooltip-cost">
            <CostView cost={card.cost} />
          </span>
          {card.effects.length > 0 && (
            <span className="card-tooltip-effect">
              <CardEffectsView card={card} />
            </span>
          )}
          <ChainPreview card={card} />
        </>
      }
    >
      {children}
    </HoverTooltip>
  );
}
