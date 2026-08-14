import { useState } from "react"
import { getEffectiveWonderStages, type GameStateView, type RoundAction } from "@sw/shared"
import { CardEffectsView, CoinIcon, CostView } from "./CardEffects"
import { DiscardPilePicker } from "./DiscardPilePicker"
import { WonderStagePicker } from "./WonderStagePicker"
import { leaderById, wonderSideOf } from "../lib/format"

interface Props {
  you: GameStateView["you"]
  discardPile: string[]
  onSubmit: (action: RoundAction) => void
  submitting: boolean
}

type PendingPick = {
  type: "recruitLeader" | "buildWonderStageFromLeader"
  cardId: string
  title: string
  stageIndex?: number
  mirrorStageIndex?: number
}

export function LeaderRecruitPanel({ you, discardPile, onSubmit, submitting }: Props) {
  const [pending, setPending] = useState<PendingPick | null>(null)
  const [pendingStageLeaderId, setPendingStageLeaderId] = useState<string | null>(null)
  const wonderSide = wonderSideOf(you.wonderId, you.wonderSide)
  const stageOptions = you.leaderHandView[0]?.wonderStageOptions
  const stageChoiceKind = you.leaderHandView[0]?.wonderStageChoiceKind
  const hasStageChoice = (stageOptions?.length ?? 0) > 0
  const nextStage = hasStageChoice ? undefined : getEffectiveWonderStages(you, wonderSide)[you.wonderStagesBuilt]
  const stageBuildsFromDiscard = nextStage?.effects.some((e) => e.kind === "buildFromDiscardPile") ?? false
  const eligibleDiscardIds = Array.from(new Set(discardPile.filter((id) => !you.builtCardIds.includes(id))))

  function recruit(leaderId: string, leaderName: string, buildsFromDiscard: boolean) {
    if (buildsFromDiscard && eligibleDiscardIds.length > 0) {
      setPending({ type: "recruitLeader", cardId: leaderId, title: `${leaderName} — build free from the discard pile` })
      return
    }
    onSubmit({ type: "recruitLeader", cardId: leaderId })
  }

  function fundStage(leaderId: string) {
    if (hasStageChoice) {
      setPendingStageLeaderId(leaderId)
      return
    }
    if (stageBuildsFromDiscard && eligibleDiscardIds.length > 0) {
      setPending({
        type: "buildWonderStageFromLeader",
        cardId: leaderId,
        title: `${wonderSide.wonderName} — build free from the discard pile`,
      })
      return
    }
    onSubmit({ type: "buildWonderStageFromLeader", cardId: leaderId })
  }

  function onStageChosen(leaderId: string, stageIndex: number) {
    setPendingStageLeaderId(null)
    const option = stageOptions?.find((o) => o.stageIndex === stageIndex)
    const buildsFromDiscard = option?.effects.some((e) => e.kind === "buildFromDiscardPile") ?? false
    const fields = {
      stageIndex: stageChoiceKind === "ownStage" ? stageIndex : undefined,
      mirrorStageIndex: stageChoiceKind === "mirrorStage" ? stageIndex : undefined,
    }
    if (buildsFromDiscard && eligibleDiscardIds.length > 0) {
      setPending({
        type: "buildWonderStageFromLeader",
        cardId: leaderId,
        title: `${wonderSide.wonderName} — build free from the discard pile`,
        ...fields,
      })
      return
    }
    onSubmit({ type: "buildWonderStageFromLeader", cardId: leaderId, ...fields })
  }

  return (
    <div className="hand-section">
      <h3>Leader recruitment — recruit, fund a wonder stage, or discard</h3>
      {you.leaderHandView.map((view) => {
        const leader = leaderById(view.cardId)
        const recruitBuildsFromDiscard = leader.effects.some((e) => e.kind === "recycleDiscardOnRecruit")
        return (
          <div key={view.cardId} className="leader-recruit-card">
            <div className="leader-recruit-info">
              <div className="leader-recruit-name">{leader.name}</div>
              <div className="leader-recruit-effect">
                <CardEffectsView card={leader} />
              </div>
            </div>
            <button
              className="action-btn primary"
              disabled={submitting || !view.recruitAffordable}
              onClick={() => recruit(view.cardId, leader.name, recruitBuildsFromDiscard)}
            >
              Recruit{" "}
              {view.recruitFree ? (
                "(free)"
              ) : (
                <>
                  — <CoinIcon amount={leader.coinCost} />
                </>
              )}
            </button>
            {hasStageChoice ? (
              <button
                className="action-btn"
                disabled={submitting || !view.wonderStageAffordable}
                onClick={() => fundStage(view.cardId)}
              >
                {stageChoiceKind === "mirrorStage"
                  ? "Fund — mirror a neighbor's Great Wall stage…"
                  : "Fund a wonder stage…"}
              </button>
            ) : (
              nextStage && (
                <button
                  className="action-btn"
                  disabled={submitting || !view.wonderStageAffordable}
                  onClick={() => fundStage(view.cardId)}
                >
                  Fund wonder stage {you.wonderStagesBuilt + 1} — <CostView cost={nextStage.cost} />
                </button>
              )
            )}
            <button
              className="action-btn"
              disabled={submitting}
              onClick={() => onSubmit({ type: "discardLeaderForCoins", cardId: view.cardId })}
            >
              Discard for <CoinIcon amount={3} gain />
            </button>
          </div>
        )
      })}

      {pendingStageLeaderId !== null && stageOptions && (
        <WonderStagePicker
          title={
            stageChoiceKind === "mirrorStage"
              ? "Manneken Pis — choose which of your neighbor's Great Wall stages to mirror"
              : `${wonderSide.wonderName} — choose which stage to fund`
          }
          hint={
            stageChoiceKind === "mirrorStage"
              ? "This development copies one of your neighbor's Great Wall stages — pick which."
              : "Choose which wonder stage to build — any order is allowed."
          }
          optionLabel={stageChoiceKind === "mirrorStage" ? (i) => `Great Wall stage ${i + 1}` : undefined}
          options={stageOptions}
          submitting={submitting}
          onCancel={() => setPendingStageLeaderId(null)}
          onPick={(stageIndex) => onStageChosen(pendingStageLeaderId, stageIndex)}
        />
      )}

      {pending && (
        <DiscardPilePicker
          title={pending.title}
          cardIds={eligibleDiscardIds}
          submitting={submitting}
          onCancel={() => setPending(null)}
          onPick={(discardPickId) => {
            const action: RoundAction =
              pending.type === "buildWonderStageFromLeader"
                ? {
                    type: "buildWonderStageFromLeader",
                    cardId: pending.cardId,
                    discardPickId,
                    stageIndex: pending.stageIndex,
                    mirrorStageIndex: pending.mirrorStageIndex,
                  }
                : { type: "recruitLeader", cardId: pending.cardId, discardPickId }
            setPending(null)
            onSubmit(action)
          }}
        />
      )}
    </div>
  )
}
