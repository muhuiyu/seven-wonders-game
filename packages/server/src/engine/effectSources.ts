import { getCard, getLeaderCard, getWonderSide, type CardEffect, type PlayerState } from "@sw/shared";

/** Effects from this player's recruited Leaders (plus a Courtesan's-Guild-copied leader, if any). */
export function getLeaderEffectSources(player: PlayerState): CardEffect[] {
  const effects: CardEffect[] = [];
  for (const leaderId of player.recruitedLeaderIds) effects.push(...getLeaderCard(leaderId).effects);
  if (player.copiedLeaderId) effects.push(...getLeaderCard(player.copiedLeaderId).effects);
  return effects;
}

/**
 * All effect sources currently active for a player: built cards + completed wonder
 * stages + recruited Leaders (+ a copied Leader). This is the single place that
 * base-game and Leaders-expansion effects merge, so shields/science/production/trade
 * (and, via vpFromEffect, scoring) automatically account for Leader cards without each
 * needing bespoke plumbing.
 */
export function getActiveEffectSources(player: PlayerState): CardEffect[] {
  const effects: CardEffect[] = [];

  for (const cardId of player.builtCardIds) effects.push(...getCard(cardId).effects);

  const wonderSide = getWonderSide(player.wonderId, player.wonderSide);
  if (wonderSide.startingEffects) effects.push(...wonderSide.startingEffects);
  for (let i = 0; i < player.wonderStagesBuilt; i++) {
    const stage = wonderSide.stages[i];
    if (stage) effects.push(...stage.effects);
  }

  effects.push(...getLeaderEffectSources(player));

  return effects;
}
