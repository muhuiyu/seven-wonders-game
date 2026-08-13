import type { GameStateView, RoundAction } from "@sw/shared";
import { CardEffectsView, CostView } from "./CardEffects";
import { leaderById, wonderSideOf } from "../lib/format";

interface Props {
  you: GameStateView["you"];
  onSubmit: (action: RoundAction) => void;
  submitting: boolean;
}

export function LeaderRecruitPanel({ you, onSubmit, submitting }: Props) {
  const wonderSide = wonderSideOf(you.wonderId, you.wonderSide);
  const nextStage = wonderSide.stages[you.wonderStagesBuilt];

  return (
    <div className="hand-section">
      <h3>Leader recruitment — recruit, fund a wonder stage, or discard</h3>
      {you.leaderHandView.map((view) => {
        const leader = leaderById(view.cardId);
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
              onClick={() => onSubmit({ type: "recruitLeader", cardId: view.cardId })}
            >
              Recruit {view.recruitFree ? "(free)" : `— 🪙${leader.coinCost}`}
            </button>
            {nextStage && (
              <button
                className="action-btn"
                disabled={submitting || !view.wonderStageAffordable}
                onClick={() => onSubmit({ type: "buildWonderStageFromLeader", cardId: view.cardId })}
              >
                Fund wonder stage {you.wonderStagesBuilt + 1} — <CostView cost={nextStage.cost} />
              </button>
            )}
            <button className="action-btn" disabled={submitting} onClick={() => onSubmit({ type: "discardLeaderForCoins", cardId: view.cardId })}>
              Discard for 🪙3
            </button>
          </div>
        );
      })}
    </div>
  );
}
