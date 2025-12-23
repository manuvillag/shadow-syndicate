"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Sword, Zap, Check, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface ItemCardProps {
  name: string
  rarity: "common" | "rare" | "epic" | "legendary"
  type: "weapon" | "armor" | "gadget" | "consumable"
  attackBoost?: number
  defenseBoost?: number
  specialBoost?: string
  equipped: boolean
  onEquip: () => void
  quantity?: number
}

export function ItemCard({
  name,
  rarity,
  type,
  attackBoost,
  defenseBoost,
  specialBoost,
  equipped,
  onEquip,
  quantity,
}: ItemCardProps) {
  const rarityStyles = {
    common: "border-muted-foreground/30 bg-muted/20",
    rare: "border-neon-cyan/50 bg-neon-cyan/5",
    epic: "border-neon-purple/50 bg-neon-purple/5",
    legendary: "border-neon-orange/50 bg-neon-orange/5 neon-border-purple",
  }

  const rarityColors = {
    common: "text-muted-foreground",
    rare: "text-neon-cyan",
    epic: "text-neon-purple",
    legendary: "text-neon-orange",
  }

  const typeIcons = {
    weapon: <Sword className="w-8 h-8" />,
    armor: <Shield className="w-8 h-8" />,
    gadget: <Zap className="w-8 h-8" />,
    consumable: <Package className="w-8 h-8" />,
  }

  const isConsumable = type === 'consumable'

  return (
    <Card className={cn(
      "p-3 border-2 transition-all duration-200 overflow-hidden",
      rarityStyles[rarity],
      "hover:shadow-lg hover:shadow-neon-cyan/10"
    )}>
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center border-2",
          rarity === "common" && "bg-muted/30 border-muted-foreground/30",
          rarity === "rare" && "bg-neon-cyan/10 border-neon-cyan/50",
          rarity === "epic" && "bg-neon-purple/10 border-neon-purple/50",
          rarity === "legendary" && "bg-neon-orange/10 border-neon-orange/50",
        )}>
          <div className={cn("p-2 rounded", rarityColors[rarity])}>
            {typeIcons[type]}
          </div>
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
                  rarityColors[rarity],
                  rarity === "common" && "bg-muted/20",
                  rarity === "rare" && "bg-neon-cyan/10",
                  rarity === "epic" && "bg-neon-purple/10",
                  rarity === "legendary" && "bg-neon-orange/10",
                )}>
                  {rarity}
                </span>
                {quantity !== undefined && quantity > 1 && (
                  <span className="text-xs text-muted-foreground font-mono bg-background/50 px-1.5 py-0.5 rounded">
                    ×{quantity}
                  </span>
                )}
              </div>
            </div>
            {equipped && !isConsumable && (
              <div className="flex items-center gap-1 bg-success/20 text-success px-2 py-1 rounded text-xs font-semibold flex-shrink-0">
                <Check className="w-3 h-3" />
                Equipped
              </div>
            )}
          </div>

          {/* Stats */}
          {(attackBoost !== undefined && attackBoost > 0) || 
           (defenseBoost !== undefined && defenseBoost > 0) || 
           specialBoost ? (
            <div className="flex flex-wrap gap-2 mb-2">
              {attackBoost !== undefined && attackBoost > 0 && (
                <div className="flex items-center gap-1 bg-destructive/10 text-destructive px-2 py-0.5 rounded text-xs font-mono">
                  <Sword className="w-3 h-3" />
                  +{attackBoost} ATK
                </div>
              )}
              {defenseBoost !== undefined && defenseBoost > 0 && (
                <div className="flex items-center gap-1 bg-neon-cyan/10 text-neon-cyan px-2 py-0.5 rounded text-xs font-mono">
                  <Shield className="w-3 h-3" />
                  +{defenseBoost} DEF
                </div>
              )}
              {specialBoost && (
                <div className="flex items-center gap-1 bg-neon-purple/10 text-neon-purple px-2 py-0.5 rounded text-xs">
                  <Zap className="w-3 h-3" />
                  {specialBoost}
                </div>
              )}
            </div>
          ) : null}

          {/* Action Button */}
          {isConsumable ? (
            <div className="mt-auto pt-2">
              <div className="text-[10px] text-muted-foreground font-mono text-center bg-muted/20 px-2 py-1.5 rounded">
                Consumable • Use coming soon
              </div>
            </div>
          ) : (
            <Button
              onClick={onEquip}
              disabled={equipped}
              variant={equipped ? "outline" : "default"}
              size="sm"
              className={cn(
                "w-full font-bold uppercase tracking-wider text-xs h-8 mt-auto",
                !equipped && "bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50",
                equipped && "opacity-50 cursor-not-allowed"
              )}
            >
              {equipped ? "Equipped" : "Equip"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
