import { Flame, Trophy } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StreakTrackerProps {
  currentStreak: number
  longestStreak: number
  nextRewardAt: number
}

export function StreakTracker({ currentStreak, longestStreak, nextRewardAt }: StreakTrackerProps) {
  const daysToReward = nextRewardAt - currentStreak

  return (
    <Card className="border border-neon-purple/30 bg-card">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-mono">Daily Streak</h3>
          <Flame className="w-4 h-4 text-warning" />
        </div>

        <div className="flex items-center justify-around mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-warning neon-text-cyan mb-1">{currentStreak}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Current</div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-purple mb-1">{longestStreak}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Record</div>
          </div>
        </div>

        {daysToReward > 0 && (
          <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg border border-border/50">
            <Trophy className="w-4 h-4 text-neon-cyan" />
            <div className="flex-1">
              <p className="text-xs text-foreground/90">
                <span className="font-bold text-neon-cyan">{daysToReward}</span> more days for bonus reward
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
