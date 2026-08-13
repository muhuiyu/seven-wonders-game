import type { CardColor, GameStateView } from "@sw/shared";
import { COLOR_VAR } from "../lib/colors";
import { HoverTooltip } from "./HoverTooltip";
import { CardEffectsView } from "./CardEffects";
import { cardById, countByColor, estimateShields, leaderById, wonderSideOf, RESOURCE_ICON } from "../lib/format";

interface Props {
  state: GameStateView;
}

export function OpponentStrip({ state }: Props) {
  const opponentIds = state.seats.filter((id) => id !== "human");

  return (
    <div className="opponent-strip">
      {opponentIds.map((id) => {
        const p = state.players[id]!;
        const wonderSide = wonderSideOf(p.wonderId, p.wonderSide);
        const colors = countByColor(p.builtCardIds);
        const shields = estimateShields(p.builtCardIds, p.wonderId, p.wonderSide, p.wonderStagesBuilt);
        return (
          <div key={id} className="opponent-card">
            <div className="name">{p.name}</div>
            <div className="wonder-name">
              {wonderSide.wonderName} ({p.wonderSide}) · stage {p.wonderStagesBuilt}/{wonderSide.stages.length}
            </div>
            {(wonderSide.startingResource || (wonderSide.startingEffects && wonderSide.startingEffects.length > 0)) && (
              <HoverTooltip
                content={
                  wonderSide.startingEffects && wonderSide.startingEffects.length > 0 ? (
                    <CardEffectsView card={{ effects: wonderSide.startingEffects }} />
                  ) : (
                    "Starting resource"
                  )
                }
              >
                <div className="wonder-starting-bonus">
                  {wonderSide.startingResource ? RESOURCE_ICON[wonderSide.startingResource] : "🏛️ starting bonus"}
                </div>
              </HoverTooltip>
            )}
            <div className="row">
              <span>🪙 {p.coins}</span>
              <span>🛡️ {shields}</span>
              <span>🂠 {p.handSize}</span>
              {p.recruitedLeaderIds.length > 0 && (
                <HoverTooltip
                  content={p.recruitedLeaderIds.map((id, i) => {
                    const leader = leaderById(id);
                    return (
                      <div key={id + i} style={{ marginBottom: i < p.recruitedLeaderIds.length - 1 ? 6 : 0 }}>
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
                  <span>👑 {p.recruitedLeaderIds.length}</span>
                </HoverTooltip>
              )}
            </div>
            {(p.diplomacyTokens > 0 || p.debtVp < 0) && (
              <div className="row">
                {p.diplomacyTokens > 0 && <span className="badge badge-diplomacy">🕊️ x{p.diplomacyTokens}</span>}
                {p.debtVp < 0 && <span className="badge badge-debt">Debt {p.debtVp}</span>}
              </div>
            )}
            <div className="colors">
              {Object.entries(colors).map(([color, count]) => {
                const colorCards = p.builtCardIds.filter((cardId) => cardById(cardId).color === (color as CardColor)).map(cardById);
                return (
                  <HoverTooltip
                    key={color}
                    content={colorCards.map((card, i) => (
                      <div key={i} style={{ marginBottom: i < colorCards.length - 1 ? 6 : 0 }}>
                        <div className="card-tooltip-name">{card.name}</div>
                        {card.effects.length > 0 && (
                          <div className="card-tooltip-effect">
                            <CardEffectsView card={card} />
                          </div>
                        )}
                      </div>
                    ))}
                  >
                    <span className="color-pip" style={{ background: COLOR_VAR[color as keyof typeof COLOR_VAR] }}>
                      {count}
                    </span>
                  </HoverTooltip>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
