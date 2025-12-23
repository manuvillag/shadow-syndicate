"use client"

import { Card } from "@/components/ui/card"
import { Shield, Users, Target, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SyndicateDirectiveCardProps {
  title: string
  description: string
  type: "defense" | "recruitment" | "assault"
  participants: number
  goal: number
  rewards: {
    credits: number
    xp: number
  }
  timeRemaining: string
}

export function SyndicateDirectiveCard({
  title,
  description,
  type,
  participants,
  goal,
  rewards,
  timeRemaining,
}: SyndicateDirectiveCardProps) {
  const [joined, setJoined] = useState(false)
  const progressPercent = (participants / goal) * 100

  const typeConfig = {
    defense: { icon: Shield, color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
    recruitment: { icon: Users, color: "text-neon-purple", bg: "bg-neon-purple/10" },
    assault: { icon: Target, color: "text-destructive", bg: "bg-destructive/10" },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <Card className="border border-neon-purple/30 bg-card">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`${config.bg} p-2 rounded-lg`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold mb-1 text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Syndicate Progress</span>
            <span className="text-[10px] font-mono text-foreground">
              {participants} / {goal}
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${config.bg.replace("/10", "/50")} transition-all duration-500`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Rewards */}
        <div className="flex items-center justify-between mb-3 p-2 bg-secondary/50 rounded-lg">
          <span className="text-xs text-muted-foreground">Rewards:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neon-cyan font-semibold">{rewards.credits.toLocaleString()} Credits</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-neon-purple font-semibold">+{rewards.xp} XP</span>
          </div>
        </div>

        {/* Time remaining */}
        <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="font-mono">{timeRemaining}</span>
        </div>

        {/* Join button */}
        {!joined ? (
          <Button onClick={() => setJoined(true)} className="w-full bg-primary hover:bg-primary/90" size="sm">
            Join Directive
          </Button>
        ) : (
          <div className="text-center text-xs text-success font-semibold">Joined - In Progress</div>
        )}
      </div>
    </Card>
  )
}
