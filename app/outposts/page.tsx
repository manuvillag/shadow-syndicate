"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { HudBar } from "@/components/hud-bar"
import { BottomNav } from "@/components/bottom-nav"
import { OutpostCard } from "@/components/outpost-card"
import { MarketplaceCard } from "@/components/marketplace-card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { usePlayer } from "@/hooks/use-player"
import { mapPlayerToHudData } from "@/lib/player-utils"
import { PageLoadingSkeleton, OutpostCardSkeleton, CardGridSkeleton } from "@/components/loading-skeletons"
import { ErrorPage } from "@/components/error-display"
import { parseApiError } from "@/lib/api-error-handler"

export default function OutpostsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { player, loading: playerLoading, error: playerError, refetch: refetchPlayer } = usePlayer()
  const [activeTab, setActiveTab] = useState<"owned" | "marketplace">("owned")
  const [ownedOutposts, setOwnedOutposts] = useState<any[]>([])
  const [marketplaceOutposts, setMarketplaceOutposts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch owned outposts
  useEffect(() => {
    async function fetchOwnedOutposts() {
      try {
        const res = await fetch('/api/outposts')
        if (!res.ok) {
          const error = await parseApiError(res)
          throw new Error(error.error)
        }
        const data = await res.json()
        setOwnedOutposts(data.outposts || [])
      } catch (error) {
        console.error('[Outposts] Error fetching owned outposts:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load outposts",
          variant: "destructive",
        })
      }
    }

    if (player) {
      fetchOwnedOutposts()
      setLoading(false)
    }
  }, [player, toast])

  // Fetch marketplace outposts
  useEffect(() => {
    async function fetchMarketplace() {
      try {
        const res = await fetch('/api/outposts/purchase')
        if (!res.ok) throw new Error('Failed to fetch marketplace')
        const data = await res.json()
        setMarketplaceOutposts(data.outposts || [])
      } catch (error) {
        console.error('[Outposts] Error fetching marketplace:', error)
      }
    }

    if (player && activeTab === 'marketplace') {
      fetchMarketplace()
    }
  }, [player, activeTab])

  const handleCollect = async (outpostId: string) => {
    if (actionLoading) return
    setActionLoading(outpostId)
    try {
      const res = await fetch('/api/outposts/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outpostId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to collect income')
      }

      const data = await res.json()
      
      // Refresh outposts and player data
      const outpostsRes = await fetch('/api/outposts')
      if (outpostsRes.ok) {
        const outpostsData = await outpostsRes.json()
        setOwnedOutposts(outpostsData.outposts || [])
      }
      refetchPlayer()

      toast({
        title: "Income Collected",
        description: `+${data.incomeCollected.toLocaleString()} credits`,
      })
    } catch (error) {
      console.error('[Outposts] Collect error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to collect income",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpgrade = async (outpostId: string) => {
    if (actionLoading) return
    setActionLoading(outpostId)
    try {
      const res = await fetch('/api/outposts/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outpostId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to upgrade outpost')
      }

      const data = await res.json()
      
      // Refresh outposts and player data
      const outpostsRes = await fetch('/api/outposts')
      if (outpostsRes.ok) {
        const outpostsData = await outpostsRes.json()
        setOwnedOutposts(outpostsData.outposts || [])
      }
      refetchPlayer()

      toast({
        title: "Upgrade Complete",
        description: `Outpost upgraded to level ${data.newLevel}`,
      })
    } catch (error) {
      console.error('[Outposts] Upgrade error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upgrade outpost",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handlePurchase = async (marketplaceId: string) => {
    if (actionLoading) return
    setActionLoading(marketplaceId)
    try {
      const res = await fetch('/api/outposts/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketplaceId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to purchase outpost')
      }

      const data = await res.json()
      
      // Refresh outposts and player data
      const outpostsRes = await fetch('/api/outposts')
      if (outpostsRes.ok) {
        const outpostsData = await outpostsRes.json()
        setOwnedOutposts(outpostsData.outposts || [])
      }
      
      // Refresh marketplace
      const marketplaceRes = await fetch('/api/outposts/purchase')
      if (marketplaceRes.ok) {
        const marketplaceData = await marketplaceRes.json()
        setMarketplaceOutposts(marketplaceData.outposts || [])
      }
      
      refetchPlayer()

      toast({
        title: "Purchase Successful",
        description: `${data.outpost.name} added to your empire`,
      })
      
      // Switch to owned tab to show new outpost
      setActiveTab('owned')
    } catch (error) {
      console.error('[Outposts] Purchase error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase outpost",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Show loading state
  if (playerLoading || loading) {
    return <PageLoadingSkeleton />
  }

  // Show error state
  if (playerError || !player) {
    return <ErrorPage error={playerError || "Player not found"} onRetry={() => window.location.reload()} />
  }

  const playerData = mapPlayerToHudData(player)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HUD Bar */}
      <HudBar {...playerData} />

      {/* Header */}
      <div className="px-3 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.push("/")}
            className="w-8 h-8 rounded-lg border border-border hover:border-neon-cyan/50 hover:bg-neon-cyan/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground font-mono uppercase tracking-wider">Outposts</h1>
            <p className="text-xs text-muted-foreground font-mono">Manage your syndicate properties</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("owned")}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-mono text-xs uppercase tracking-wider transition-colors border",
              activeTab === "owned"
                ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan"
                : "bg-card/30 border-border text-muted-foreground hover:border-neon-cyan/30",
            )}
          >
            Owned ({ownedOutposts.length})
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-mono text-xs uppercase tracking-wider transition-colors border",
              activeTab === "marketplace"
                ? "bg-neon-purple/20 border-neon-purple text-neon-purple"
                : "bg-card/30 border-border text-muted-foreground hover:border-neon-purple/30",
            )}
          >
            Marketplace
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-4 space-y-3">
        {activeTab === "owned" ? (
          <>
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono mb-1">Your Properties</h2>
            {ownedOutposts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No outposts owned yet</p>
                <p className="text-xs mt-1">Visit the Marketplace to purchase your first outpost</p>
              </div>
            ) : (
              ownedOutposts.map((outpost) => (
                <OutpostCard
                  key={outpost.id}
                  id={outpost.id}
                  name={outpost.name}
                  type={outpost.type}
                  level={outpost.level}
                  incomeRate={outpost.incomeRate}
                  availableIncome={outpost.availableIncome}
                  upgradeAvailable={outpost.upgradeAvailable}
                  imageUrl={outpost.imageUrl}
                  specialFeatures={outpost.specialFeatures}
                  onCollect={() => handleCollect(outpost.id)}
                  onUpgrade={() => handleUpgrade(outpost.id)}
                />
              ))
            )}
          </>
        ) : (
          <>
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono mb-1">
              Available Outposts
            </h2>
            {marketplaceOutposts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Loading marketplace...</div>
            ) : (
              marketplaceOutposts.map((outpost) => (
                <MarketplaceCard
                  key={outpost.id}
                  name={outpost.name}
                  type={outpost.type}
                  incomeRate={outpost.incomeRate}
                  price={outpost.price}
                  level={outpost.level}
                  requirements={outpost.requirements}
                  locked={outpost.locked}
                  imageUrl={outpost.imageUrl}
                  onPurchase={() => handlePurchase(outpost.id)}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" onTabChange={(tab) => router.push(tab === "home" ? "/" : `/${tab}`)} />
    </div>
  )
}
