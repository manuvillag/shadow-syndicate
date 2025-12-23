import { ResourceChip } from "./resource-chip"
import { Zap, Droplet, Users } from "lucide-react"

interface HudBarProps {
  credits: number
  alloy: number
  level: number
  xpCurrent: number
  xpMax: number
  charge: number
  chargeMax: number
  adrenal: number
  adrenalMax: number
  crewSize: number
  crewMax: number
}

export function HudBar({
  credits,
  alloy,
  level,
  xpCurrent,
  xpMax,
  charge,
  chargeMax,
  adrenal,
  adrenalMax,
  crewSize,
  crewMax,
}: HudBarProps) {
  const xpPercent = (xpCurrent / xpMax) * 100

  return (
    <div className="w-full bg-card/90 backdrop-blur-md border-b border-border">
      {/* Top row - Resources */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2 flex-wrap">
          <ResourceChip label="Credits" value={credits.toLocaleString()} variant="cyan" />
          <ResourceChip label="Alloy" value={alloy} variant="purple" />
          <ResourceChip label="Level" value={level} variant="orange" />
        </div>
        <div className="flex items-center gap-2">
          <ResourceChip
            label="Charge"
            value={`${charge}/${chargeMax}`}
            icon={<Zap className="w-3 h-3" />}
            variant="cyan"
          />
          <ResourceChip
            label="Adrenal"
            value={`${adrenal}/${adrenalMax}`}
            icon={<Droplet className="w-3 h-3" />}
            variant="purple"
          />
          <ResourceChip
            label="Crew"
            value={`${crewSize}/${crewMax}`}
            icon={<Users className="w-3 h-3" />}
            variant="default"
          />
        </div>
      </div>

      {/* XP Progress bar */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Experience</span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {xpCurrent.toLocaleString()} / {xpMax.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan transition-all duration-500"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
