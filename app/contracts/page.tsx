"use client"

import { useState, useEffect } from "react"
import { HudBar } from "@/components/hud-bar"
import { FilterChip } from "@/components/filter-chip"
import { ContractCard } from "@/components/contract-card"
import { ContractConfirmationModal } from "@/components/contract-confirmation-modal"
import { ResultModal } from "@/components/result-modal"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePlayer } from "@/hooks/use-player"
import { mapPlayerToHudData } from "@/lib/player-utils"
import { PageLoadingSkeleton, ContractCardSkeleton } from "@/components/loading-skeletons"
import { ErrorPage } from "@/components/error-display"
import { parseApiError } from "@/lib/api-error-handler"

type DifficultyFilter = "all" | "easy" | "risky" | "elite" | "event"

interface Contract {
  id: string
  name: string
  description: string
  energy_cost: number
  credits_reward: number
  xp_reward: number
  loot_chance: number
  difficulty: "easy" | "risky" | "elite" | "event"
  level_requirement?: number
}

export default function ContractsPage() {
  const [filter, setFilter] = useState<DifficultyFilter>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()
  const { player, loading: playerLoading, error: playerError, refetch: refetchPlayer } = usePlayer()

  // Fetch contracts from API
  useEffect(() => {
    async function fetchContracts() {
      try {
        const response = await fetch("/api/contracts")
        if (!response.ok) {
          const error = await parseApiError(response)
          console.error("[Contracts] API Error:", error)
          setContracts([])
          return
        }
        const data = await response.json()
        if (data.contracts) {
          setContracts(data.contracts)
        }
      } catch (error) {
        console.error("[Contracts] Error fetching contracts:", error)
        setContracts([])
      } finally {
        setLoading(false)
      }
    }
    fetchContracts()
  }, [])

  // Show loading state
  if (playerLoading || loading) {
    return <PageLoadingSkeleton />
  }

  // Show error state
  if (playerError || !player) {
    return <ErrorPage error={playerError || "Player not found"} onRetry={() => window.location.reload()} />
  }

  // Map database fields to component props
  const playerStats = mapPlayerToHudData(player)

  // Map contracts to component format
  const mappedContracts = contracts.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    energyCost: c.energy_cost,
    creditsReward: c.credits_reward,
    xpReward: c.xp_reward,
    lootChance: c.loot_chance,
    difficulty: c.difficulty,
    levelRequirement: c.level_requirement || (c.difficulty === 'easy' ? 1 : c.difficulty === 'risky' ? 5 : c.difficulty === 'elite' ? 15 : 10),
  }))

  const filteredContracts = filter === "all" ? mappedContracts : mappedContracts.filter((c) => c.difficulty === filter)

  const handleRunContract = (contract: typeof mappedContracts[0]) => {
    setSelectedContract(contract as any)
    setModalOpen(true)
  }

  const handleConfirmContract = async () => {
    if (!selectedContract) return

    setExecuting(true)
    setModalOpen(false)

    try {
      const response = await fetch("/api/contracts/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: selectedContract.id }),
      })

      const data = await response.json()

      if (data.error) {
        alert(data.error)
        setExecuting(false)
        return
      }

      setResult(data)
      setResultModalOpen(true)
      refetchPlayer() // Refresh player data
    } catch (error) {
      console.error("[Contracts] Error executing contract:", error)
      alert("Failed to execute contract")
    } finally {
      setExecuting(false)
    }
  }

  const handleRunAnother = () => {
    setResultModalOpen(false)
    setSelectedContract(null)
    setResult(null)
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <HudBar {...playerStats} />

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="text-neon-cyan hover:text-neon-cyan/80 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contracts</h1>
            <p className="text-sm text-muted-foreground">Select a mission to deploy</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} variant="default" />
          <FilterChip label="Easy" active={filter === "easy"} onClick={() => setFilter("easy")} variant="cyan" />
          <FilterChip label="Risky" active={filter === "risky"} onClick={() => setFilter("risky")} variant="orange" />
          <FilterChip label="Elite" active={filter === "elite"} onClick={() => setFilter("elite")} variant="purple" />
          <FilterChip label="Event" active={filter === "event"} onClick={() => setFilter("event")} variant="purple" />
        </div>

        {/* Contracts Grid */}
        {filteredContracts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No contracts available</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredContracts.map((contract) => (
              <ContractCard 
                key={contract.id} 
                {...contract} 
                playerLevel={player?.level || 1}
                onRunContract={() => handleRunContract(contract)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedContract && (
        <ContractConfirmationModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          contractName={selectedContract.name}
          energyCost={selectedContract.energyCost}
          creditsReward={selectedContract.creditsReward}
          xpReward={selectedContract.xpReward}
          lootChance={selectedContract.lootChance}
          currentCharge={playerStats.charge}
          onConfirm={handleConfirmContract}
        />
      )}

      {/* Result Modal */}
      {result && (
        <ResultModal
          open={resultModalOpen}
          onOpenChange={setResultModalOpen}
          title={result.success ? "Contract Complete" : "Contract Failed"}
          outcome={result.success ? "success" : "failure"}
          rewards={result.rewards || {}}
          xpProgress={result.xpProgress}
          flavorText={result.success 
            ? "Mission completed successfully. Transmission secured." 
            : "Mission failed. The operation was compromised."}
          onRunAnother={result.success ? handleRunAnother : undefined}
          onBackToHome={handleBackToHome}
        />
      )}

      {/* Bottom Nav */}
      <BottomNav activeTab="contracts" onTabChange={(tab) => router.push(tab === "home" ? "/" : `/${tab}`)} />
    </div>
  )
}
