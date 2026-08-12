import { useRef, useState } from "react";
import type { GameEvent, GameStateView, RoundAction } from "@sw/shared";
import { gameClient } from "./api/gameClient";
import { SetupScreen } from "./screens/SetupScreen";
import { GameScreen } from "./screens/GameScreen";
import { EndGameScreen } from "./screens/EndGameScreen";

export default function App() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [state, setState] = useState<GameStateView | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<GameEvent[]>([]);
  const prevLogLength = useRef(0);

  async function handleStart(opts: {
    playerCount: number;
    humanName: string;
    wonderId?: string;
    wonderSide?: "A" | "B";
    expansions: { leaders: boolean; cities: boolean };
  }) {
    setSubmitting(true);
    setError(null);
    try {
      const { gameId } = await gameClient.createGame({
        playerCount: opts.playerCount,
        humanName: opts.humanName,
        humanWonderId: opts.wonderId,
        humanWonderSide: opts.wonderSide,
        expansions: opts.expansions,
      });
      const s = await gameClient.getGame(gameId);
      prevLogLength.current = s.log.length;
      setGameId(gameId);
      setState(s);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(action: RoundAction) {
    if (!gameId) return;
    setSubmitting(true);
    setError(null);
    try {
      const s = await gameClient.submitRound(gameId, action);
      const newEvents = s.log.slice(prevLogLength.current);
      prevLogLength.current = s.log.length;
      setState(s);
      const notable = newEvents.filter((e) => /conflict|begins|complete/i.test(e.message));
      setBanner(notable);
      if (notable.length > 0) setTimeout(() => setBanner([]), 6000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function handlePlayAgain() {
    setGameId(null);
    setState(null);
    setBanner([]);
    setError(null);
  }

  if (!state) {
    return (
      <div className="app">
        <SetupScreen onStart={handleStart} submitting={submitting} error={error} />
      </div>
    );
  }

  if (state.phase === "complete") {
    return (
      <div className="app">
        <EndGameScreen state={state} onPlayAgain={handlePlayAgain} />
      </div>
    );
  }

  return (
    <div className="app">
      <GameScreen state={state} onSubmit={handleSubmit} submitting={submitting} error={error} banner={banner} />
    </div>
  );
}
