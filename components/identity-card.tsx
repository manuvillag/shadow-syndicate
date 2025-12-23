import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, UserPlus } from "lucide-react"
import Image from "next/image"

interface IdentityCardProps {
  handle: string
  rank: string
  syndicate: string
}

export function IdentityCard({ handle, rank, syndicate }: IdentityCardProps) {
  return (
    <div className="relative mx-3 my-4 p-4 bg-card border border-border rounded-lg overflow-hidden">
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

      <div className="relative flex items-center gap-4">
        {/* Player avatar image */}
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16 rounded-lg border-2 border-neon-purple/50 bg-neon-purple/10 overflow-hidden neon-glow-purple">
            <Image src="/futuristic-space-crime-syndicate-operator-portrait.jpg" alt="Player Avatar" fill className="object-cover" />
            <div className="absolute inset-0 bg-neon-purple/20" />
          </div>
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground font-mono truncate neon-text-cyan">{handle}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs font-mono border-neon-purple/30">
              {rank}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">• {syndicate}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="relative grid grid-cols-2 gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          className="border-neon-purple/50 hover:bg-neon-purple/20 hover:border-neon-purple text-neon-purple font-mono bg-transparent"
        >
          <Crown className="w-3.5 h-3.5 mr-1.5" />
          Upgrade
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-neon-cyan/50 hover:bg-neon-cyan/20 hover:border-neon-cyan text-neon-cyan font-mono bg-transparent"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          Recruit
        </Button>
      </div>
    </div>
  )
}
