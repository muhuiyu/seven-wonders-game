import type { CardEffect, Cost, ResourcePurchase } from "@sw/shared";
import { CardEffectsView, CostView, PurchasesView } from "./CardEffects";

interface Option {
  stageIndex: number;
  cost: Cost;
  effects: CardEffect[];
  affordable: boolean;
  purchases?: ResourcePurchase[];
}

interface Props {
  title: string;
  hint: string;
  options: Option[];
  optionLabel?: (stageIndex: number) => string;
  onPick: (stageIndex: number) => void;
  onCancel: () => void;
  submitting: boolean;
}

export function WonderStagePicker({ title, hint, options, optionLabel, onPick, onCancel, submitting }: Props) {
  return (
    <div className="discard-picker-overlay" onClick={onCancel}>
      <div className="discard-picker" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="discard-picker-hint">{hint}</p>
        <div className="discard-picker-grid">
          {options.map((option) => (
            <button
              key={option.stageIndex}
              className="discard-picker-card"
              disabled={submitting || !option.affordable}
              onClick={() => onPick(option.stageIndex)}
            >
              <div className="card-name">{optionLabel ? optionLabel(option.stageIndex) : `Stage ${option.stageIndex + 1}`}</div>
              <div className="card-cost">
                <CostView cost={option.cost} />
              </div>
              <div className="card-effect">
                <CardEffectsView card={{ effects: option.effects }} />
              </div>
              {option.affordable && <PurchasesView purchases={option.purchases ?? []} />}
            </button>
          ))}
        </div>
        <button className="action-btn" disabled={submitting} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
