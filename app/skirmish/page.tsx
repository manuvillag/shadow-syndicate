"use client"

import { useState, useEffect } from "react"
import { GameLayout } from "@/components/game-layout"
import { OpponentCard } from "@/components/opponent-card"
import { FightResultModal } from "@/components/fight-result-modal"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePlayer } from "@/hooks/use-player"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { PowerDisplay } from "@/components/power-display"
import Link from "next/link"

interface Opponent {
  id: string
  name: string
  avatar: string
  powerLevel: number
  credits: number
  xp: number
  adrenalCost: number
  cooldown: number
  difficulty?: string
  description?: string
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
  const [playerPower, setPlayerPower] = useState<number>(0)
  const [powerBreakdown, setPowerBreakdown] = useState<any>(null)

  // Fetch player power (includes equipment and crew)
  useEffect(() => {
    async function fetchPlayerPower() {
      try {
        const response = await fetch("/api/skirmish/power")
        if (response.ok) {
          const data = await response.json()
          setPlayerPower(data.totalPower || 0)
          setPowerBreakdown(data.breakdown || null)
        }
      } catch (error) {
        console.error("[Skirmish] Error fetching power:", error)
        // Fallback to level-based power
        setPlayerPower((player?.level || 0) * 50)
      }
    }

    if (player) {
      fetchPlayerPower()
    }
  }, [player])

  // Fetch opponents
  useEffect(() => {
    async function fetchOpponents() {
      try {
        setLoadingOpponents(true)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player])

  // Don't block on loading - show content progressively

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
      
      // Refresh opponents after combat (to show cooldowns)
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
    <GameLayout>

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

        {/* Power Display */}
        {powerBreakdown && (
          <PowerDisplay 
            totalPower={playerPower} 
            breakdown={powerBreakdown}
            playerLevel={player?.level}
          />
        )}

        {/* Opponent List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono">Available Targets</h2>
            <p className="text-[10px] text-muted-foreground font-mono">
              Refreshes every 30 minutes
            </p>
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
                playerPower={playerPower}
                currentAdrenal={player?.adrenal || 0}
                onEngage={() => handleEngage(opponent)}
              />
            ))
          )}
        </div>
      </div>


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
    </GameLayout>
  )
}
