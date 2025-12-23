"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, DollarSign, TrendingUp, CheckCircle2, Clock } from "lucide-react"
import { useState } from "react"

interface MissionCardProps {
  id?: string
  title: string
  description: string
  progress: number
  total: number
  rewards: {
    credits?: number
    xp?: number
    alloy?: number
  }
  timeLimit?: string
  completed?: boolean
}

export function MissionCard({
  id,
  title,
  description,
  progress,
  total,
  rewards,
  timeLimit,
  completed = false,
}: MissionCardProps) {
  const [claimed, setClaimed] = useState(completed)
  const [claiming, setClaiming] = useState(false)
  const progressPercent = (progress / total) * 100
  const isComplete = progress >= total && !claimed

  const handleClaim = async () => {
    if (!id || claiming) return

    setClaiming(true)
    try {
      const res = await fetch('/api/overseer/claim-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: id }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to claim rewards')
        return
      }

      setClaimed(true)
      // Optionally refresh page data or show success message
      if (data.leveledUp) {
        // Could show a level-up notification here
      }
    } catch (error) {
      console.error('[MissionCard] Claim error:', error)
      alert('Failed to claim rewards. Please try again.')
    } finally {
      setClaiming(false)
    }
  }

  return (
    <Card
      className={`border ${isComplete ? "border-success/50 bg-success/5" : claimed ? "border-border/30 bg-muted/20" : "border-border/50"} transition-all`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4
              className={`text-sm font-semibold mb-1 ${claimed ? "text-muted-foreground line-through" : "text-foreground"}`}
            >
              {title}
            </h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {claimed && <CheckCircle2 className="w-4 h-4 text-success ml-2 flex-shrink-0" />}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Progress</span>
            <span className="text-[10px] font-mono text-foreground">
              {progress} / {total}
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isComplete ? "bg-success" : "bg-gradient-to-r from-neon-purple to-neon-cyan"
              }`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Rewards */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {rewards.credits && (
            <div className="flex items-center gap-1 px-2 py-1 bg-neon-cyan/10 rounded text-xs">
              <DollarSign className="w-3 h-3 text-neon-cyan" />
              <span className="text-neon-cyan font-semibold">{rewards.credits.toLocaleString()}</span>
            </div>
          )}
          {rewards.xp && (
            <div className="flex items-center gap-1 px-2 py-1 bg-neon-purple/10 rounded text-xs">
              <TrendingUp className="w-3 h-3 text-neon-purple" />
              <span className="text-neon-purple font-semibold">+{rewards.xp} XP</span>
            </div>
          )}
          {rewards.alloy && (
            <div className="flex items-center gap-1 px-2 py-1 bg-warning/10 rounded text-xs">
              <Zap className="w-3 h-3 text-warning" />
              <span className="text-warning font-semibold">{rewards.alloy} Alloy</span>
            </div>
          )}
        </div>

        {/* Time limit */}
        {timeLimit && !claimed && (
          <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="font-mono">{timeLimit}</span>
          </div>
        )}

        {/* Claim button */}
        {isComplete && (
          <Button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full bg-success hover:bg-success/90 text-success-foreground"
            size="sm"
          >
            {claiming ? 'Claiming...' : 'Claim Rewards'}
          </Button>
        )}

        {claimed && <div className="text-center text-xs text-success font-semibold">Claimed</div>}
      </div>
    </Card>
  )
}
