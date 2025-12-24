"use client"

import { Button } from "@/components/ui/button"
import { Heart, Zap } from "lucide-react"
import { useState } from "react"

interface HealOptionsCardProps {
  currentHealth: number
  maxHealth: number
  alloyCost: number
  playerAlloy?: number
  onHeal: (type: "free" | "instant") => void
}

export function HealOptionsCard({ currentHealth, maxHealth, alloyCost, playerAlloy = 0, onHeal }: HealOptionsCardProps) {
  const [isHealing, setIsHealing] = useState(false)
  const isFullHealth = currentHealth >= maxHealth
  const healAmount = maxHealth - currentHealth
  const canAffordInstant = playerAlloy >= alloyCost

  const handleHeal = (type: "free" | "instant") => {
    setIsHealing(true)
    onHeal(type)
    setTimeout(() => setIsHealing(false), 1000)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Healing Options</h3>

      {/* Free Heal */}
      <div className="bg-secondary/50 border border-border rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold text-foreground">Natural Regen</span>
          </div>
          <span className="text-xs text-success font-mono">FREE</span>
        </div>
        <p className="text-xs text-muted-foreground">Restores +1 HP every 2 minutes</p>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          disabled={isFullHealth || isHealing}
          onClick={() => handleHeal("free")}
        >
          Wait for Regen
        </Button>
      </div>

      {/* Instant Heal */}
      <div className="bg-secondary/50 border border-border rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-purple" />
            <span className="text-sm font-semibold text-foreground">Instant Heal</span>
          </div>
          <span className="text-xs text-neon-purple font-mono">{alloyCost} Alloy</span>
        </div>
        <p className="text-xs text-muted-foreground">Instantly restore +{healAmount} HP to full health</p>
        <Button
          className="w-full bg-neon-purple hover:bg-neon-purple/80 text-primary-foreground"
          disabled={isFullHealth || isHealing || !canAffordInstant}
          onClick={() => handleHeal("instant")}
        >
          <Zap className="w-4 h-4 mr-2" />
          {canAffordInstant ? "Heal Now" : `Need ${alloyCost} Alloy`}
        </Button>
        {!canAffordInstant && !isFullHealth && (
          <p className="text-xs text-red-500 font-mono">You have {playerAlloy} alloy, need {alloyCost}</p>
        )}
      </div>

      {isFullHealth && <div className="text-xs text-center text-success">You are at full health</div>}
    </div>
  )
}
