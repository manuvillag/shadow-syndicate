"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Coins, TrendingUp, Package, FileText, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContractCardProps {
  name: string
  description: string
  energyCost: number
  creditsReward: number
  xpReward: number
  lootChance: number
  difficulty: "easy" | "risky" | "elite" | "event"
  levelRequirement?: number
  playerLevel?: number
  onRunContract: () => void
}

export function ContractCard({
  name,
  description,
  energyCost,
  creditsReward,
  xpReward,
  lootChance,
  difficulty,
  levelRequirement = 1,
  playerLevel = 1,
  onRunContract,
}: ContractCardProps) {
  const difficultyStyles = {
    easy: "border-l-success border-l-4 bg-success/5",
    risky: "border-l-warning border-l-4 bg-warning/5",
    elite: "border-l-destructive border-l-4 bg-destructive/5",
    event: "border-l-neon-purple border-l-4 bg-neon-purple/5",
  }

  const difficultyLabels = {
    easy: "Easy",
    risky: "Risky",
    elite: "Elite",
    event: "Event",
  }

  const difficultyColors = {
    easy: "text-success",
    risky: "text-warning",
    elite: "text-destructive",
    event: "text-neon-purple",
  }

  const difficultyIcons = {
    easy: "✓",
    risky: "⚠",
    elite: "⚡",
    event: "★",
  }

  // Check if contract is locked
  const isLocked = playerLevel < levelRequirement

  // Only calculate success rate if contract is NOT locked
  let successRate: number | null = null
  if (!isLocked) {
    // Calculate success rate for display (matching API logic)
    const tierBaseSuccessRate = {
      easy: 95,
      risky: 75,
      elite: 50,
      event: 60,
    }[difficulty] || 75

    // Within-tier difficulty modifier based on energy cost
    // Higher energy cost = slightly harder = lower success rate
    let energyModifier = 0
    if (difficulty === 'easy') {
      const minEnergy = 10
      energyModifier = -Math.floor((energyCost - minEnergy) / 2) * 2 // -2% per 2 energy above 10
    } else if (difficulty === 'risky') {
      const minEnergy = 15
      energyModifier = -Math.floor((energyCost - minEnergy) / 3) * 2 // -2% per 3 energy above 15
    } else if (difficulty === 'elite') {
      const minEnergy = 25
      energyModifier = -Math.floor((energyCost - minEnergy) / 5) * 2 // -2% per 5 energy above 25
    } else if (difficulty === 'event') {
      const minEnergy = 50
      energyModifier = -Math.floor((energyCost - minEnergy) / 5) * 2 // -2% per 5 energy above 50
    }

    const baseSuccessRate = Math.max(30, tierBaseSuccessRate + energyModifier) // Minimum 30% base

    const levelDiff = playerLevel - levelRequirement
    const levelModifier = levelDiff > 0 
      ? Math.min(20, levelDiff * 5) // +5% per level above, max +20% (allows up to 100%)
      : 0 // No modifier if at requirement, no penalty if below (contract is locked)
    successRate = Math.max(5, Math.min(100, baseSuccessRate + levelModifier))
  }

  return (
    <Card
      className={cn(
        "p-3 border-2 transition-all duration-200",
        isLocked 
          ? "opacity-60 border-border/30 bg-muted/20" 
          : "hover:shadow-md hover:shadow-neon-cyan/10 hover:border-neon-cyan/30",
        !isLocked && difficultyStyles[difficulty],
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          <FileText className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-foreground leading-tight">{name}</h3>
              {isLocked && (
                <span className="text-[10px] text-muted-foreground font-mono">🔒 L{levelRequirement}</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider font-mono px-1.5 py-0.5 rounded",
                  difficultyColors[difficulty],
                  difficulty === "easy" && "bg-success/10 border border-success/30",
                  difficulty === "risky" && "bg-warning/10 border border-warning/30",
                  difficulty === "elite" && "bg-destructive/10 border border-destructive/30",
                  difficulty === "event" && "bg-neon-purple/10 border border-neon-purple/30",
                )}
              >
                {difficultyIcons[difficulty]} {difficultyLabels[difficulty]}
              </span>
                  {!isLocked && successRate !== null && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {Math.round(successRate)}% success
                    </span>
                  )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-foreground/80 leading-relaxed mb-3 line-clamp-2">{description}</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        <div className="flex flex-col items-center bg-background/40 rounded p-1.5 border border-border/20">
          <Zap className="w-3 h-3 text-neon-cyan mb-0.5" />
          <span className="text-[10px] text-muted-foreground uppercase font-mono">Cost</span>
          <span className="text-xs font-bold text-neon-cyan font-mono">{energyCost}</span>
        </div>

        <div className="flex flex-col items-center bg-background/40 rounded p-1.5 border border-border/20">
          <Coins className="w-3 h-3 text-neon-orange mb-0.5" />
          <span className="text-[10px] text-muted-foreground uppercase font-mono">Credits</span>
          <span className="text-xs font-bold text-neon-orange font-mono">{creditsReward.toLocaleString()}</span>
        </div>

        <div className="flex flex-col items-center bg-background/40 rounded p-1.5 border border-border/20">
          <TrendingUp className="w-3 h-3 text-neon-purple mb-0.5" />
          <span className="text-[10px] text-muted-foreground uppercase font-mono">XP</span>
          <span className="text-xs font-bold text-neon-purple font-mono">{xpReward.toLocaleString()}</span>
        </div>

        <div className="flex flex-col items-center bg-background/40 rounded p-1.5 border border-border/20">
          <Package className="w-3 h-3 text-success mb-0.5" />
          <span className="text-[10px] text-muted-foreground uppercase font-mono">Loot</span>
          <span className="text-xs font-bold text-success font-mono">{lootChance}%</span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={onRunContract}
        disabled={isLocked}
        size="sm"
        className={cn(
          "w-full text-xs font-bold uppercase tracking-wider transition-all h-8",
          isLocked 
            ? "bg-muted/20 text-muted-foreground border border-border/30 cursor-not-allowed"
            : difficulty === "easy" && "bg-success/20 hover:bg-success/30 text-success border border-success/50",
          !isLocked && difficulty === "risky" && "bg-warning/20 hover:bg-warning/30 text-warning border border-warning/50",
          !isLocked && difficulty === "elite" && "bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/50",
          !isLocked && difficulty === "event" && "bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple border border-neon-purple/50",
        )}
      >
        {isLocked ? `Requires Level ${levelRequirement}` : "Accept Contract"}
      </Button>
    </Card>
  )
}
