import { BOT_STRATEGIES, type BotStrategyId } from "@sw/shared";

/** Thematic/mechanical fit between each wonder and one of the 5 archetypes (see heuristics.ts). */
const WONDER_STRATEGY_AFFINITY: Record<string, BotStrategyId> = {
  gizah: "civilian", // pure-VP stages
  rhodos: "military", // only wonder with a reliable shields stage
  ephesos: "commerce", // coin-heavy stages, no shields
  babylon: "science", // scienceChoice on every stage
  olympia: "balanced", // trade discount + free build + guild-copy fuels any strategy equally well
  halikarnassos: "commerce", // free-build-from-discard engine
  alexandria: "commerce", // resource self-sufficiency
  roma: "civilian",
  petra: "civilian",
  byzantium: "civilian",
};

// Even a wonder with a strong affinity sometimes produces a bot that ignores it — keeps games unpredictable.
const RANDOM_STRATEGY_CHANCE = 0.15;

export function assignBotStrategy(wonderId: string, rng: () => number): BotStrategyId {
  if (rng() < RANDOM_STRATEGY_CHANCE) {
    return BOT_STRATEGIES[Math.floor(rng() * BOT_STRATEGIES.length)]!;
  }
  return WONDER_STRATEGY_AFFINITY[wonderId] ?? "balanced";
}
