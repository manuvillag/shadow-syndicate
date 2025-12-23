import { Badge } from "@/components/ui/badge"
import { Shield, Terminal, Package, User } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CrewMemberCardProps {
  name: string
  role: "Enforcer" | "Hacker" | "Smuggler" | "Operative"
  level: number
  attack: number
  defense: number
  avatar?: string
}

const roleIcons = {
  Enforcer: Shield,
  Hacker: Terminal,
  Smuggler: Package,
  Operative: User,
}

const roleColors = {
  Enforcer: "text-neon-purple",
  Hacker: "text-neon-cyan",
  Smuggler: "text-neon-orange",
  Operative: "text-muted-foreground",
}

export function CrewMemberCard({ name, role, level, attack, defense }: CrewMemberCardProps) {
  const Icon = roleIcons[role]
  const color = roleColors[role]
  const totalPower = attack + defense

  return (
    <Card className="p-3 border-2 transition-all duration-200 hover:shadow-md hover:shadow-neon-cyan/10">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border-2",
          role === "Enforcer" && "bg-neon-purple/10 border-neon-purple/50",
          role === "Hacker" && "bg-neon-cyan/10 border-neon-cyan/50",
          role === "Smuggler" && "bg-neon-orange/10 border-neon-orange/50",
          role === "Operative" && "bg-muted/20 border-muted-foreground/30",
        )}>
          <Icon className={cn("w-6 h-6", color)} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-foreground truncate">{name}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-mono">
              L{level}
            </Badge>
          </div>
          <div className={cn(
            "text-[10px] font-semibold uppercase tracking-wider mb-2",
            color
          )}>
            {role}
          </div>
          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-destructive font-mono font-bold">⚔ {attack}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-neon-cyan font-mono font-bold">🛡 {defense}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs text-muted-foreground font-mono">Power: {totalPower}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
