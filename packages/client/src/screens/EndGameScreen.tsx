import type { GameStateView } from "@sw/shared";
import { wonderSideOf } from "../lib/format";

interface Props {
  state: GameStateView;
  onPlayAgain: () => void;
}

type CategoryKey = "military" | "treasury" | "wonder" | "civil" | "science" | "guild" | "commerce" | "cities" | "leaders" | "debt";

const BASE_CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "military", label: "Military" },
  { key: "treasury", label: "Treasury" },
  { key: "wonder", label: "Wonder" },
  { key: "civil", label: "Civil" },
  { key: "science", label: "Science" },
  { key: "guild", label: "Guild" },
  { key: "commerce", label: "Commerce" },
];

export function EndGameScreen({ state, onPlayAgain }: Props) {
  const scores = [...(state.finalScores ?? [])].sort((a, b) => b.total - a.total);
  const winnerId = scores[0]?.playerId;
  const CATEGORIES: { key: CategoryKey; label: string }[] = [
    ...BASE_CATEGORIES,
    ...(state.expansions.cities ? [{ key: "cities" as const, label: "Cities" }] : []),
    ...(state.expansions.leaders ? [{ key: "leaders" as const, label: "Leaders" }] : []),
    ...(state.expansions.cities ? [{ key: "debt" as const, label: "Debt" }] : []),
  ];

  return (
    <div className="endgame-screen">
      <div className="endgame-card">
        <h1>Game complete</h1>
        {winnerId && (
          <div className="winner">
            🏆 {state.players[winnerId]!.name} wins with {scores[0]!.total} points!
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table className="score-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Wonder</th>
                {CATEGORIES.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => {
                const p = state.players[s.playerId]!;
                const wonder = wonderSideOf(p.wonderId, p.wonderSide);
                return (
                  <tr key={s.playerId} className={s.playerId === winnerId ? "winner-row" : ""}>
                    <td>{p.name}</td>
                    <td>
                      {wonder.wonderName} ({p.wonderSide})
                    </td>
                    {CATEGORIES.map((c) => (
                      <td key={c.key}>{s[c.key]}</td>
                    ))}
                    <td>
                      <b>{s.total}</b>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button className="start-button" style={{ marginTop: 24 }} onClick={onPlayAgain}>
          Play again
        </button>
      </div>
    </div>
  );
}
