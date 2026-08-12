import { useMemo, useState } from "react";
import { getAvailableWonderIds } from "@sw/shared";
import { wonderSideOf } from "../lib/format";

interface Props {
  onStart: (opts: {
    playerCount: number;
    humanName: string;
    wonderId?: string;
    wonderSide?: "A" | "B";
    expansions: { leaders: boolean; cities: boolean };
  }) => void;
  submitting: boolean;
  error: string | null;
}

export function SetupScreen({ onStart, submitting, error }: Props) {
  const [playerCount, setPlayerCount] = useState(4);
  const [humanName, setHumanName] = useState("You");
  const [wonderId, setWonderId] = useState<string | undefined>(undefined);
  const [wonderSide, setWonderSide] = useState<"A" | "B">("A");
  const [leadersEnabled, setLeadersEnabled] = useState(false);
  const [citiesEnabled, setCitiesEnabled] = useState(false);

  const expansions = { leaders: leadersEnabled, cities: citiesEnabled };
  const wonderIds = useMemo(() => getAvailableWonderIds(expansions), [leadersEnabled, citiesEnabled]);

  function toggleWonderId(id: string, selected: boolean) {
    if (selected) {
      setWonderId(undefined);
    } else {
      setWonderId(id);
    }
  }

  function setExpansion(kind: "leaders" | "cities", enabled: boolean) {
    if (kind === "leaders") setLeadersEnabled(enabled);
    else setCitiesEnabled(enabled);
    // A wonder that only exists under a toggled-off expansion is no longer selectable.
    if (wonderId && !getAvailableWonderIds({ ...expansions, [kind]: enabled }).includes(wonderId)) {
      setWonderId(undefined);
    }
  }

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <h1>Seven Wonders</h1>
        <p className="sub">Play the base game — plus the Leaders and Cities expansions — against AI opponents.</p>

        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label>Your name</label>
          <input type="text" value={humanName} onChange={(e) => setHumanName(e.target.value)} maxLength={24} />
        </div>

        <div className="field">
          <label>Number of players (you + AI opponents)</label>
          <div className="player-count-row">
            {[3, 4, 5, 6, 7].map((n) => (
              <button key={n} className={n === playerCount ? "selected" : ""} onClick={() => setPlayerCount(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Expansions</label>
          <div className="expansion-toggle-row">
            <label className={`expansion-toggle${leadersEnabled ? " checked" : ""}`}>
              <input type="checkbox" checked={leadersEnabled} onChange={(e) => setExpansion("leaders", e.target.checked)} />
              <span>
                <span className="label">Leaders</span>
                <div className="hint">Draft and recruit Leader cards for powerful ongoing effects.</div>
              </span>
            </label>
            <label className={`expansion-toggle${citiesEnabled ? " checked" : ""}`}>
              <input type="checkbox" checked={citiesEnabled} onChange={(e) => setExpansion("cities", e.target.checked)} />
              <span>
                <span className="label">Cities</span>
                <div className="hint">Adds black City cards: debt, diplomacy, and more.</div>
              </span>
            </label>
          </div>
        </div>

        <div className="field">
          <label>Your wonder (leave unselected for random)</label>
          <div className="wonder-grid">
            {wonderIds.map((id) => {
              const side = wonderSideOf(id, id === wonderId ? wonderSide : "A");
              const selected = id === wonderId;
              return (
                <div key={id} className={`wonder-option${selected ? " selected" : ""}`}>
                  <button
                    style={{ all: "unset", cursor: "pointer", width: "100%" }}
                    onClick={() => toggleWonderId(id, selected)}
                  >
                    <div className="name">{side.wonderName}</div>
                  </button>
                  {selected && (
                    <div className="side-toggle">
                      {(["A", "B"] as const).map((s) => (
                        <button key={s} className={wonderSide === s ? "selected" : ""} onClick={() => setWonderSide(s)}>
                          Side {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          className="start-button"
          disabled={submitting || humanName.trim().length === 0}
          onClick={() =>
            onStart({ playerCount, humanName: humanName.trim(), wonderId, wonderSide: wonderId ? wonderSide : undefined, expansions })
          }
        >
          {submitting ? "Starting…" : "Start Game"}
        </button>
      </div>
    </div>
  );
}
