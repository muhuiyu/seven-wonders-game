import type { ResourcePurchase, WonderSide } from "@sw/shared";
import { CardEffectsView, CostView, PurchasesView } from "./CardEffects";

interface Option {
  stageIndex: number;
  affordable: boolean;
  purchases?: ResourcePurchase[];
}

interface Props {
  title: string;
  wonderSide: WonderSide;
  options: Option[];
  onPick: (stageIndex: number) => void;
  onCancel: () => void;
  submitting: boolean;
}

export function WonderStagePicker({ title, wonderSide, options, onPick, onCancel, submitting }: Props) {
  return (
    <div className="discard-picker-overlay" onClick={onCancel}>
      <div className="discard-picker" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="discard-picker-hint">Choose which wonder stage to build — any order is allowed.</p>
        <div className="discard-picker-grid">
          {options.map((option) => {
            const stage = wonderSide.stages[option.stageIndex]!;
            return (
              <button
                key={option.stageIndex}
                className="discard-picker-card"
                disabled={submitting || !option.affordable}
                onClick={() => onPick(option.stageIndex)}
              >
                <div className="card-name">Stage {option.stageIndex + 1}</div>
                <div className="card-cost">
                  <CostView cost={stage.cost} />
                </div>
                <div className="card-effect">
                  <CardEffectsView card={{ effects: stage.effects }} />
                </div>
                {option.affordable && <PurchasesView purchases={option.purchases ?? []} />}
              </button>
            );
          })}
        </div>
        <button className="action-btn" disabled={submitting} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
