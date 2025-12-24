"use client"

import { GameLayout } from "@/components/game-layout"
import { EventBanner } from "@/components/event-banner"
import { StreakTracker } from "@/components/streak-tracker"
import { MissionCard } from "@/components/mission-card"
import { LimitedOfferCard } from "@/components/limited-offer-card"
import { SyndicateDirectiveCard } from "@/components/syndicate-directive-card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { usePlayer } from "@/hooks/use-player"
import { useState, useEffect } from "react"

export default function OverseerPage() {
  const router = useRouter()
  const { player, loading, error } = usePlayer()
  const [dailyMissions, setDailyMissions] = useState<any[]>([])
  const [limitedOffers, setLimitedOffers] = useState<any[]>([])
  const [syndicateDirectives, setSyndicateDirectives] = useState<any[]>([])
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0, nextRewardAt: 7 })
  const [loadingMissions, setLoadingMissions] = useState(true)

  // Fetch daily missions and streak
  useEffect(() => {
    async function fetchData() {
      if (!player) return

      try {
        // Fetch daily missions
        const missionsRes = await fetch('/api/overseer/daily-missions')
        if (missionsRes.ok) {
          const missionsData = await missionsRes.json()
          setDailyMissions(missionsData.missions || [])
        }

        // Fetch streak data
        const streakRes = await fetch('/api/overseer/streak')
        if (streakRes.ok) {
          const streakData = await streakRes.json()
          setStreakData(streakData)
        }
      } catch (error) {
        console.error('[Overseer] Error fetching data:', error)
      } finally {
        setLoadingMissions(false)
      }
    }

    fetchData()
  }, [player])

  return (
    <GameLayout>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md border-b border-border px-3 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Overseer</h1>
            <p className="text-xs text-muted-foreground">Directives & Opportunities</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-4 space-y-6">
        {/* Event Banner */}
        <EventBanner
          title="Galactic Heist Weekend"
          description="Double XP and Credits on all contracts this weekend only!"
          timeRemaining="2d 14h"
        />

        {/* Streak Tracker */}
        <StreakTracker 
          currentStreak={streakData.currentStreak} 
          longestStreak={streakData.longestStreak} 
          nextRewardAt={streakData.nextRewardAt} 
        />

        {/* Daily Missions */}
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono mb-3">Daily Missions</h2>
          {loadingMissions ? (
            <div className="text-center py-8 text-muted-foreground text-sm font-mono">Loading missions...</div>
          ) : dailyMissions.length > 0 ? (
            <div className="space-y-3">
              {dailyMissions.map((mission) => (
                <MissionCard key={mission.id} {...mission} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm font-mono">
              No daily missions available
            </div>
          )}
        </div>

        {/* Limited-Time Offers */}
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono mb-3">Limited Offers</h2>
          <div className="space-y-3">
            {limitedOffers.map((offer, index) => (
              <LimitedOfferCard key={index} {...offer} />
            ))}
          </div>
        </div>

        {/* Syndicate Directives */}
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono mb-3">
            Syndicate Directives
          </h2>
          <div className="space-y-3">
            {syndicateDirectives.map((directive, index) => (
              <SyndicateDirectiveCard key={index} {...directive} />
            ))}
          </div>
        </div>
      </div>

    </GameLayout>
  )
}
