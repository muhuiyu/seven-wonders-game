import type { HandCardView } from "@sw/shared";
import { cardById, chainChildren, chainParents } from "../lib/format";
import { COLOR_VAR } from "../lib/colors";
import { CardEffectsView, CostView } from "./CardEffects";
import { ChainPreview } from "./ChainPreview";
import { HoverTooltip } from "./HoverTooltip";

export { COLOR_VAR };

interface Props {
  view: HandCardView;
  selected: boolean;
  onSelect: () => void;
}

export function CardTile({ view, selected, onSelect }: Props) {
  const card = cardById(view.cardId);
  // No hand card is ever hard-disabled: discarding for 3 coins (and, for already-built
  // duplicates, funding a wonder stage) is always legal regardless of buildability, so every
  // card must stay selectable. These classes only dim the tile to hint that Build is unavailable.
  const unaffordable = !view.alreadyBuilt && !view.buildAffordable && !view.wonderStageAffordable;
  const hasChains = chainParents(card).length > 0 || chainChildren(card).length > 0;

  const button = (
    <button
      className={`card-tile${selected ? " selected" : ""}${view.alreadyBuilt ? " already-built-tile" : ""}${unaffordable ? " unaffordable" : ""}`}
      style={{ background: COLOR_VAR[card.color] }}
      onClick={onSelect}
    >
      <div className="card-name">{card.name}</div>
      <div className="card-cost">
        <CostView cost={card.cost} />
      </div>
      {card.effects.length > 0 && (
        <div className="card-effect">
          <CardEffectsView card={card} />
        </div>
      )}
      {view.alreadyBuilt && <div className="already-built">Already built</div>}
    </button>
  );

  if (!hasChains) return button;

  return (
    <HoverTooltip wide content={<ChainPreview card={card} />}>
      {button}
    </HoverTooltip>
  );
}
