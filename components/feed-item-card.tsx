"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Coins, TrendingUp, Package } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Reward {
  type: "credits" | "xp" | "loot"
  amount: number | string
}

interface FeedItemProps {
  icon: LucideIcon
  eventType: string
  message: string
  rewards?: Reward[]
  timestamp: string
  priority?: "normal" | "important"
  variant?: "cyan" | "purple" | "orange" | "default"
}

export function FeedItemCard({
  icon: Icon,
  eventType,
  message,
  rewards,
  timestamp,
  priority = "normal",
  variant = "default",
}: FeedItemProps) {
  const variantStyles = {
    cyan: "border-neon-cyan/30 bg-neon-cyan/5",
    purple: "border-neon-purple/30 bg-neon-purple/5",
    orange: "border-neon-orange/30 bg-neon-orange/5",
    default: "border-border",
  }

  const iconColorStyles = {
    cyan: "text-neon-cyan",
    purple: "text-neon-purple",
    orange: "text-neon-orange",
    default: "text-primary",
  }

  const badgeStyles = {
    cyan: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50",
    purple: "bg-neon-purple/20 text-neon-purple border-neon-purple/50",
    orange: "bg-neon-orange/20 text-neon-orange border-neon-orange/50",
    default: "bg-primary/20 text-primary border-primary/50",
  }

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200 hover:scale-[1.01]",
        variantStyles[variant],
        priority === "important" && "ring-2 ring-neon-cyan/50 neon-glow-cyan",
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
            priority === "important" ? "bg-neon-cyan/20" : "bg-secondary",
          )}
        >
          <Icon className={cn("w-5 h-5", iconColorStyles[variant])} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Event Type Badge */}
          <Badge className={cn("mb-2 text-xs font-mono uppercase tracking-wider", badgeStyles[variant])}>
            {eventType}
          </Badge>

          {/* Message */}
          <p className="text-sm text-foreground mb-2 text-pretty">{message}</p>

          {/* Rewards */}
          {rewards && rewards.length > 0 && (
            <>
              <Separator className="my-2 bg-border/50" />
              <div className="flex gap-3 flex-wrap">
                {rewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-xs">
                    {reward.type === "credits" && <Coins className="w-3.5 h-3.5 text-neon-orange" />}
                    {reward.type === "xp" && <TrendingUp className="w-3.5 h-3.5 text-neon-cyan" />}
                    {reward.type === "loot" && <Package className="w-3.5 h-3.5 text-neon-purple" />}
                    <span className="text-muted-foreground font-mono">
                      {reward.type === "credits" && "+"}
                      {reward.amount}
                      {reward.type === "xp" && " XP"}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground font-mono mt-2">{timestamp}</p>
        </div>
      </div>
    </Card>
  )
}
