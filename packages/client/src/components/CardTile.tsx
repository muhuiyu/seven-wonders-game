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
  const disabled = view.alreadyBuilt || (!view.buildAffordable && !view.wonderStageAffordable);
  const hasChains = chainParents(card).length > 0 || chainChildren(card).length > 0;

  const button = (
    <button
      className={`card-tile${selected ? " selected" : ""}${disabled ? " disabled" : ""}`}
      style={{ background: COLOR_VAR[card.color] }}
      onClick={onSelect}
      disabled={disabled}
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
