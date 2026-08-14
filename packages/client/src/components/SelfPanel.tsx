import { CARD_COLORS, getBuiltStageIndices, type GameStateView } from "@sw/shared";
import { COLOR_VAR } from "../lib/colors";
import { CardEffectsView, CostView, ResourceIcon } from "./CardEffects";
import { CardTooltip } from "./CardTooltip";
import { HoverTooltip } from "./HoverTooltip";
import { cardById, leaderById, wonderSideOf } from "../lib/format";

interface Props {
  you: GameStateView["you"];
}

export function SelfPanel({ you }: Props) {
  const wonderSide = wonderSideOf(you.wonderId, you.wonderSide);

  return (
    <div className="self-panel">
      <div className="wonder-panel">
        <div className="title">
          {wonderSide.wonderName} ({you.wonderSide})
        </div>
        {wonderSide.startingResource && (
          <div className="wonder-starting-bonus">
            Starting resource: <ResourceIcon type={wonderSide.startingResource} />
          </div>
        )}
        {wonderSide.startingEffects && wonderSide.startingEffects.length > 0 && (
          <div className="wonder-starting-bonus">
            Starting bonus: <CardEffectsView card={{ effects: wonderSide.startingEffects }} />
          </div>
        )}
        <div className="wonder-stages">
          {(() => {
            const builtStages = new Set(getBuiltStageIndices(you, wonderSide));
            return wonderSide.stages.map((stage, i) => (
              <div key={i} className={`wonder-stage-chip${builtStages.has(i) ? " built" : ""}`}>
                <span className="wonder-stage-cost">
                  {builtStages.has(i) ? "✓ " : ""}
                  <CostView cost={stage.cost} />
                </span>
                <div className="wonder-stage-effect">
                  <CardEffectsView card={{ effects: stage.effects }} />
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      <div>
        <div className="title" style={{ fontWeight: 700, marginBottom: 8 }}>
          Built cards ({you.builtCardIds.length})
        </div>
        <div className="built-cards-columns">
          {you.builtCardIds.length === 0 && <span style={{ color: "var(--text-dim)", fontSize: 13 }}>Nothing built yet.</span>}
          {CARD_COLORS.map((color) => {
            const ids = you.builtCardIds.filter((id) => cardById(id).color === color);
            if (ids.length === 0) return null;
            return (
              <div key={color} className="built-cards-column">
                {ids.map((id, i) => {
                  const card = cardById(id);
                  return (
                    <CardTooltip key={id + i} card={card}>
                      <div className="built-card" style={{ background: COLOR_VAR[card.color] }}>
                        {card.effects.length > 0 && (
                          <div className="card-effect">
                            <CardEffectsView card={card} compact />
                          </div>
                        )}
                      </div>
                    </CardTooltip>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {you.recruitedLeaderIds.length > 0 && (
        <div>
          <div className="title" style={{ fontWeight: 700, marginBottom: 8 }}>
            Recruited Leaders ({you.recruitedLeaderIds.length})
          </div>
          <div className="recruited-leaders">
            {you.recruitedLeaderIds.map((id, i) => {
              const leader = leaderById(id);
              return (
                <HoverTooltip
                  key={id + i}
                  content={
                    <>
                      <span className="card-tooltip-name">{leader.name}</span>
                      <span className="card-tooltip-cost">🪙{leader.coinCost}</span>
                      {leader.effects.length > 0 && (
                        <span className="card-tooltip-effect">
                          <CardEffectsView card={leader} />
                        </span>
                      )}
                    </>
                  }
                >
                  <div className="leader-card">
                    {leader.effects.length > 0 && (
                      <div className="card-effect">
                        <CardEffectsView card={leader} compact />
                      </div>
                    )}
                  </div>
                </HoverTooltip>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
