"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Terminal, Package, Lock, Coins } from "lucide-react"
import { cn } from "@/lib/utils"

interface CrewMarketplaceCardProps {
  id: string
  name: string
  role: "Enforcer" | "Hacker" | "Smuggler"
  attack: number
  defense: number
  price: number
  levelRequirement: number
  description?: string | null
  playerLevel: number
  playerCredits: number
  onPurchase: () => void
  purchasing?: boolean
}

const roleIcons = {
  Enforcer: Shield,
  Hacker: Terminal,
  Smuggler: Package,
}

const roleColors = {
  Enforcer: "text-neon-purple",
  Hacker: "text-neon-cyan",
  Smuggler: "text-neon-orange",
}

export function CrewMarketplaceCard({
  name,
  role,
  attack,
  defense,
  price,
  levelRequirement,
  description,
  playerLevel,
  playerCredits,
  onPurchase,
  purchasing = false,
}: CrewMarketplaceCardProps) {
  const Icon = roleIcons[role]
  const color = roleColors[role]
  const totalPower = attack + defense
  const isLocked = playerLevel < levelRequirement
  const canAfford = playerCredits >= price

  return (
    <Card className={cn(
      "p-3 border-2 transition-all duration-200",
      isLocked 
        ? "opacity-60 border-border/30 bg-muted/20" 
        : "hover:shadow-md hover:shadow-neon-cyan/10",
      !isLocked && role === "Enforcer" && "border-neon-purple/30",
      !isLocked && role === "Hacker" && "border-neon-cyan/30",
      !isLocked && role === "Smuggler" && "border-neon-orange/30",
    )}>
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center border-2",
          role === "Enforcer" && "bg-neon-purple/10 border-neon-purple/50",
          role === "Hacker" && "bg-neon-cyan/10 border-neon-cyan/50",
          role === "Smuggler" && "bg-neon-orange/10 border-neon-orange/50",
        )}>
          {isLocked ? (
            <Lock className="w-8 h-8 text-muted-foreground" />
          ) : (
            <Icon className={cn("w-8 h-8", color)} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-foreground truncate">{name}</h3>
                {isLocked && (
                  <span className="text-[10px] text-muted-foreground font-mono">🔒 L{levelRequirement}</span>
                )}
              </div>
              <div className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                color
              )}>
                {role}
              </div>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{description}</p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-1 bg-destructive/10 text-destructive px-2 py-0.5 rounded text-xs font-mono">
              ⚔ {attack}
            </div>
            <div className="flex items-center gap-1 bg-neon-cyan/10 text-neon-cyan px-2 py-0.5 rounded text-xs font-mono">
              🛡 {defense}
            </div>
            <div className="flex items-center gap-1 bg-background/50 px-2 py-0.5 rounded text-xs font-mono text-muted-foreground">
              Power: {totalPower}
            </div>
          </div>

          {/* Price and Purchase */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-neon-orange" />
              <span className={cn(
                "text-sm font-bold font-mono",
                canAfford ? "text-neon-orange" : "text-destructive"
              )}>
                {price.toLocaleString()}
              </span>
            </div>
            <Button
              onClick={onPurchase}
              disabled={isLocked || !canAfford || purchasing}
              size="sm"
              className={cn(
                "h-7 text-xs font-bold uppercase tracking-wider",
                isLocked && "opacity-50 cursor-not-allowed",
                !isLocked && canAfford && role === "Enforcer" && "bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple border border-neon-purple/50",
                !isLocked && canAfford && role === "Hacker" && "bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50",
                !isLocked && canAfford && role === "Smuggler" && "bg-neon-orange/20 hover:bg-neon-orange/30 text-neon-orange border border-neon-orange/50",
                !canAfford && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLocked 
                ? `L${levelRequirement}` 
                : !canAfford 
                  ? "Need Credits" 
                  : purchasing 
                    ? "Buying..." 
                    : "Purchase"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

