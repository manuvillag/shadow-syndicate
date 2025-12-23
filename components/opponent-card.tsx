"use client"

import { Swords, Award, Zap, User, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface OpponentCardProps {
  name: string
  avatar: string
  powerLevel: number
  playerPower: number
  credits: number
  xp: number
  adrenalCost: number
  currentAdrenal: number
  onEngage: () => void
  cooldown?: number
}

export function OpponentCard({
  name,
  avatar,
  powerLevel,
  playerPower,
  credits,
  xp,
  adrenalCost,
  currentAdrenal,
  onEngage,
  cooldown = 0,
}: OpponentCardProps) {
  const powerDiff = powerLevel - playerPower
  const difficulty = powerDiff > 20 ? "Extreme" : powerDiff > 10 ? "Hard" : powerDiff > 0 ? "Moderate" : "Easy"
  const difficultyColor =
    difficulty === "Extreme"
      ? "text-red-500"
      : difficulty === "Hard"
        ? "text-orange-500"
        : difficulty === "Moderate"
          ? "text-yellow-500"
          : "text-neon-cyan"

  const canEngage = currentAdrenal >= adrenalCost && cooldown === 0
  const isLowAdrenal = currentAdrenal < adrenalCost

  return (
    <Card className={cn(
      "p-3 border-2 transition-all duration-200",
      canEngage && "hover:border-neon-purple/50 hover:shadow-lg hover:shadow-neon-purple/10",
      !canEngage && "opacity-75"
    )}>
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center border-2",
          difficulty === "Extreme" && "bg-red-500/10 border-red-500/50",
          difficulty === "Hard" && "bg-orange-500/10 border-orange-500/50",
          difficulty === "Moderate" && "bg-yellow-500/10 border-yellow-500/50",
          difficulty === "Easy" && "bg-neon-cyan/10 border-neon-cyan/50",
        )}>
          {cooldown > 0 ? (
            <div className="flex flex-col items-center gap-1">
              <AlertTriangle className="w-6 h-6 text-muted-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground">{cooldown}m</span>
            </div>
          ) : (
            <User className={cn(
              "w-8 h-8",
              difficulty === "Extreme" && "text-red-500",
              difficulty === "Hard" && "text-orange-500",
              difficulty === "Moderate" && "text-yellow-500",
              difficulty === "Easy" && "text-neon-cyan",
            )} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate mb-1">{name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider font-mono px-1.5 py-0.5 rounded",
                  difficultyColor,
                  difficulty === "Extreme" && "bg-red-500/10",
                  difficulty === "Hard" && "bg-orange-500/10",
                  difficulty === "Moderate" && "bg-yellow-500/10",
                  difficulty === "Easy" && "bg-neon-cyan/10",
                )}>
                  {difficulty}
                </span>
                <span className="text-xs text-muted-foreground font-mono bg-background/50 px-1.5 py-0.5 rounded">
                  PWR: {powerLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-1 bg-neon-cyan/10 text-neon-cyan px-2 py-0.5 rounded text-xs font-mono">
              <Award className="w-3 h-3" />
              {credits.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-xs font-mono">
              <Zap className="w-3 h-3" />
              +{xp} XP
            </div>
            <div className="flex items-center gap-1 bg-neon-purple/10 text-neon-purple px-2 py-0.5 rounded text-xs font-mono">
              <Swords className="w-3 h-3" />
              {adrenalCost} ADR
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={onEngage}
            disabled={!canEngage}
            size="sm"
            className={cn(
              "w-full h-8 font-bold uppercase tracking-wider text-xs mt-auto",
              canEngage && "bg-gradient-to-r from-neon-purple to-neon-purple/80 hover:from-neon-purple hover:to-neon-purple text-white border border-neon-purple/50",
              !canEngage && "opacity-50 cursor-not-allowed bg-muted/20 text-muted-foreground border border-border/30",
            )}
          >
            {cooldown > 0 
              ? `Cooldown ${cooldown}m` 
              : isLowAdrenal 
                ? `Need ${adrenalCost - currentAdrenal} More ADR` 
                : "Engage"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
