import { useState } from "react";
import type { GameStateView, RoundAction } from "@sw/shared";
import { CardEffectsView, CostView } from "./CardEffects";
import { DiscardPilePicker } from "./DiscardPilePicker";
import { WonderStagePicker } from "./WonderStagePicker";
import { leaderById, wonderSideOf } from "../lib/format";

interface Props {
  you: GameStateView["you"];
  discardPile: string[];
  onSubmit: (action: RoundAction) => void;
  submitting: boolean;
}

type PendingPick = { type: "recruitLeader" | "buildWonderStageFromLeader"; cardId: string; title: string; stageIndex?: number };

export function LeaderRecruitPanel({ you, discardPile, onSubmit, submitting }: Props) {
  const [pending, setPending] = useState<PendingPick | null>(null);
  const [pendingStageLeaderId, setPendingStageLeaderId] = useState<string | null>(null);
  const wonderSide = wonderSideOf(you.wonderId, you.wonderSide);
  const nextStage = wonderSide.anyOrder ? undefined : wonderSide.stages[you.wonderStagesBuilt];
  const stageBuildsFromDiscard = nextStage?.effects.some((e) => e.kind === "buildFromDiscardPile") ?? false;
  const eligibleDiscardIds = Array.from(new Set(discardPile.filter((id) => !you.builtCardIds.includes(id))));

  function recruit(leaderId: string, leaderName: string, buildsFromDiscard: boolean) {
    if (buildsFromDiscard && eligibleDiscardIds.length > 0) {
      setPending({ type: "recruitLeader", cardId: leaderId, title: `${leaderName} — build free from the discard pile` });
      return;
    }
    onSubmit({ type: "recruitLeader", cardId: leaderId });
  }

  function fundStage(leaderId: string) {
    if (wonderSide.anyOrder) {
      setPendingStageLeaderId(leaderId);
      return;
    }
    if (stageBuildsFromDiscard && eligibleDiscardIds.length > 0) {
      setPending({ type: "buildWonderStageFromLeader", cardId: leaderId, title: `${wonderSide.wonderName} — build free from the discard pile` });
      return;
    }
    onSubmit({ type: "buildWonderStageFromLeader", cardId: leaderId });
  }

  function onStageChosen(leaderId: string, stageIndex: number) {
    setPendingStageLeaderId(null);
    const stage = wonderSide.stages[stageIndex];
    const buildsFromDiscard = stage?.effects.some((e) => e.kind === "buildFromDiscardPile") ?? false;
    if (buildsFromDiscard && eligibleDiscardIds.length > 0) {
      setPending({ type: "buildWonderStageFromLeader", cardId: leaderId, title: `${wonderSide.wonderName} — build free from the discard pile`, stageIndex });
      return;
    }
    onSubmit({ type: "buildWonderStageFromLeader", cardId: leaderId, stageIndex });
  }

  return (
    <div className="hand-section">
      <h3>Leader recruitment — recruit, fund a wonder stage, or discard</h3>
      {you.leaderHandView.map((view) => {
        const leader = leaderById(view.cardId);
        const recruitBuildsFromDiscard = leader.effects.some((e) => e.kind === "recycleDiscardOnRecruit");
        return (
          <div key={view.cardId} className="leader-recruit-card">
            <div className="leader-recruit-info">
              <div className="leader-recruit-name">{leader.name}</div>
              <div className="leader-recruit-effect">
                <CardEffectsView card={leader} />
              </div>
            </div>
            <button
              className="action-btn primary"
              disabled={submitting || !view.recruitAffordable}
              onClick={() => recruit(view.cardId, leader.name, recruitBuildsFromDiscard)}
            >
              Recruit {view.recruitFree ? "(free)" : `— 🪙${leader.coinCost}`}
            </button>
            {wonderSide.anyOrder
              ? (view.wonderStageOptions?.length ?? 0) > 0 && (
                  <button className="action-btn" disabled={submitting || !view.wonderStageAffordable} onClick={() => fundStage(view.cardId)}>
                    Fund a wonder stage…
                  </button>
                )
              : nextStage && (
                  <button className="action-btn" disabled={submitting || !view.wonderStageAffordable} onClick={() => fundStage(view.cardId)}>
                    Fund wonder stage {you.wonderStagesBuilt + 1} — <CostView cost={nextStage.cost} />
                  </button>
                )}
            <button className="action-btn" disabled={submitting} onClick={() => onSubmit({ type: "discardLeaderForCoins", cardId: view.cardId })}>
              Discard for 🪙3
            </button>
          </div>
        );
      })}

      {pendingStageLeaderId !== null && you.leaderHandView[0]?.wonderStageOptions && (
        <WonderStagePicker
          title={`${wonderSide.wonderName} — choose which stage to fund`}
          wonderSide={wonderSide}
          options={you.leaderHandView[0].wonderStageOptions}
          submitting={submitting}
          onCancel={() => setPendingStageLeaderId(null)}
          onPick={(stageIndex) => onStageChosen(pendingStageLeaderId, stageIndex)}
        />
      )}

      {pending && (
        <DiscardPilePicker
          title={pending.title}
          cardIds={eligibleDiscardIds}
          submitting={submitting}
          onCancel={() => setPending(null)}
          onPick={(discardPickId) => {
            const action: RoundAction =
              pending.type === "buildWonderStageFromLeader"
                ? { type: "buildWonderStageFromLeader", cardId: pending.cardId, discardPickId, stageIndex: pending.stageIndex }
                : { type: "recruitLeader", cardId: pending.cardId, discardPickId };
            setPending(null);
            onSubmit(action);
          }}
        />
      )}
    </div>
  );
}
