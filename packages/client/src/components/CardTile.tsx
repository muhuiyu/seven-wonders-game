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
  // Unaffordable cards stay selectable (not "disabled") because discarding for 3 coins is
  // always a legal action regardless of build/wonder-stage cost — only an already-built card
  // has no legal action left.
  const disabled = view.alreadyBuilt;
  const unaffordable = !view.buildAffordable && !view.wonderStageAffordable;
  const hasChains = chainParents(card).length > 0 || chainChildren(card).length > 0;

  const button = (
    <button
      className={`card-tile${selected ? " selected" : ""}${disabled ? " disabled" : ""}${unaffordable ? " unaffordable" : ""}`}
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
