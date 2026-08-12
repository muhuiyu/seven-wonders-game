import type { Age, GameState } from "@sw/shared";
import { getShieldCount } from "./shields.js";
import { getActiveEffectSources } from "./effectSources.js";

const AGE_TOKEN_VALUE: Record<Age, number> = { 1: 1, 2: 3, 3: 5 };

/** Awards a win/lose token pair for one resolved pairing, applying Nero's coinsOnMilitaryWin and Tomyris's redirectDefeatToken. */
function awardMilitaryOutcome(state: GameState, winnerId: string, loserId: string, age: Age): void {
  const winner = state.players[winnerId]!;
  const loser = state.players[loserId]!;
  winner.militaryTokens.push({ age, result: "win" });

  if (getActiveEffectSources(loser).some((e) => e.kind === "redirectDefeatToken")) {
    winner.militaryTokens.push({ age, result: "lose" });
    state.log.push({ round: state.round, age, message: `${loser.name}'s Tomyris redirects their defeat token to ${winner.name}.` });
  } else {
    loser.militaryTokens.push({ age, result: "lose" });
  }

  const coinsOnWin = getActiveEffectSources(winner).reduce((sum, e) => (e.kind === "coinsOnMilitaryWin" ? sum + e.amount : sum), 0);
  if (coinsOnWin > 0) winner.coins += coinsOnWin;
}

function awardTie(state: GameState, aId: string, bId: string, age: Age): void {
  state.players[aId]!.militaryTokens.push({ age, result: "tie" });
  state.players[bId]!.militaryTokens.push({ age, result: "tie" });
}

/**
 * Resolves military conflict for every player, mutates state in place. Cities' Diplomacy
 * tokens remove a player from this Age's conflict entirely (they take no token at all)
 * and consume one token; their two neighbors become adjacent to each other for this
 * resolution, per the physical rule.
 */
export function resolveMilitary(state: GameState, age: Age): void {
  const activeRing = state.seats.filter((id) => {
    const player = state.players[id]!;
    if (player.diplomacyTokens > 0) {
      player.diplomacyTokens -= 1;
      state.log.push({ round: state.round, age, message: `${player.name} uses a Diplomacy token and sits out this Age's conflict.` });
      return false;
    }
    return true;
  });

  if (activeRing.length < 2) return; // 0 or 1 active participant: no conflicts this Age

  const shieldsByPlayer = new Map(activeRing.map((id) => [id, getShieldCount(state.players[id]!)]));
  // A ring of exactly 2 has only 1 edge, not 2 — avoid double-resolving the same pair via wraparound.
  const pairCount = activeRing.length === 2 ? 1 : activeRing.length;

  for (let i = 0; i < pairCount; i++) {
    const aId = activeRing[i]!;
    const bId = activeRing[(i + 1) % activeRing.length]!;
    const aShields = shieldsByPlayer.get(aId)!;
    const bShields = shieldsByPlayer.get(bId)!;
    const a = state.players[aId]!;
    const b = state.players[bId]!;

    if (aShields > bShields) {
      awardMilitaryOutcome(state, aId, bId, age);
      state.log.push({ round: state.round, age, message: `${a.name} defeats ${b.name} in military conflict (Age ${age}).` });
    } else if (bShields > aShields) {
      awardMilitaryOutcome(state, bId, aId, age);
      state.log.push({ round: state.round, age, message: `${b.name} defeats ${a.name} in military conflict (Age ${age}).` });
    } else {
      awardTie(state, aId, bId, age);
      state.log.push({ round: state.round, age, message: `${a.name} and ${b.name} tie in military conflict (Age ${age}).` });
    }
  }
}

export function militaryVp(player: { militaryTokens: { age: Age; result: "win" | "lose" | "tie" }[] }): number {
  let vp = 0;
  for (const t of player.militaryTokens) {
    if (t.result === "win") vp += AGE_TOKEN_VALUE[t.age];
    else if (t.result === "lose") vp -= 1;
  }
  return vp;
}
