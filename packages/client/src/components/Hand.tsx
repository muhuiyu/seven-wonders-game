import { useState } from "react";
import type { GameStateView, RoundAction } from "@sw/shared";
import { CardTile } from "./CardTile";
import { CostView, PurchasesView } from "./CardEffects";
import { DiscardPilePicker } from "./DiscardPilePicker";
import { WonderStagePicker } from "./WonderStagePicker";
import { cardById, describeCard, wonderSideOf } from "../lib/format";

interface Props {
  you: GameStateView["you"];
  discardPile: string[];
  onSubmit: (action: RoundAction) => void;
  submitting: boolean;
}

export function Hand({ you, discardPile, onSubmit, submitting }: Props) {
  // The hand can contain two physical copies of the same card id (deck padding at higher
  // player counts), so selection is tracked by hand index, not card id.
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pickingForCardId, setPickingForCardId] = useState<string | null>(null);
  const [pickingStageForCardId, setPickingStageForCardId] = useState<string | null>(null);
  const [chosenStageIndex, setChosenStageIndex] = useState<number | null>(null);

  const selectedView = selectedIndex !== null ? you.handView[selectedIndex] : undefined;
  const card = selectedView ? cardById(selectedView.cardId) : null;

  const wonderSide = wonderSideOf(you.wonderId, you.wonderSide);
  const nextStage = wonderSide.anyOrder ? undefined : wonderSide.stages[you.wonderStagesBuilt];
  const stageBuildsFromDiscard = nextStage?.effects.some((e) => e.kind === "buildFromDiscardPile") ?? false;
  const eligibleDiscardIds = Array.from(new Set(discardPile.filter((id) => !you.builtCardIds.includes(id))));

  function submit(action: RoundAction) {
    setSelectedIndex(null);
    onSubmit(action);
  }

  function buildWonderStage(cardId: string) {
    if (wonderSide.anyOrder) {
      setPickingStageForCardId(cardId);
      return;
    }
    if (stageBuildsFromDiscard && eligibleDiscardIds.length > 0) {
      setPickingForCardId(cardId);
      return;
    }
    submit({ type: "buildWonderStage", cardId });
  }

  function onStageChosen(cardId: string, stageIndex: number) {
    setPickingStageForCardId(null);
    const stage = wonderSide.stages[stageIndex];
    const buildsFromDiscard = stage?.effects.some((e) => e.kind === "buildFromDiscardPile") ?? false;
    if (buildsFromDiscard && eligibleDiscardIds.length > 0) {
      setChosenStageIndex(stageIndex);
      setPickingForCardId(cardId);
      return;
    }
    submit({ type: "buildWonderStage", cardId, stageIndex });
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
          <div className="action-btn-group">
            <button
              className="action-btn primary"
              disabled={submitting || !selectedView.buildAffordable || selectedView.alreadyBuilt}
              onClick={() => submit({ type: "build", cardId: card.id })}
              title={describeCard(card)}
            >
              Build {selectedView.buildFree ? "(free)" : <>— <CostView cost={card.cost} /></>}
            </button>
            {selectedView.buildAffordable && <PurchasesView purchases={selectedView.buildPurchases} />}
          </div>
          {wonderSide.anyOrder
            ? (selectedView.wonderStageOptions?.length ?? 0) > 0 && (
                <div className="action-btn-group">
                  <button
                    className="action-btn"
                    disabled={submitting || !selectedView.wonderStageAffordable}
                    onClick={() => buildWonderStage(card.id)}
                  >
                    Build a wonder stage…
                  </button>
                </div>
              )
            : nextStage && (
                <div className="action-btn-group">
                  <button
                    className="action-btn"
                    disabled={submitting || !selectedView.wonderStageAffordable}
                    onClick={() => buildWonderStage(card.id)}
                    title={describeCard({ ...card, effects: nextStage.effects })}
                  >
                    Build wonder stage {you.wonderStagesBuilt + 1} — <CostView cost={nextStage.cost} />
                  </button>
                  {selectedView.wonderStageAffordable && <PurchasesView purchases={selectedView.wonderStagePurchases} />}
                </div>
              )}
          <button className="action-btn" disabled={submitting} onClick={() => submit({ type: "discard", cardId: card.id })}>
            Discard for 🪙3
          </button>
        </div>
      )}

      {pickingStageForCardId !== null && selectedView?.wonderStageOptions && (
        <WonderStagePicker
          title={`${wonderSide.wonderName} — choose which stage to build`}
          wonderSide={wonderSide}
          options={selectedView.wonderStageOptions}
          submitting={submitting}
          onCancel={() => setPickingStageForCardId(null)}
          onPick={(stageIndex) => onStageChosen(pickingStageForCardId, stageIndex)}
        />
      )}

      {pickingForCardId !== null && (
        <DiscardPilePicker
          title={`${wonderSide.wonderName} — build free from the discard pile`}
          cardIds={eligibleDiscardIds}
          submitting={submitting}
          onCancel={() => {
            setPickingForCardId(null);
            setChosenStageIndex(null);
          }}
          onPick={(discardPickId) => {
            const cardId = pickingForCardId;
            const stageIndex = chosenStageIndex ?? undefined;
            setPickingForCardId(null);
            setChosenStageIndex(null);
            submit({ type: "buildWonderStage", cardId, stageIndex, discardPickId });
          }}
        />
      )}
    </div>
  );
}
