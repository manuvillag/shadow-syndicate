"use client"

import { GameLayout } from "@/components/game-layout"
import { CrewStatsCard } from "@/components/crew-stats-card"
import { CrewMemberCard } from "@/components/crew-member-card"
import { CrewMarketplaceCard } from "@/components/crew-marketplace-card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePlayer } from "@/hooks/use-player"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CrewMember {
  id: string
  name: string
  role: "Enforcer" | "Hacker" | "Smuggler"
  level: number
  attack: number
  defense: number
}

interface CrewTemplate {
  id: string
  name: string
  role: "Enforcer" | "Hacker" | "Smuggler"
  attack: number
  defense: number
  price: number
  level_requirement: number
  description?: string | null
  is_active: boolean
}

export default function CrewPage() {
  const router = useRouter()
  const { player, loading, error, refetch: refetchPlayer } = usePlayer()
  const { toast } = useToast()
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([])
  const [crewSize, setCrewSize] = useState<number | null>(null)
  const [crewMax, setCrewMax] = useState<number | null>(null)
  const [totalAttack, setTotalAttack] = useState<number>(0)
  const [totalDefense, setTotalDefense] = useState<number>(0)
  const [totalPower, setTotalPower] = useState<number>(0)
  const [loadingCrew, setLoadingCrew] = useState(true)
  const [marketplaceCrew, setMarketplaceCrew] = useState<CrewTemplate[]>([])
  const [loadingMarketplace, setLoadingMarketplace] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCrew() {
      try {
        const res = await fetch("/api/crew")
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to load crew")
        }

        setCrewMembers(data.crew || [])
        setCrewSize(data.stats?.crewSize ?? player?.crew_size ?? 0)
        setCrewMax(data.stats?.crewMax ?? player?.crew_max ?? 0)
        setTotalAttack(data.stats?.totalAttack ?? 0)
        setTotalDefense(data.stats?.totalDefense ?? 0)
        setTotalPower(data.stats?.totalPower ?? 0)
      } catch (err) {
        console.error("[Crew] Fetch error:", err)
        toast({
          title: "Error",
          description: "Failed to load crew members.",
          variant: "destructive",
        })
        setCrewMembers([])
      } finally {
        setLoadingCrew(false)
      }
    }

    if (player) {
      fetchCrew()
    }
  }, [player, toast])

  // Fetch marketplace crew
  useEffect(() => {
    async function fetchMarketplace() {
      try {
        const res = await fetch("/api/crew/marketplace")
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to load marketplace")
        }

        setMarketplaceCrew(data.available || [])
      } catch (err) {
        console.error("[Crew] Marketplace fetch error:", err)
        toast({
          title: "Error",
          description: "Failed to load crew marketplace.",
          variant: "destructive",
        })
        setMarketplaceCrew([])
      } finally {
        setLoadingMarketplace(false)
      }
    }

    if (player) {
      fetchMarketplace()
    }
  }, [player, toast])

  // Handle purchase
  const handlePurchase = async (templateId: string) => {
    if (purchasing) return

    setPurchasing(templateId)
    try {
      const res = await fetch("/api/crew/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to purchase crew member")
      }

      toast({
        title: "Crew purchased",
        description: `${data.crewMember.name} has joined your crew!`,
      })

      // Refresh both crew list and marketplace
      const crewRes = await fetch("/api/crew")
      if (crewRes.ok) {
        const crewData = await crewRes.json()
        setCrewMembers(crewData.crew || [])
        setCrewSize(crewData.stats?.crewSize ?? player?.crew_size ?? 0)
        setCrewMax(crewData.stats?.crewMax ?? player?.crew_max ?? 5)
        setTotalAttack(crewData.stats?.totalAttack ?? 0)
        setTotalDefense(crewData.stats?.totalDefense ?? 0)
        setTotalPower(crewData.stats?.totalPower ?? 0)
      }

      const marketRes = await fetch("/api/crew/marketplace")
      if (marketRes.ok) {
        const marketData = await marketRes.json()
        setMarketplaceCrew(marketData.available || [])
      }

      // Refresh player data to update credits
      refetchPlayer()
    } catch (error) {
      console.error("[Crew] Purchase error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase crew member",
        variant: "destructive",
      })
    } finally {
      setPurchasing(null)
    }
  }

  // Don't block on loading - show content progressively

  // Calculate next milestone (5, 10, 15, 20, 25, etc.)
  const currentCrewSize = crewSize ?? player?.crew_size ?? 0
  const milestones = [5, 10, 15, 20, 25, 30]
  const nextMilestone = milestones.find(m => m > currentCrewSize) || milestones[milestones.length - 1]
  const milestoneIndex = milestones.indexOf(nextMilestone)
  const nextBonus = milestoneIndex === 0 ? "+50 Base Power" :
                   milestoneIndex === 1 ? "+100 Base Power" :
                   milestoneIndex === 2 ? "+150 Base Power" :
                   milestoneIndex === 3 ? "+200 Base Power" :
                   milestoneIndex === 4 ? "+250 Base Power" :
                   "+300 Base Power"

  return (
    <GameLayout>

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="text-neon-cyan hover:text-neon-cyan/80 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Crew</h1>
            <p className="text-sm text-muted-foreground">Your syndicate members</p>
          </div>
        </div>
        {/* Crew Stats */}
        <CrewStatsCard
          crewSize={crewSize ?? player?.crew_size ?? 0}
          crewMax={crewMax ?? player?.crew_max ?? 5}
          totalAttack={totalAttack}
          totalDefense={totalDefense}
          totalPower={totalPower}
          nextMilestone={nextMilestone}
          nextBonus={nextBonus}
        />

        {/* Marketplace and Owned Crew Tabs */}
        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card border border-border">
            <TabsTrigger
              value="marketplace"
              className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
            >
              Marketplace
            </TabsTrigger>
            <TabsTrigger
              value="owned"
              className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple"
            >
              My Crew ({crewMembers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-3 mt-4">
            {loadingMarketplace ? (
              <div className="text-center py-8 text-muted-foreground text-xs">Loading marketplace...</div>
            ) : marketplaceCrew.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <p className="text-sm font-semibold text-foreground mb-1">No crew available</p>
                <p className="text-xs text-muted-foreground">
                  {crewSize && crewSize >= (crewMax ?? 5) 
                    ? "Crew capacity reached. Upgrade to recruit more." 
                    : "All available crew members have been purchased."}
                </p>
              </Card>
            ) : (
              marketplaceCrew.map((crew) => (
                <CrewMarketplaceCard
                  key={crew.id}
                  id={crew.id}
                  name={crew.name}
                  role={crew.role}
                  attack={crew.attack}
                  defense={crew.defense}
                  price={crew.price}
                  levelRequirement={crew.level_requirement}
                  description={crew.description}
                  playerLevel={player?.level || 0}
                  playerCredits={player?.credits || 0}
                  onPurchase={() => handlePurchase(crew.id)}
                  purchasing={purchasing === crew.id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="owned" className="space-y-3 mt-4">
            {crewMembers.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <p className="text-sm font-semibold text-foreground mb-1">No crew members yet</p>
                <p className="text-xs text-muted-foreground">Purchase crew members from the marketplace</p>
              </Card>
            ) : (
              crewMembers.map((member) => (
                <CrewMemberCard
                  key={member.id}
                  name={member.name}
                  role={member.role}
                  level={member.level}
                  attack={member.attack || 0}
                  defense={member.defense || 0}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

      </div>

    </GameLayout>
  )
}
