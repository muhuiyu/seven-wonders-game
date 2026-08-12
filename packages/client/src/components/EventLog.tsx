import type { GameEvent } from "@sw/shared";

interface Props {
  log: GameEvent[];
}

export function EventLog({ log }: Props) {
  const reversed = [...log].reverse();
  return (
    <div className="log-panel">
      <h3>Event log</h3>
      {reversed.map((entry, i) => (
        <div key={i} className="log-entry">
          <b>
            Age {entry.age} · R{entry.round}
          </b>{" "}
          — {entry.message}
        </div>
      ))}
    </div>
  );
}
