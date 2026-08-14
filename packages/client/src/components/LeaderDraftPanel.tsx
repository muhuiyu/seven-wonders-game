import type { GameStateView, RoundAction } from "@sw/shared";
import { CardEffectsView, CoinIcon } from "./CardEffects";
import { leaderById } from "../lib/format";

interface Props {
  you: GameStateView["you"];
  onSubmit: (action: RoundAction) => void;
  submitting: boolean;
}

export function LeaderDraftPanel({ you, onSubmit, submitting }: Props) {
  return (
    <div className="hand-section">
      <h3>Leader draft — pick one to keep</h3>
      <div className="hand-strip">
        {you.leaderDraftPool.map((cardId, i) => {
          const leader = leaderById(cardId);
          return (
            <button
              key={cardId + i}
              className="leader-tile"
              disabled={submitting}
              onClick={() => onSubmit({ type: "draftLeader", cardId })}
            >
              <div className="leader-name">{leader.name}</div>
              <div className="leader-cost">
                <CoinIcon amount={leader.coinCost} />
              </div>
              <div className="leader-effect">
                <CardEffectsView card={leader} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
