"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Swords, Building2, Users, Radio, AlertCircle, Zap, Coins, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilterChip } from "@/components/filter-chip"
import { FeedItemCard } from "@/components/feed-item-card"
import { CommsEmptyState } from "@/components/comms-empty-state"
import { BottomNav } from "@/components/bottom-nav"

type FilterType = "all" | "crew" | "contracts" | "skirmish" | "outposts" | "system"

interface FeedItem {
  id: string
  icon: any
  eventType: string
  message: string
  rewards?: Array<{ type: "credits" | "xp" | "loot"; amount: number | string }>
  timestamp: string
  priority?: "normal" | "important"
  variant?: "cyan" | "purple" | "orange" | "default"
  category: FilterType
}

// Icon mapping
const iconMap: Record<string, any> = {
  FileText,
  Swords,
  Building2,
  Users,
  Radio,
  AlertCircle,
  Zap,
  Coins,
}

export default function CommsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [feedData, setFeedData] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch feed data from API
  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch('/api/comms/feed')
        if (!res.ok) throw new Error('Failed to fetch feed')
        const data = await res.json()
        
        // Map icon strings to icon components
        const feedWithIcons = (data.feed || []).map((item: any) => ({
          ...item,
          icon: iconMap[item.icon] || Radio,
        }))
        
        setFeedData(feedWithIcons)
      } catch (error) {
        console.error('[Comms] Error fetching feed:', error)
        setFeedData([])
      } finally {
        setLoading(false)
      }
    }
    fetchFeed()
  }, [])

  // Filter feed items based on active filter
  const filteredFeed = activeFilter === "all" 
    ? feedData 
    : feedData.filter((item) => item.category === activeFilter)

  const filters: Array<{ label: string; value: FilterType; variant?: "cyan" | "purple" | "orange" | "default" }> = [
    { label: "All", value: "all" },
    { label: "Crew", value: "crew" },
    { label: "Contracts", value: "contracts", variant: "cyan" },
    { label: "Skirmish", value: "skirmish", variant: "purple" },
    { label: "Outposts", value: "outposts", variant: "orange" },
    { label: "System", value: "system", variant: "cyan" },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-3 py-4">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 hover:bg-secondary"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-neon-cyan" />
            <h1 className="text-xl font-bold text-foreground">Comms</h1>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-3 pb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {filters.map((filter) => (
            <FilterChip
              key={filter.value}
              label={filter.label}
              active={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
              variant={filter.variant}
            />
          ))}
        </div>
      </div>

      {/* Feed Content */}
      <div className="px-3 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading feed...
            </div>
          </div>
        ) : filteredFeed.length > 0 ? (
          <div className="space-y-3">
            {filteredFeed.map((item) => (
              <FeedItemCard key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <CommsEmptyState />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" onTabChange={(tab) => router.push(tab === "home" ? "/" : `/${tab}`)} />
    </div>
  )
}
