"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sword, Shield, Zap, Lock, Coins } from "lucide-react"
import { cn } from "@/lib/utils"

interface ItemMarketplaceCardProps {
  id: string
  name: string
  rarity: "common" | "rare" | "epic" | "legendary"
  type: "weapon" | "armor" | "gadget"
  attackBoost: number
  defenseBoost: number
  specialBoost?: string | null
  price: number
  levelRequirement: number
  description: string
  playerLevel: number
  playerCredits: number
  onPurchase: () => void
  purchasing?: boolean
  locked?: boolean
  isOwned?: boolean
}

const typeIcons = {
  weapon: Sword,
  armor: Shield,
  gadget: Zap,
}

const getRarityStyles = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return {
        text: 'text-muted-foreground',
        border: 'border-muted-foreground/30',
        bg: 'bg-muted/10',
        button: 'bg-muted/20 hover:bg-muted/30 text-muted-foreground border border-muted-foreground/50',
      }
    case 'rare':
      return {
        text: 'text-neon-cyan',
        border: 'border-neon-cyan/30',
        bg: 'bg-neon-cyan/10',
        button: 'bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50',
      }
    case 'epic':
      return {
        text: 'text-neon-purple',
        border: 'border-neon-purple/30',
        bg: 'bg-neon-purple/10',
        button: 'bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple border border-neon-purple/50',
      }
    case 'legendary':
      return {
        text: 'text-neon-orange',
        border: 'border-neon-orange/30',
        bg: 'bg-neon-orange/10',
        button: 'bg-neon-orange/20 hover:bg-neon-orange/30 text-neon-orange border border-neon-orange/50',
      }
    default:
      return {
        text: 'text-muted-foreground',
        border: 'border-border/30',
        bg: 'bg-muted/10',
        button: 'bg-muted/20 hover:bg-muted/30 text-muted-foreground border border-border/50',
      }
  }
}

export function ItemMarketplaceCard({
  name,
  rarity,
  type,
  attackBoost,
  defenseBoost,
  specialBoost,
  price,
  levelRequirement,
  description,
  playerLevel,
  playerCredits,
  onPurchase,
  purchasing = false,
  locked = false,
  isOwned = false,
}: ItemMarketplaceCardProps) {
  const Icon = typeIcons[type]
  const styles = getRarityStyles(rarity)
  const isLocked = locked || playerLevel < levelRequirement || isOwned
  const canAfford = playerCredits >= price

  return (
    <Card className={cn(
      "p-3 border-2 transition-all duration-200",
      isLocked 
        ? "opacity-60 border-border/30 bg-muted/20" 
        : "hover:shadow-md hover:shadow-neon-cyan/10",
      !isLocked && styles.border,
    )}>
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center border-2",
          isLocked ? "bg-muted/10 border-border/30" : styles.bg,
          !isLocked && styles.border,
        )}>
          {isLocked ? (
            <Lock className="w-8 h-8 text-muted-foreground" />
          ) : (
            <Icon className={cn("w-8 h-8", styles.text)} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className={cn(
                  "text-sm font-bold truncate",
                  isLocked && playerLevel < levelRequirement ? "text-muted-foreground" : "text-foreground"
                )}>
                  {name}
                </h3>
                {isOwned && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/20 text-success font-semibold font-mono uppercase">OWNED</span>
                )}
                {!isOwned && playerLevel < levelRequirement && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-semibold font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    LEVEL {levelRequirement}
                  </span>
                )}
              </div>
              <div className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                isLocked && playerLevel < levelRequirement ? "text-muted-foreground/60" : styles.text
              )}>
                {rarity} {type}
              </div>
              {!isOwned && playerLevel < levelRequirement && (
                <div className="mt-1 text-[10px] text-destructive font-mono">
                  Requires Level {levelRequirement} (You are Level {playerLevel})
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{description}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-2 mb-2">
            {attackBoost > 0 && (
              <div className="flex items-center gap-1 bg-destructive/10 text-destructive px-2 py-0.5 rounded text-xs font-mono">
                ⚔ +{attackBoost}
              </div>
            )}
            {defenseBoost > 0 && (
              <div className="flex items-center gap-1 bg-neon-cyan/10 text-neon-cyan px-2 py-0.5 rounded text-xs font-mono">
                🛡 +{defenseBoost}
              </div>
            )}
            {specialBoost && (
              <div className="flex items-center gap-1 bg-neon-purple/10 text-neon-purple px-2 py-0.5 rounded text-xs font-mono">
                ⚡ {specialBoost}
              </div>
            )}
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
                isLocked && playerLevel < levelRequirement && "opacity-50 cursor-not-allowed bg-destructive/10 text-destructive border border-destructive/30",
                isLocked && isOwned && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground",
                !isLocked && canAfford && "bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50",
                !canAfford && !isLocked && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
              )}
            >
              {isOwned
                ? "Owned"
                : isLocked && playerLevel < levelRequirement
                  ? `LOCKED - L${levelRequirement}` 
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

