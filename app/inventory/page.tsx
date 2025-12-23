"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HudBar } from "@/components/hud-bar"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, ArrowLeft } from "lucide-react"
import { usePlayer } from "@/hooks/use-player"
import { mapPlayerToHudData } from "@/lib/player-utils"

interface InventoryItem {
  id: string
  quantity: number
  equipped: boolean
  slot: string | null
  item: {
    id: string
    name: string
    rarity: "common" | "rare" | "epic" | "legendary"
    type: "weapon" | "armor" | "gadget" | "consumable"
    attack_boost: number | null
    defense_boost: number | null
    special_boost: string | null
  } | null
}

export default function InventoryPage() {
  const router = useRouter()
  const { player, loading: playerLoading, error: playerError } = usePlayer()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch("/api/inventory")
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to load inventory")
        }

        setItems(data.items || [])
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load inventory"
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [])

  if (playerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground font-mono">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading operator...
        </div>
      </div>
    )
  }

  if (playerError || !player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive font-mono">{playerError || "Player not found"}</div>
        </div>
      </div>
    )
  }

  const hudStats = mapPlayerToHudData(player)

  return (
    <div className="min-h-screen bg-background pb-20">
      <HudBar {...hudStats} />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md border-b border-border px-3 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground uppercase tracking-wider font-mono">Inventory</h1>
            <p className="text-xs text-muted-foreground">All equipment and loot you own</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground font-mono">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading inventory...
          </div>
        )}

        {error && !loading && (
          <div className="text-destructive text-sm font-mono">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <Card className="p-4 border-dashed border-border bg-card/40">
            <p className="text-sm text-muted-foreground">
              No items yet. Win skirmishes or complete contracts to start filling your inventory.
            </p>
          </Card>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid gap-3">
            {items.map((row) => {
              const item = row.item
              if (!item) return null

              return (
                <Card
                  key={row.id}
                  className="p-4 flex items-start justify-between bg-card/60 border border-border/60"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-foreground">{item.name}</span>
                      <Badge
                        variant="outline"
                        className={
                          item.rarity === "legendary"
                            ? "border-neon-orange/60 text-neon-orange"
                            : item.rarity === "epic"
                            ? "border-neon-purple/60 text-neon-purple"
                            : item.rarity === "rare"
                            ? "border-neon-cyan/60 text-neon-cyan"
                            : "border-muted-foreground/40 text-muted-foreground"
                        }
                      >
                        {item.rarity}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground capitalize mb-1">
                      Type: {item.type}
                    </div>

                    <div className="text-xs space-y-1">
                      {item.attack_boost && item.attack_boost > 0 && (
                        <div className="text-destructive font-mono">+{item.attack_boost} ATK</div>
                      )}
                      {item.defense_boost && item.defense_boost > 0 && (
                        <div className="text-neon-cyan font-mono">+{item.defense_boost} DEF</div>
                      )}
                      {item.special_boost && (
                        <div className="text-neon-purple">{item.special_boost}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-xs text-muted-foreground font-mono">x{row.quantity}</div>
                    {row.equipped && (
                      <Badge className="bg-success/20 text-success border-success/40 text-[10px]">
                        Equipped
                      </Badge>
                    )}
                    {row.slot && (
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Slot: {row.slot}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav activeTab="home" onTabChange={(tab) => router.push(tab === "home" ? "/" : `/${tab}`)} />
    </div>
  )
}



