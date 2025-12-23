import { Users, TrendingUp, Award } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface CrewStatsCardProps {
  crewSize: number
  crewMax: number
  totalAttack: number
  totalDefense: number
  totalPower: number
  nextMilestone: number
  nextBonus: string
}

export function CrewStatsCard({ crewSize, crewMax, totalAttack, totalDefense, totalPower, nextMilestone, nextBonus }: CrewStatsCardProps) {
  const progress = Math.min(100, (crewSize / nextMilestone) * 100)

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Crew Size */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-neon-cyan" />
          <div>
            <div className="text-sm text-muted-foreground">Crew Size</div>
            <div className="text-2xl font-bold text-foreground">
              {crewSize}
              <span className="text-sm text-muted-foreground">/{crewMax}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-neon-cyan">
            <TrendingUp className="w-4 h-4" />
            <span className="text-lg font-bold font-mono">{totalPower.toLocaleString()}</span>
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Power</div>
        </div>
      </div>

      {/* Power Breakdown */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Attack</div>
          <div className="text-sm font-bold text-destructive font-mono">⚔ {totalAttack.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Defense</div>
          <div className="text-sm font-bold text-neon-cyan font-mono">🛡 {totalDefense.toLocaleString()}</div>
        </div>
      </div>

      {/* Milestone Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-neon-purple" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Next Milestone</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {crewSize}/{nextMilestone}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-xs text-accent mt-1.5">{nextBonus}</div>
      </div>
    </div>
  )
}
