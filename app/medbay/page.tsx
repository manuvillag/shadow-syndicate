"use client"

import { GameLayout } from "@/components/game-layout"
import { HealthStatusCard } from "@/components/health-status-card"
import { HealOptionsCard } from "@/components/heal-options-card"
import { CombatLogCard } from "@/components/combat-log-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { usePlayer } from "@/hooks/use-player"

export default function MedbayPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { player, loading, error, refetch: refetchPlayer } = usePlayer()
  const [combatLogs, setCombatLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(true)

  // Fetch combat logs and trigger health regeneration
  useEffect(() => {
    async function fetchCombatLogs() {
      try {
        const response = await fetch("/api/combat-logs")
        const data = await response.json()
        if (data.logs) {
          setCombatLogs(data.logs)
        }
      } catch (error) {
        console.error("[Medbay] Error fetching combat logs:", error)
      } finally {
        setLoadingLogs(false)
      }
    }

    async function triggerRegeneration() {
      // Trigger health regeneration when viewing medbay
      try {
        await fetch("/api/player", { method: 'GET' }) // This calls regenerate_energy
      } catch (error) {
        console.error("[Medbay] Error triggering regeneration:", error)
      }
    }

    if (player) {
      fetchCombatLogs()
      triggerRegeneration()
    }
  }, [player])

  // Don't block on loading - show content progressively
  const currentHealth = player?.health || 100
  const maxHealth = player?.health_max || 100

  // Calculate time until full regeneration
  const healthMissing = maxHealth - currentHealth
  const minutesUntilFull = healthMissing * 2 // 1 HP per 2 minutes
  const hours = Math.floor(minutesUntilFull / 60)
  const minutes = minutesUntilFull % 60
  const regenTime = healthMissing > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:00` : "0:00:00"

  const handleHeal = async (type: "free" | "instant") => {
    try {
      const res = await fetch('/api/medbay/heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to heal')
      }

      const data = await res.json()

      if (type === "instant") {
        toast({
          title: "Instant Heal Complete",
          description: `Restored ${data.healAmount} HP. Cost: ${data.alloyCost} Alloy`,
          className: "bg-card border-success",
        })
        // Refresh player data
        refetchPlayer()
      } else {
        toast({
          title: "Natural Regeneration Active",
          description: "Your health will restore naturally over time (+1 HP per 2 minutes)",
          className: "bg-card border-border",
        })
      }
    } catch (error) {
      console.error('[Medbay] Heal error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to heal",
        variant: "destructive",
      })
    }
  }

  return (
    <GameLayout>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md border-b border-border px-3 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Medbay</h1>
            <p className="text-xs text-muted-foreground">Recovery & medical services</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-4">
        {/* Health Status */}
        <HealthStatusCard currentHealth={currentHealth} maxHealth={maxHealth} regenTime={regenTime} />

        {/* Heal Options */}
        <HealOptionsCard 
          currentHealth={currentHealth} 
          maxHealth={maxHealth} 
          alloyCost={50} 
          playerAlloy={player?.alloy || 0}
          onHeal={handleHeal} 
        />

        {/* Combat Logs */}
        <CombatLogCard logs={combatLogs} />

        {/* Tips */}
        <div className="bg-secondary/30 border border-border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Medical Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Avoid combat when health is low to prevent longer recovery times</li>
            <li>• Use Alloy for instant healing before important operations</li>
            <li>• Natural regeneration is always active, even when offline</li>
          </ul>
        </div>
      </div>

    </GameLayout>
  )
}
