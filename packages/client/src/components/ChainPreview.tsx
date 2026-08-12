import type { Card } from "@sw/shared";
import { chainChildren, chainParents } from "../lib/format";
import { COLOR_VAR } from "../lib/colors";
import { CardEffectsView, CostView } from "./CardEffects";

function ChainCard({ card }: { card: Card }) {
  return (
    <div className="chain-card" style={{ background: COLOR_VAR[card.color] }}>
      <div className="chain-card-name">{card.name}</div>
      <div className="chain-card-cost">
        <CostView cost={card.cost} />
      </div>
      {card.effects.length > 0 && (
        <div className="chain-card-effect">
          <CardEffectsView card={card} />
        </div>
      )}
    </div>
  );
}

/** Shows the cards a card chains from (built it once, this one's free) and chains into
 *  (building this one makes a later-Age card free), as mini previews. Renders nothing if
 *  the card has no chain relations. */
export function ChainPreview({ card }: { card: Card }) {
  const parents = chainParents(card);
  const children = chainChildren(card);
  if (parents.length === 0 && children.length === 0) return null;

  return (
    <div className="chain-preview">
      {parents.length > 0 && (
        <div className="chain-group">
          <div className="chain-group-label">Chains from</div>
          <div className="chain-cards">
            {parents.map((p) => (
              <ChainCard key={p.id} card={p} />
            ))}
          </div>
        </div>
      )}
      {children.length > 0 && (
        <div className="chain-group">
          <div className="chain-group-label">Unlocks free</div>
          <div className="chain-cards">
            {children.map((c) => (
              <ChainCard key={c.id} card={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
