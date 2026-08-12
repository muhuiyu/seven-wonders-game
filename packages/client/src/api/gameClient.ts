import type { CreateGameRequest, CreateGameResponse, GameStateView, RoundAction } from "@sw/shared";

async function handle<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json as T;
}

export const gameClient = {
  createGame(req: CreateGameRequest): Promise<CreateGameResponse> {
    return fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }).then((r) => handle<CreateGameResponse>(r));
  },

  getGame(gameId: string): Promise<GameStateView> {
    return fetch(`/api/games/${gameId}`).then((r) => handle<GameStateView>(r));
  },

  submitRound(gameId: string, action: RoundAction): Promise<GameStateView> {
    return fetch(`/api/games/${gameId}/round`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }).then((r) => handle<GameStateView>(r));
  },
};
