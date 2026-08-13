import type { GameEvent, GameStateView, RoundAction } from "@sw/shared";
import { OpponentStrip } from "../components/OpponentStrip";
import { SelfPanel } from "../components/SelfPanel";
import { EventLog } from "../components/EventLog";
import { Hand } from "../components/Hand";
import { LeaderDraftPanel } from "../components/LeaderDraftPanel";
import { LeaderRecruitPanel } from "../components/LeaderRecruitPanel";
import { HoverTooltip } from "../components/HoverTooltip";
import { CardEffectsView } from "../components/CardEffects";
import { leaderById, summarizeMilitaryTokens } from "../lib/format";

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
          {state.you.militaryTokens.length > 0 && (
            <span className="badge badge-military">
              ⚔️{" "}
              {summarizeMilitaryTokens(state.you.militaryTokens)
                .map((t) => `${t.value > 0 ? "+" : ""}${t.value}×${t.count}`)
                .join(" ")}
            </span>
          )}
          {state.you.diplomacyTokens > 0 && <span className="badge badge-diplomacy">🕊️ Diplomacy x{state.you.diplomacyTokens}</span>}
          {state.you.debtVp < 0 && <span className="badge badge-debt">Debt {state.you.debtVp} VP</span>}
          {state.expansions.leaders && state.you.leaderHandView.length > 0 && (
            <HoverTooltip
              content={state.you.leaderHandView.map((view, i) => {
                const leader = leaderById(view.cardId);
                return (
                  <div key={view.cardId + i} style={{ marginBottom: i < state.you.leaderHandView.length - 1 ? 6 : 0 }}>
                    <div className="card-tooltip-name">{leader.name}</div>
                    {leader.effects.length > 0 && (
                      <div className="card-tooltip-effect">
                        <CardEffectsView card={leader} />
                      </div>
                    )}
                  </div>
                );
              })}
            >
              <span className="badge badge-leaders-unplayed">🎭 Leaders not played x{state.you.leaderHandView.length}</span>
            </HoverTooltip>
          )}
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
