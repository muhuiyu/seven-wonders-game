import type { ReactNode } from "react"
import type {
  Card,
  CardColor,
  CardEffect,
  Cost,
  PlayerScope,
  ResourcePurchase,
  ResourceType,
  ScienceSymbol,
} from "@sw/shared"
import { COLOR_LABEL } from "../lib/format"
import { DIPLOMACY_TOKEN_IMG, RESOURCE_IMG, SCIENCE_IMG, SHIELD_IMG, victoryPointIcon } from "../lib/icons"

export function ResourceIcon({ type }: { type: ResourceType }) {
  return <img className="icon-symbol" src={RESOURCE_IMG[type]} alt={type} title={type} />
}

function ScienceIcon({ symbol }: { symbol: ScienceSymbol }) {
  return <img className="icon-symbol" src={SCIENCE_IMG[symbol]} alt={symbol} title={symbol} />
}

function ShieldIcon() {
  return <img className="icon-symbol" src={SHIELD_IMG} alt="military shield" title="military shield" />
}

function DiplomacyTokenIcon() {
  return <img className="icon-symbol" src={DIPLOMACY_TOKEN_IMG} alt="diplomacy token" title="diplomacy token" />
}

function VictoryPointIcon({ points }: { points: number }) {
  return (
    <img
      className="icon-symbol"
      src={victoryPointIcon(points)}
      alt={`${points} victory points`}
      title={`${points} victory points`}
    />
  )
}

/** A card-color category name (e.g. "Science Buildings", "Guilds"), highlighted in that
 *  color wherever it's mentioned in an effect description. */
export function ColorTag({ color }: { color: CardColor }) {
  return <span className={`color-tag color-tag--${color}`}>{COLOR_LABEL[color]}</span>
}

const SCOPE_LABEL: Record<PlayerScope, string> = {
  self: "your city",
  leftNeighbor: "your left neighbor's city",
  rightNeighbor: "your right neighbor's city",
  bothNeighbors: "each neighboring city",
}

function joinSlash(nodes: ReactNode[]): ReactNode {
  return nodes.map((node, i) => (
    <span key={i}>
      {i > 0 && "/"}
      {node}
    </span>
  ))
}

export function CostView({ cost }: { cost: Cost }) {
  const options = cost.map((option, i) => {
    const bits: ReactNode[] = []
    if (option.coins) bits.push(<span key="coins">🪙{option.coins}</span>)
    if (option.resources) {
      for (const [res, qty] of Object.entries(option.resources)) {
        bits.push(
          <span key={res} className="cost-bit">
            <ResourceIcon type={res as ResourceType} />
            {qty && qty > 1 ? qty : ""}
          </span>,
        )
      }
    }
    return (
      <span key={i} className="cost-option">
        {bits.length === 0 ? "Free" : bits}
      </span>
    )
  })
  return <>{options.reduce<ReactNode[]>((acc, el, i) => (i === 0 ? [el] : [...acc, " or ", el]), [])}</>
}

const PURCHASE_SIDE_LABEL: Record<ResourcePurchase["from"], string> = {
  left: "left neighbor",
  right: "right neighbor",
  bank: "the bank",
}

/** Coins owed to each neighbor (or the bank) to cover resources this player can't produce themselves. Renders nothing when every resource is self-sufficient. */
export function PurchasesView({ purchases }: { purchases: ResourcePurchase[] }) {
  if (purchases.length === 0) return null
  const bySide = new Map<ResourcePurchase["from"], number>()
  for (const p of purchases) bySide.set(p.from, (bySide.get(p.from) ?? 0) + p.unitCost)
  return (
    <div className="purchase-note">
      Pay{" "}
      {[...bySide.entries()].map(([side, coins], i) => (
        <span key={side}>
          {i > 0 && ", "}
          🪙{coins} to {PURCHASE_SIDE_LABEL[side]}
        </span>
      ))}
    </div>
  )
}

