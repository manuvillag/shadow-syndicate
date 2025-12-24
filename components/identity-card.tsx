import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import Image from "next/image"

interface IdentityCardProps {
  handle: string
  rank: string
  syndicate: string
  level?: number
  playerId?: string
  crewSize?: number
  crewMax?: number
}

export function IdentityCard({ handle, rank, syndicate, level, playerId, crewSize, crewMax }: IdentityCardProps) {
  return (
    <div className="relative mx-3 my-4 p-5 bg-card border-2 border-neon-purple/30 rounded-lg overflow-hidden shadow-lg shadow-neon-purple/10">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px),
                           repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)`,
          }}
        />
      </div>

      <div className="relative flex items-center gap-5">
        {/* Player avatar image - larger */}
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 rounded-lg border-2 border-neon-purple/50 bg-neon-purple/10 overflow-hidden neon-glow-purple shadow-lg">
            <Image 
              src="/futuristic-space-crime-syndicate-operator-portrait.jpg" 
              alt="Player Avatar" 
              fill 
              className="object-cover" 
            />
            <div className="absolute inset-0 bg-neon-purple/20" />
          </div>
        </div>

        {/* Player info - improved spacing */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-foreground font-mono truncate neon-text-cyan">
              {handle}
            </h2>
            {level !== undefined && (
              <Badge 
                variant="secondary" 
                className="text-xs font-bold font-mono border-neon-orange/50 bg-neon-orange/10 text-neon-orange px-2 py-0.5"
              >
                LVL {level}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <Badge 
              variant="secondary" 
              className="text-xs font-semibold font-mono border-neon-purple/50 bg-neon-purple/10 text-neon-purple px-2.5 py-1"
            >
              {rank}
            </Badge>
            <span className="text-sm text-muted-foreground font-mono">{syndicate}</span>
            {crewSize !== undefined && crewMax !== undefined && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <Users className="w-3.5 h-3.5" />
                <span>{crewSize}/{crewMax}</span>
              </div>
            )}
          </div>
          {playerId && (
            <div className="text-[10px] text-muted-foreground font-mono">
              ID: {playerId}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
