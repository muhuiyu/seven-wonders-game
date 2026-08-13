import { useState } from "react";
import type { GameStateView, RoundAction } from "@sw/shared";
import { CardEffectsView, CostView } from "./CardEffects";
import { DiscardPilePicker } from "./DiscardPilePicker";
import { leaderById, wonderSideOf } from "../lib/format";

interface Props {
  you: GameStateView["you"];
  discardPile: string[];
  onSubmit: (action: RoundAction) => void;
  submitting: boolean;
}

type PendingPick = { type: "recruitLeader" | "buildWonderStageFromLeader"; cardId: string; title: string };

export function LeaderRecruitPanel({ you, discardPile, onSubmit, submitting }: Props) {
  const [pending, setPending] = useState<PendingPick | null>(null);
  const wonderSide = wonderSideOf(you.wonderId, you.wonderSide);
  const nextStage = wonderSide.stages[you.wonderStagesBuilt];
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
    if (stageBuildsFromDiscard && eligibleDiscardIds.length > 0) {
      setPending({ type: "buildWonderStageFromLeader", cardId: leaderId, title: `${wonderSide.wonderName} — build free from the discard pile` });
      return;
    }
    onSubmit({ type: "buildWonderStageFromLeader", cardId: leaderId });
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
            {nextStage && (
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

      {pending && (
        <DiscardPilePicker
          title={pending.title}
          cardIds={eligibleDiscardIds}
          submitting={submitting}
          onCancel={() => setPending(null)}
          onPick={(discardPickId) => {
            const action: RoundAction = { type: pending.type, cardId: pending.cardId, discardPickId };
            setPending(null);
            onSubmit(action);
          }}
        />
      )}
    </div>
  );
}
