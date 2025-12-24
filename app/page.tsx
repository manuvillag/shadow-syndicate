"use client"

import { GameLayout } from "@/components/game-layout"
import { IdentityCard } from "@/components/identity-card"
import { ActionTile } from "@/components/action-tile"
import { FileText, Package, Swords, Radio, Building2, Users, Settings, Heart, Eye, UserPlus, UsersRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePlayer } from "@/hooks/use-player"
import { mapPlayerToHudData, formatPlayerId } from "@/lib/player-utils"
import { useEffect } from "react"

export default function Dashboard() {
  const router = useRouter()
  const { player, loading, error } = usePlayer()

  // Redirect to auth or setup if no player (must be called unconditionally)
  useEffect(() => {
    if (!loading) {
      if (error === 'Unauthorized') {
        router.push("/auth/signin")
      } else if (error || !player) {
        router.push("/setup")
      }
    }
  }, [loading, error, player, router])

  // Don't block on loading - redirect happens in useEffect
  // Show content progressively even if player is still loading

  // Map database fields to component props (with fallbacks)
  const playerData = player ? mapPlayerToHudData(player) : {
    credits: 0,
    alloy: 0,
    xpCurrent: 0,
    xpMax: 1000,
    charge: 0,
    chargeMax: 100,
    adrenal: 0,
    adrenalMax: 50,
    health: 100,
    healthMax: 100,
  }
  
  // Format player ID for display
  const playerId = player?.id ? formatPlayerId(player.id) : undefined

  const actions = [
    // Core Gameplay - Primary actions
    { label: "Contracts", icon: FileText, variant: "cyan" as const, href: "/contracts" },
    { label: "Skirmish", icon: Swords, variant: "purple" as const, href: "/skirmish" },
    { label: "Crew", icon: Users, variant: "default" as const, href: "/crew" },
    { label: "Outposts", icon: Building2, variant: "cyan" as const, href: "/outposts" },
    { label: "Loadout", icon: Package, variant: "default" as const, href: "/loadout" },
    // Social Features
    { label: "Friends", icon: UserPlus, variant: "default" as const, href: "/friends" },
    { label: "Syndicate", icon: UsersRound, variant: "purple" as const, href: "/syndicate" },
    // Utilities & Services
    { label: "Medbay", icon: Heart, variant: "purple" as const, href: "/medbay" },
    { label: "Overseer", icon: Eye, variant: "cyan" as const, href: "/overseer" },
    { label: "Comms", icon: Radio, variant: "default" as const, href: "/comms" },
    // Settings - Last
    { label: "Settings", icon: Settings, variant: "default" as const, href: "/settings" },
  ]

  return (
    <GameLayout>
      <div className="relative">
        {/* Content */}
        <div>
          {/* Identity Card - improved spacing */}
          {player && (
            <IdentityCard 
              handle={player.handle || 'OPERATOR'} 
              rank={player.rank || 'Initiate'} 
              syndicate={player.syndicate || 'Independent'}
              level={player.level}
              playerId={playerId}
              crewSize={player.crew_size}
              crewMax={player.crew_max}
            />
          )}

        {/* Action Grid - improved spacing */}
        <div className="px-3 pb-6">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-4 px-1">Operations</h3>
          <div className="grid grid-cols-3 gap-3">
            {actions.map((action, index) => (
              <ActionTile
                key={index}
                label={action.label}
                icon={action.icon}
                variant={action.variant}
                onClick={() => action.href !== "#" && router.push(action.href)}
                disabled={action.href === "#"}
              />
            ))}
          </div>
        </div>
      </div>
      </div>
    </GameLayout>
  )
}
