import { Swords, TrendingUp, TrendingDown } from "lucide-react"

interface CombatLogEntry {
  time: string
  opponent: string
  result: "win" | "lose"
  damage: number
  rewards?: number
}

interface CombatLogCardProps {
  logs: CombatLogEntry[]
}

export function CombatLogCard({ logs }: CombatLogCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Swords className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recent Combat</h3>
      </div>

      <div className="space-y-2">
        {logs.map((log, index) => (
          <div
            key={index}
            className="bg-secondary/50 border border-border rounded p-2 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {log.result === "win" ? (
                <TrendingUp className="w-4 h-4 text-success flex-shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">{log.opponent}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{log.time}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-mono ${log.result === "win" ? "text-success" : "text-destructive"}`}>
                -{log.damage} HP
              </div>
              {log.rewards && <div className="text-[10px] text-accent">+{log.rewards}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
