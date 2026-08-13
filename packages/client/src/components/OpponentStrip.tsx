import type { CardColor, GameStateView } from "@sw/shared";
import { COLOR_VAR } from "../lib/colors";
import { HoverTooltip } from "./HoverTooltip";
import { CardEffectsView, ResourceIcon } from "./CardEffects";
import { cardById, countByColor, estimateShields, leaderById, summarizeMilitaryTokens, wonderSideOf } from "../lib/format";

interface Props {
  state: GameStateView;
}

export function OpponentStrip({ state }: Props) {
  const n = state.seats.length;
  const idx = state.seats.indexOf("human");
  // Order left-to-right as seen across the table: left neighbor first, right neighbor last.
  const opponentIds = Array.from({ length: n - 1 }, (_, k) => state.seats[(idx - 1 - k + 2 * n) % n]!);

  return (
    <div className="opponent-strip">
      {opponentIds.map((id, i) => {
        const p = state.players[id]!;
        const wonderSide = wonderSideOf(p.wonderId, p.wonderSide);
        const colors = countByColor(p.builtCardIds);
        const shields = estimateShields(p.builtCardIds, p.wonderId, p.wonderSide, p.wonderStagesBuilt);
        const isLeftNeighbor = i === 0;
        const isRightNeighbor = i === opponentIds.length - 1;
        return (
          <div key={id} className="opponent-card">
            <div className="name">
              {isLeftNeighbor && <span className="neighbor-tag neighbor-tag-left">◀ Left</span>}
              {p.name}
              {isRightNeighbor && <span className="neighbor-tag neighbor-tag-right">Right ▶</span>}
            </div>
            <div className="wonder-name">
              <div>
                {wonderSide.wonderName} ({p.wonderSide})
              </div>
              <div>
                stage {p.wonderStagesBuilt}/{wonderSide.stages.length}
              </div>
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
                  {wonderSide.startingResource ? <ResourceIcon type={wonderSide.startingResource} /> : "🏛️ starting bonus"}
                </div>
              </HoverTooltip>
            )}
            <div className="row">
              <span>🪙 {p.coins}</span>
              <span>🛡️ {shields}</span>
              {p.recruitedLeaderIds.length > 0 ? (
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
              ) : (
                <span>👑 0</span>
              )}
            </div>
            {(p.militaryTokens.length > 0 || p.diplomacyTokens > 0 || p.debtVp < 0) && (
              <div className="row">
                {p.militaryTokens.length > 0 && (
                  <span className="badge badge-military">
                    ⚔️{" "}
                    {summarizeMilitaryTokens(p.militaryTokens)
                      .map((t) => `${t.value > 0 ? "+" : ""}${t.value}×${t.count}`)
                      .join(" ")}
                  </span>
                )}
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
