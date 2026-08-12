import type { CardColor, GameStateView } from "@sw/shared";
import { COLOR_VAR } from "../lib/colors";
import { HoverTooltip } from "./HoverTooltip";
import { cardById, countByColor, estimateShields, wonderSideOf } from "../lib/format";

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
            <div className="row">
              <span>🪙 {p.coins}</span>
              <span>🛡️ {shields}</span>
              <span>🂠 {p.handSize}</span>
              {p.recruitedLeaderIds.length > 0 && <span>👑 {p.recruitedLeaderIds.length}</span>}
            </div>
            {(p.diplomacyTokens > 0 || p.debtVp < 0) && (
              <div className="row">
                {p.diplomacyTokens > 0 && <span className="badge badge-diplomacy">🕊️ x{p.diplomacyTokens}</span>}
                {p.debtVp < 0 && <span className="badge badge-debt">Debt {p.debtVp}</span>}
              </div>
            )}
            <div className="colors">
              {Object.entries(colors).map(([color, count]) => {
                const cardNames = p.builtCardIds.filter((cardId) => cardById(cardId).color === (color as CardColor)).map((cardId) => cardById(cardId).name);
                return (
                  <HoverTooltip
                    key={color}
                    content={cardNames.map((name, i) => (
                      <span key={i} className="card-tooltip-effect">
                        {name}
                      </span>
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
