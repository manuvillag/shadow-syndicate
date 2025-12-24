import { Heart, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface HealthStatusCardProps {
  currentHealth: number
  maxHealth: number
  regenTime: string
}

export function HealthStatusCard({ currentHealth, maxHealth, regenTime }: HealthStatusCardProps) {
  const healthPercent = (currentHealth / maxHealth) * 100
  const isInjured = healthPercent < 100

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className={`w-5 h-5 ${isInjured ? "text-destructive" : "text-success"}`} />
          <div>
            <div className="text-sm text-muted-foreground">Health Status</div>
            <div className="text-2xl font-bold text-foreground">
              {currentHealth}
              <span className="text-sm text-muted-foreground">/{maxHealth}</span>
            </div>
          </div>
        </div>

        {isInjured && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono">{regenTime}</span>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Full Regen</div>
          </div>
        )}
      </div>

      <Progress
        value={healthPercent}
        className="h-3"
        indicatorClassName={isInjured ? "bg-destructive" : "bg-success"}
      />

      {isInjured && <div className="text-xs text-muted-foreground mt-2">Natural regeneration: +1 HP per 2 minutes</div>}
    </div>
  )
}
