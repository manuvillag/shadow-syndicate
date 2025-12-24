"use client"

import { HudBar } from "@/components/hud-bar"
import { BottomNav } from "@/components/bottom-nav"
import { HudBarSkeleton } from "@/components/loading-skeletons"
import { usePlayer } from "@/hooks/use-player"
import { mapPlayerToHudData } from "@/lib/player-utils"
import { usePathname, useRouter } from "next/navigation"
import { ReactNode, useState, useEffect } from "react"

interface GameLayoutProps {
  children: ReactNode
  showHud?: boolean
  showBottomNav?: boolean
}

export function GameLayout({ 
  children, 
  showHud = true, 
  showBottomNav = true 
}: GameLayoutProps) {
  const { player, loading: playerLoading, isInitialLoad } = usePlayer()
  const pathname = usePathname()
  const router = useRouter()
  const [hudData, setHudData] = useState(() => {
    if (player) {
      return mapPlayerToHudData(player)
    }
    return {
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
  })
  const [lastPlayerData, setLastPlayerData] = useState(player)

  // Update HUD data when player changes
  useEffect(() => {
    if (!player) {
      setHudData({
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
      })
      setLastPlayerData(null)
      return
    }

    // Only update lastPlayerData if player data actually changed (not just a refresh)
    const playerChanged = 
      !lastPlayerData ||
      lastPlayerData.credits !== player.credits ||
      lastPlayerData.xp_current !== player.xp_current ||
      lastPlayerData.charge !== player.charge ||
      lastPlayerData.adrenal !== player.adrenal ||
      lastPlayerData.health !== player.health ||
      lastPlayerData.level !== player.level ||
      lastPlayerData.last_charge_regen !== player.last_charge_regen ||
      lastPlayerData.last_adrenal_regen !== player.last_adrenal_regen ||
      lastPlayerData.last_health_regen !== player.last_health_regen

    if (playerChanged) {
      setLastPlayerData({ ...player }) // Store a copy
      setHudData(mapPlayerToHudData(player))
    }
  }, [player])

  // Update timers every second for dynamic countdown (using stored player data)
  useEffect(() => {
    if (!lastPlayerData) return

    const interval = setInterval(() => {
      setHudData(mapPlayerToHudData(lastPlayerData))
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [lastPlayerData])

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname === "/") return "home"
    const path = pathname.split("/")[1]
    return path || "home"
  }

  const activeTab = getActiveTab()

  // Player data for HUD (use state for dynamic updates)
  const playerStats = hudData

  const handleTabChange = (tab: string) => {
    if (tab === "home") {
      router.push("/")
    } else {
      router.push(`/${tab}`)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HUD Bar - show skeleton only on initial load, not during polling */}
      {showHud && (
        isInitialLoad && playerLoading ? (
          <HudBarSkeleton />
        ) : player ? (
          <HudBar {...playerStats} />
        ) : (
          <HudBarSkeleton />
        )
      )}

      {/* Page Content - only this changes */}
      {children}

      {/* Bottom Navigation - always show */}
      {showBottomNav && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  )
}

