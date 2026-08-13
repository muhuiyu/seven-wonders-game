import { COLOR_VAR } from "../lib/colors";
import { cardById } from "../lib/format";
import { CardEffectsView, CostView } from "./CardEffects";

interface Props {
  title: string;
  cardIds: string[];
  onPick: (cardId: string) => void;
  onCancel: () => void;
  submitting: boolean;
}

export function DiscardPilePicker({ title, cardIds, onPick, onCancel, submitting }: Props) {
  return (
    <div className="discard-picker-overlay" onClick={onCancel}>
      <div className="discard-picker" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="discard-picker-hint">Choose a card from the discard pile to build for free.</p>
        {cardIds.length === 0 ? (
          <p className="discard-picker-hint">There's nothing in the discard pile you can build.</p>
        ) : (
          <div className="discard-picker-grid">
            {cardIds.map((id, i) => {
              const card = cardById(id);
              return (
                <button
                  key={id + i}
                  className="discard-picker-card"
                  style={{ background: COLOR_VAR[card.color] }}
                  disabled={submitting}
                  onClick={() => onPick(id)}
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
                </button>
              );
            })}
          </div>
        )}
        <button className="action-btn" disabled={submitting} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
