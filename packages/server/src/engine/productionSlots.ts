import { ALL_RESOURCES, getCard, getLeaderCard, getWonderSide, type PlayerState, type ResourceType } from "@sw/shared";

export interface ProductionSlot {
  id: string;
  domain: ResourceType[];
  qty: number;
}

/** All resource-producing slots (built cards + completed wonder stages + recruited Leaders + Cities' dynamic-resource cards) for a player. */
export function getProductionSlots(player: PlayerState): ProductionSlot[] {
  const slots: ProductionSlot[] = [];

  for (const cardId of player.builtCardIds) {
    const card = getCard(cardId);
    for (const effect of card.effects) {
      if (effect.kind === "resource") {
        slots.push({ id: `card:${cardId}`, domain: effect.production.options, qty: effect.production.qty });
      }
    }
  }

  const wonderSide = getWonderSide(player.wonderId, player.wonderSide);
  if (wonderSide.startingResource) {
    slots.push({ id: "wonder:starting", domain: [wonderSide.startingResource], qty: 1 });
  }
  for (let i = 0; i < player.wonderStagesBuilt; i++) {
    const stage = wonderSide.stages[i];
    if (!stage) continue;
    for (const effect of stage.effects) {
      if (effect.kind === "resource") {
        slots.push({ id: `wonder:${i}`, domain: effect.production.options, qty: effect.production.qty });
      }
    }
  }

  for (const leaderId of player.recruitedLeaderIds) {
    for (const effect of getLeaderCard(leaderId).effects) {
      if (effect.kind === "resource") {
        slots.push({ id: `leader:${leaderId}`, domain: effect.production.options, qty: effect.production.qty });
      }
    }
  }

  // Second pass: Cities' "dynamic resource" cards (Secret Warehouse/Black Market) derive
  // their domain from every OTHER slot collected above, so they must run after the loops.
  const ownProduced = new Set<ResourceType>();
  for (const s of slots) for (const r of s.domain) ownProduced.add(r);

  for (const cardId of player.builtCardIds) {
    const card = getCard(cardId);
    for (const effect of card.effects) {
      if (effect.kind !== "dynamicResource") continue;
      const domain = effect.mode === "matchOwn" ? [...ownProduced] : ALL_RESOURCES.filter((r) => !ownProduced.has(r));
      if (domain.length > 0) slots.push({ id: `card:${cardId}:dynamic`, domain, qty: 1 });
    }
  }

  return slots;
}
