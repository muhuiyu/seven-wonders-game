import type { ReactNode } from "react";
import type { LeaderCard } from "@sw/shared";
import { HoverTooltip } from "./HoverTooltip";
import { CardEffectsView } from "./CardEffects";

interface Props {
  leader: LeaderCard;
  children: ReactNode;
}

/** Wraps `children` with a hover tooltip showing the leader's name and effect. */
export function LeaderTooltip({ leader, children }: Props) {
  return (
    <HoverTooltip
      content={
        <>
          <span className="card-tooltip-name">{leader.name}</span>
          {leader.effects.length > 0 && (
            <span className="card-tooltip-effect">
              <CardEffectsView card={leader} />
            </span>
          )}
        </>
      }
    >
      {children}
    </HoverTooltip>
  );
}
