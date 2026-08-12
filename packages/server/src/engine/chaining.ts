import type { Card, PlayerState } from "@sw/shared";

export function isFreeViaChain(card: Card, player: PlayerState): boolean {
  if (!card.chainFrom || card.chainFrom.length === 0) return false;
  return card.chainFrom.some((id) => player.builtCardIds.includes(id));
}
