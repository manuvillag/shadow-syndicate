"use client"

import { HudBar } from "@/components/hud-bar"
import { IdentityCard } from "@/components/identity-card"
import { ActionTile } from "@/components/action-tile"
import { BottomNav } from "@/components/bottom-nav"
import { FileText, Package, Swords, Radio, Building2, Users, Settings, Heart, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { usePlayer } from "@/hooks/use-player"
import { mapPlayerToHudData } from "@/lib/player-utils"
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground font-mono">Loading...</div>
        </div>
      </div>
    )
  }

  // Show error or no player state - redirect to setup
  if (error || !player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground font-mono">Redirecting to setup...</div>
        </div>
      </div>
    )
  }

  // Map database fields to component props
  const playerData = {
    ...mapPlayerToHudData(player),
    handle: player.handle,
    rank: player.rank,
    syndicate: player.syndicate,
  }

  const actions = [
    { label: "Contracts", icon: FileText, variant: "cyan" as const, href: "/contracts" },
    { label: "Loadout", icon: Package, variant: "default" as const, href: "/loadout" },
    { label: "Skirmish", icon: Swords, variant: "purple" as const, href: "/skirmish" },
    { label: "Comms", icon: Radio, variant: "default" as const, href: "/comms" },
    { label: "Outposts", icon: Building2, variant: "cyan" as const, href: "/outposts" },
    { label: "Crew", icon: Users, variant: "default" as const, href: "/crew" },
    { label: "Settings", icon: Settings, variant: "default" as const, href: "/settings" },
    { label: "Medbay", icon: Heart, variant: "purple" as const, href: "/medbay" },
    { label: "Overseer", icon: Eye, variant: "cyan" as const, href: "/overseer" },
  ]

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <Image
          src="/.jpg?key=bg&height=800&width=400&query=dark space stars nebula purple blue cyberpunk subtle background"
          alt="Background"
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* HUD Bar */}
        <HudBar {...playerData} />

        {/* Identity Card */}
        <IdentityCard handle={playerData.handle} rank={playerData.rank} syndicate={playerData.syndicate} />

        {/* Action Grid */}
        <div className="px-3 pb-4">
          <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-mono mb-3">Operations</h3>
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

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" onTabChange={(tab) => router.push(tab === "home" ? "/" : `/${tab}`)} />
    </div>
  )
}
