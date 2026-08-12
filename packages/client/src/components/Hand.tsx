import { useState } from "react";
import type { GameStateView, RoundAction } from "@sw/shared";
import { CardTile } from "./CardTile";
import { cardById, describeCard, describeCost, wonderSideOf } from "../lib/format";

interface Props {
  you: GameStateView["you"];
  onSubmit: (action: RoundAction) => void;
  submitting: boolean;
}

export function Hand({ you, onSubmit, submitting }: Props) {
  // The hand can contain two physical copies of the same card id (deck padding at higher
  // player counts), so selection is tracked by hand index, not card id.
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedView = selectedIndex !== null ? you.handView[selectedIndex] : undefined;
  const card = selectedView ? cardById(selectedView.cardId) : null;

  const wonderSide = wonderSideOf(you.wonderId, you.wonderSide);
  const nextStage = wonderSide.stages[you.wonderStagesBuilt];

  function submit(action: RoundAction) {
    setSelectedIndex(null);
    onSubmit(action);
  }

  return (
    <div className="hand-section">
      <h3>Your hand</h3>
      <div className="hand-strip">
        {you.handView.map((view, i) => (
          <CardTile
            key={i}
            view={view}
            selected={i === selectedIndex}
            onSelect={() => setSelectedIndex(i === selectedIndex ? null : i)}
          />
        ))}
      </div>

      {card && selectedView && (
        <div className="action-panel">
          <strong>{card.name}</strong>
          <button
            className="action-btn primary"
            disabled={submitting || !selectedView.buildAffordable || selectedView.alreadyBuilt}
            onClick={() => submit({ type: "build", cardId: card.id })}
            title={describeCard(card)}
          >
            Build {selectedView.buildFree ? "(free)" : `— ${describeCost(card.cost)}`}
          </button>
          {nextStage && (
            <button
              className="action-btn"
              disabled={submitting || !selectedView.wonderStageAffordable}
              onClick={() => submit({ type: "buildWonderStage", cardId: card.id })}
              title={describeCard({ ...card, effects: nextStage.effects })}
            >
              Build wonder stage {you.wonderStagesBuilt + 1} — {describeCost(nextStage.cost)}
            </button>
          )}
          <button className="action-btn" disabled={submitting} onClick={() => submit({ type: "discard", cardId: card.id })}>
            Discard for 🪙3
          </button>
        </div>
      )}
    </div>
  );
}
