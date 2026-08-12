import type { GameEvent, GameStateView, RoundAction } from "@sw/shared";
import { OpponentStrip } from "../components/OpponentStrip";
import { SelfPanel } from "../components/SelfPanel";
import { EventLog } from "../components/EventLog";
import { Hand } from "../components/Hand";
import { LeaderDraftPanel } from "../components/LeaderDraftPanel";
import { LeaderRecruitPanel } from "../components/LeaderRecruitPanel";

interface Props {
  state: GameStateView;
  onSubmit: (action: RoundAction) => void;
  submitting: boolean;
  error: string | null;
  banner: GameEvent[];
}

function phaseLabel(state: GameStateView): string {
  if (state.phase === "leaderDraft") return "Leader draft";
  if (state.phase === "leaderRecruit") return `Leader recruitment — before Age ${state.age}`;
  return `Age ${state.age} · Round ${state.round} / 6`;
}

export function GameScreen({ state, onSubmit, submitting, error, banner }: Props) {
  return (
    <div className="game-screen">
      <div className="top-bar">
        <div className="age-round">{phaseLabel(state)}</div>
        <div className="stats">
          <span>
            🪙 <b>{state.you.coins}</b>
          </span>
          <span>
            🏛️ Wonder stage <b>{state.you.wonderStagesBuilt}</b>
          </span>
          {state.you.diplomacyTokens > 0 && <span className="badge badge-diplomacy">🕊️ Diplomacy x{state.you.diplomacyTokens}</span>}
          {state.you.debtVp < 0 && <span className="badge badge-debt">Debt {state.you.debtVp} VP</span>}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {banner.length > 0 && (
        <div className="age-banner">
          {banner.map((e, i) => (
            <div key={i}>{e.message}</div>
          ))}
        </div>
      )}

      <OpponentStrip state={state} />

      <div className="main-grid">
        <SelfPanel you={state.you} />
        <EventLog log={state.log} />
      </div>

      {state.phase === "leaderDraft" && <LeaderDraftPanel you={state.you} onSubmit={onSubmit} submitting={submitting} />}
      {state.phase === "leaderRecruit" && <LeaderRecruitPanel you={state.you} onSubmit={onSubmit} submitting={submitting} />}
      {state.phase === "drafting" && <Hand you={state.you} onSubmit={onSubmit} submitting={submitting} />}
    </div>
  );
}