export function EffectView({ effect, compact }: { effect: CardEffect; compact?: boolean }) {
  switch (effect.kind) {
    case "resource":
      return (
        <>
          {compact ? "" : "Produce "}
          {effect.production.qty > 1 ? `${effect.production.qty}x ` : ""}
          {joinSlash(effect.production.options.map((r) => <ResourceIcon key={r} type={r} />))}
        </>
      )
    case "shields":
      return (
        <>
          +{effect.count} <ShieldIcon />
        </>
      )
    case "science":
      return (
        <>
          +1 <ScienceIcon symbol={effect.symbol} />
        </>
      )
    case "scienceChoice":
      return (
        <>
          <ScienceIcon symbol={"compass"} /> {" / "}
          <ScienceIcon symbol={"tablet"} /> {" / "}
          <ScienceIcon symbol={"cog"} />
        </>
      )
    case "coins":
      return <>+{effect.amount} 🪙</>
    case "vp":
      return <VictoryPointIcon points={effect.amount} />
    case "vpPerCard":
      return (
        <>
          <VictoryPointIcon points={effect.perCard} /> per <ColorTag color={effect.color} /> card in{" "}
          {SCOPE_LABEL[effect.scope]}
        </>
      )
    case "coinsPerCard":
      return (
        <>
          +{effect.perCard} 🪙 per <ColorTag color={effect.color} /> card in {SCOPE_LABEL[effect.scope]}
        </>
      )
    case "vpAndCoinsPerCard":
      return (
        <>
          +{effect.coinsPer} 🪙 now, <VictoryPointIcon points={effect.vpPer} /> per <ColorTag color={effect.color} />{" "}
          card in {SCOPE_LABEL[effect.scope]}
        </>
      )
    case "vpPerWonderStage":
      return (
        <>
          <VictoryPointIcon points={effect.perStage} /> per Wonder stage built in {SCOPE_LABEL[effect.scope]}
        </>
      )
    case "vpPerDefeatToken":
      return (
        <>
          <VictoryPointIcon points={effect.perToken} /> per defeat token in {SCOPE_LABEL[effect.scope]}
        </>
      )
    case "vpPerColorSet":
      return (
        <>
          <VictoryPointIcon points={effect.perCard} /> per{" "}
          {joinSlash(effect.colors.map((c) => <ColorTag key={c} color={c} />))} card in your city
        </>
      )
    case "tradeDiscount":
      return (
        <>
          Trade{" "}
          {effect.resources.map((r) => (
            <ResourceIcon key={r} type={r} />
          ))}{" "}
          from {effect.sides.join("/")} neighbor for {effect.unitCost} 🪙
        </>
      )
    case "copyGuild":
      return (
        <>
          Copy a neighboring <ColorTag color="purple" /> card
        </>
      )
    case "freeBuildFirstOfEachColor":
      return <>Build the first card of each color in your city for free</>
    case "freeBuildFirstCardOfAge":
      return <>The first card you build each Age is free</>
    case "freeBuildLastCardOfAge":
      return <>The last card you build each Age is free</>
    case "playSeventhCard":
      return <>Play your last Age card as a bonus turn instead of discarding it</>
    case "extraTurn":
      return <>Take another turn immediately</>
    case "buildFromDiscardPile":
      return <>Build a free card of your choice from the discard pile</>
    case "diplomacyToken":
      return <DiplomacyTokenIcon />
    case "opponentsPayOrDebt":
      return <>Every other player pays {effect.amount} 🪙 or takes Debt</>
    case "opponentsPayPerOwnMetric":
      return (
        <>
          Every other player pays {effect.perUnit} 🪙 per{" "}
          {effect.metric === "wonderStagesBuilt" ? "Wonder stage" : "military victory"} they have
        </>
      )
    case "bankGrantSelfAndNeighbors":
      return (
        <>
          +{effect.self} 🪙 for you, +{effect.neighbors} 🪙 for each neighbor
        </>
      )
    case "tradeRebate":
      return (
        <>
          Refund {effect.amount} 🪙 the first time you buy from your {effect.side} neighbor this turn
        </>
      )
    case "dynamicResource":
      return (
        <>
          {effect.mode === "matchOwn"
            ? "Produce 1 extra unit of a resource you already produce"
            : "Produce 1 unit of a resource you don't already produce"}
        </>
      )
    case "copyNeighborScienceSymbol":
      return <>Copy 1 science symbol from a neighboring Science card</>
    case "vpPerMilitaryToken":
      return (
        <>
          <VictoryPointIcon points={effect.perToken} /> per military {effect.result} token in{" "}
          {SCOPE_LABEL[effect.scope]}
        </>
      )
    case "coinsPerMilitaryToken":
      return (
        <>
          +{effect.amount} 🪙 per military {effect.result} token
        </>
      )
    case "buildDiscount":
      return (
        <>
          Build {effect.appliesTo === "wonderStage" ? "Wonder stages" : <ColorTag color={effect.appliesTo} />} for{" "}
          {effect.units} fewer resource{effect.units > 1 ? "s" : ""}
        </>
      )
    case "freeWonderStageResourceCost":
      return <>Build Wonder stages ignoring their resource cost</>
    case "bankPurchase":
      return <>Once per turn, buy 1 resource from the bank for {effect.unitCost} 🪙</>
    case "neighborPurchaseRebate":
      return <>Refund {effect.amount} 🪙 per neighbor you trade with this turn</>
    case "vpPerColorSetBonus":
      return (
        <>
          <VictoryPointIcon points={effect.perSet} /> per complete set of{" "}
          {joinSlash(effect.colors.map((c) => <ColorTag key={c} color={c} />))} in your city
        </>
      )
    case "freeLeaderRecruitment":
      return <>Future Leader recruitment costs 0 🪙</>
    case "leaderRecruitmentDiscount":
      return (
        <>
          Leader recruitment costs {effect.self} 🪙 less (neighbors: {effect.neighbors} 🪙 less)
        </>
      )
    case "coinsOnMilitaryWin":
      return <>+{effect.amount} 🪙 whenever you win a military conflict</>
    case "freeBuildForColor":
      return (
        <>
          Build <ColorTag color={effect.color} /> ignoring their resource cost
        </>
      )
    case "recycleDiscardOnRecruit":
      return <>Build a free card of your choice from the discard pile</>
    case "redirectDefeatToken":
      return <>Your defeat tokens are instead given to your victorious neighbor</>
    case "coinsOnChainBuild":
      return <>+{effect.amount} 🪙 whenever you build for free via chaining</>
    case "coinsOnColorBuild":
      return (
        <>
          +{effect.amount} 🪙 whenever you build a <ColorTag color={effect.color} /> card
        </>
      )
    case "vpPerCoinsHeld":
      return (
        <>
          <VictoryPointIcon points={1} /> per {effect.coinsPerVp} 🪙 held at game end
        </>
      )
    case "vpPerRecruitedLeader":
      return (
        <>
          <VictoryPointIcon points={effect.perLeader} /> per recruited Leader in {SCOPE_LABEL[effect.scope]}
        </>
      )
    case "vpPerScienceSet":
      return (
        <>
          <VictoryPointIcon points={effect.perSet} /> per complete science symbol set
        </>
      )
    case "copyNeighborLeader":
      return <>Gain the effects of one recruited Leader in a neighboring city</>
    default:
      return null
  }
}

export function CardEffectsView({ card, compact }: { card: Pick<Card, "effects">; compact?: boolean }) {
  return (
    <>
      {card.effects.map((effect, i) => (
        <span key={i} className="effect-line">
          {i > 0 && <span className="effect-sep"> · </span>}
          <EffectView effect={effect} compact={compact} />
        </span>
      ))}
    </>
  )
}
