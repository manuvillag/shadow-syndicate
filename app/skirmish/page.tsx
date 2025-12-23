"use client"

import { useState, useEffect } from "react"
import { HudBar } from "@/components/hud-bar"
import { BottomNav } from "@/components/bottom-nav"
import { OpponentCard } from "@/components/opponent-card"
import { FightResultModal } from "@/components/fight-result-modal"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePlayer } from "@/hooks/use-player"
import { mapPlayerToHudData } from "@/lib/player-utils"
import { PageLoadingSkeleton } from "@/components/loading-skeletons"
import { ErrorPage } from "@/components/error-display"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface Opponent {
  id: number
  name: string
  avatar: string
  powerLevel: number
  credits: number
  xp: number
  adrenalCost: number
  cooldown: number
}

export default function SkirmishPage() {
  const router = useRouter()
  const { player, loading, error, refetch: refetchPlayer } = usePlayer()
  const { toast } = useToast()
  const [opponents, setOpponents] = useState<Opponent[]>([])
  const [loadingOpponents, setLoadingOpponents] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const [fightResult, setFightResult] = useState<any>(null)
  const [engaging, setEngaging] = useState(false)

  // Fetch opponents
  useEffect(() => {
    async function fetchOpponents() {
      try {
        const response = await fetch("/api/skirmish/opponents")
        if (!response.ok) {
          throw new Error('Failed to fetch opponents')
        }
        const data = await response.json()
        if (data.opponents) {
          setOpponents(data.opponents)
        }
      } catch (error) {
        console.error("[Skirmish] Error fetching opponents:", error)
        toast({
          title: "Error",
          description: "Failed to load opponents. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingOpponents(false)
      }
    }

    if (player) {
      fetchOpponents()
    }
  }, [player, toast])

  // Show loading state
  if (loading || loadingOpponents) {
    return <PageLoadingSkeleton />
  }

  // Show error state
  if (error || !player) {
    return (
      <ErrorPage
        error={error || "Player not found"}
        onRetry={() => window.location.reload()}
      />
    )
  }

  const playerData = mapPlayerToHudData(player)

  const handleEngage = async (opponent: Opponent) => {
    if (engaging) return

    setEngaging(true)

    try {
      const response = await fetch("/api/skirmish/engage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponentId: opponent.id,
          opponentName: opponent.name,
          opponentPowerLevel: opponent.powerLevel,
          opponentCredits: opponent.credits,
          opponentXp: opponent.xp,
          adrenalCost: opponent.adrenalCost,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to engage opponent')
      }

      const data = await response.json()

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
        setEngaging(false)
        return
      }

      setFightResult(data)
      setShowResult(true)
      refetchPlayer() // Refresh player data
      
      // Refresh opponents after combat
      const oppResponse = await fetch("/api/skirmish/opponents")
      if (oppResponse.ok) {
        const oppData = await oppResponse.json()
        if (oppData.opponents) {
          setOpponents(oppData.opponents)
        }
      }
    } catch (error) {
      console.error("[Skirmish] Error engaging opponent:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to engage opponent",
        variant: "destructive",
      })
    } finally {
      setEngaging(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HUD Bar */}
      <HudBar {...playerData} />

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="text-neon-cyan hover:text-neon-cyan/80 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Skirmish</h1>
            <p className="text-sm text-muted-foreground">Engage in combat for rewards</p>
          </div>
        </div>

        {/* Opponent List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono">Available Targets</h2>
            <span className="text-xs font-mono text-muted-foreground bg-background/50 px-2 py-1 rounded">
              Power: {player.level}
            </span>
          </div>
          {opponents.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm font-semibold text-foreground mb-1">No opponents available</p>
              <p className="text-xs text-muted-foreground">Opponents will refresh soon</p>
            </Card>
          ) : (
            opponents.map((opponent) => (
              <OpponentCard
                key={opponent.id}
                {...opponent}
                playerPower={player.level}
                currentAdrenal={player.adrenal}
                onEngage={() => handleEngage(opponent)}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="skirmish" onTabChange={(tab) => router.push(tab === "home" ? "/" : `/${tab}`)} />

      {/* Fight Result Modal */}
      {fightResult && (
        <FightResultModal
          open={showResult}
          onClose={() => {
            setShowResult(false)
            setFightResult(null)
          }}
          result={fightResult}
        />
      )}
    </div>
  )
}
