"use client"

import { Building2, Coins, TrendingUp, Clock, ArrowUp, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface OutpostCardProps {
  id: string
  name: string
  type: string
  level: number
  incomeRate: number
  availableIncome: number
  upgradeAvailable: boolean
  imageUrl?: string | null
  specialFeatures?: {
    type: string
    value: number
    description: string
  } | null
  onCollect: () => void
  onUpgrade: () => void
}

interface UpgradePreview {
  currentLevel: number
  currentIncomeRate: number
  newLevel: number
  newIncomeRate: number
  incomeIncrease: number
  upgradeCost: number
  canAfford: boolean
  playerCredits: number
}

export function OutpostCard({
  id,
  name,
  type,
  level,
  incomeRate,
  availableIncome,
  upgradeAvailable,
  imageUrl,
  specialFeatures,
  onCollect,
  onUpgrade,
}: OutpostCardProps) {
  const [upgradePreview, setUpgradePreview] = useState<UpgradePreview | null>(null)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(false)

  // Fetch upgrade preview when upgrade button is hovered or clicked
  const fetchUpgradePreview = async () => {
    if (!upgradeAvailable || upgradePreview) return
    setLoadingPreview(true)
    try {
      const res = await fetch('/api/outposts/upgrade-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outpostId: id }),
      })
      if (res.ok) {
        const data = await res.json()
        setUpgradePreview(data)
      }
    } catch (error) {
      console.error('[OutpostCard] Failed to fetch upgrade preview:', error)
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleUpgradeClick = () => {
    if (!upgradePreview) {
      fetchUpgradePreview().then(() => setShowUpgradeDialog(true))
    } else {
      setShowUpgradeDialog(true)
    }
  }

  const handleConfirmUpgrade = () => {
    setShowUpgradeDialog(false)
    onUpgrade()
  }

  return (
    <div className="relative bg-card/50 backdrop-blur-sm rounded-lg border border-border overflow-hidden transition-all hover:border-neon-cyan/50">
      {imageUrl && (
        <div className="relative w-full h-36 sm:h-40 overflow-hidden">
          <Image src={imageUrl} alt={name} fill className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* Level Badge overlay */}
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-neon-cyan/20 backdrop-blur-sm border border-neon-cyan/50">
            <span className="text-xs font-mono font-bold text-neon-cyan">LVL {level}</span>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-neon-cyan" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-base leading-tight">{name}</h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{type}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-neon-cyan" />
                <span className="text-xs font-mono text-neon-cyan">Level {level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Income Info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between p-2 rounded bg-background/50">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">Income Rate</span>
            </div>
            <span className="text-sm font-mono text-foreground">{incomeRate.toLocaleString()}/hr</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-gradient-to-r from-neon-cyan/10 to-transparent border border-neon-cyan/30">
            <div className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-neon-cyan" />
              <span className="text-xs font-mono text-foreground">Available</span>
            </div>
            <span className="text-sm font-bold text-neon-cyan">{availableIncome.toLocaleString()}</span>
          </div>
          {specialFeatures && (
            <div className="p-2 rounded bg-gradient-to-r from-neon-purple/10 to-transparent border border-neon-purple/30">
              <div className="flex items-start gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-neon-purple mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-mono text-neon-purple font-semibold">Special:</span>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{specialFeatures.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={onCollect}
            disabled={availableIncome === 0}
            className={cn(
              "flex-1 h-9 bg-gradient-to-r from-neon-cyan to-neon-cyan/80 hover:from-neon-cyan hover:to-neon-cyan text-black border border-neon-cyan/50 font-mono text-xs uppercase tracking-wider",
              availableIncome === 0 && "opacity-50 cursor-not-allowed",
            )}
          >
            Collect
          </Button>
          {upgradeAvailable && (
            <Button
              onClick={handleUpgradeClick}
              onMouseEnter={fetchUpgradePreview}
              variant="outline"
              disabled={loadingPreview}
              className={cn(
                "flex-1 h-9 border-neon-purple/50 hover:bg-neon-purple/10 text-neon-purple font-mono text-xs uppercase tracking-wider bg-transparent",
                upgradePreview && !upgradePreview.canAfford && "opacity-50 cursor-not-allowed"
              )}
            >
              {loadingPreview ? "..." : upgradePreview ? `Upgrade (${upgradePreview.upgradeCost.toLocaleString()})` : "Upgrade"}
            </Button>
          )}
        </div>

        {/* Upgrade Preview Tooltip */}
        {upgradePreview && upgradeAvailable && (
          <div className="mt-2 p-2 rounded bg-background/80 border border-neon-purple/30 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-muted-foreground">Upgrade Preview:</span>
              <span className={cn(
                "font-mono font-bold",
                upgradePreview.canAfford ? "text-neon-purple" : "text-red-500"
              )}>
                {upgradePreview.canAfford ? "Affordable" : "Insufficient Credits"}
              </span>
            </div>
            <div className="space-y-1 text-muted-foreground font-mono">
              <div className="flex items-center justify-between">
                <span>Level:</span>
                <span className="text-foreground">{upgradePreview.currentLevel} → {upgradePreview.newLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Income:</span>
                <span className="text-foreground">
                  {upgradePreview.currentIncomeRate.toLocaleString()}/hr → {upgradePreview.newIncomeRate.toLocaleString()}/hr
                  <span className="text-neon-cyan ml-1">(+{upgradePreview.incomeIncrease}/hr)</span>
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <span>Cost:</span>
                <span className={cn(
                  "font-bold",
                  upgradePreview.canAfford ? "text-neon-purple" : "text-red-500"
                )}>
                  {upgradePreview.upgradeCost.toLocaleString()} credits
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase">Confirm Upgrade</DialogTitle>
            <DialogDescription className="font-mono text-sm">
              Upgrade {name} to level {upgradePreview?.newLevel}
            </DialogDescription>
          </DialogHeader>

          {upgradePreview && (
            <div className="space-y-3 py-4">
              <div className="p-3 rounded bg-background/50 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-muted-foreground">Current Level</span>
                  <span className="text-sm font-mono font-bold text-foreground">{upgradePreview.currentLevel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-muted-foreground">New Level</span>
                  <span className="text-sm font-mono font-bold text-neon-purple">{upgradePreview.newLevel}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-muted-foreground">Current Income</span>
                  <span className="text-sm font-mono text-foreground">{upgradePreview.currentIncomeRate.toLocaleString()}/hr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-muted-foreground">New Income</span>
                  <span className="text-sm font-mono font-bold text-neon-cyan">
                    {upgradePreview.newIncomeRate.toLocaleString()}/hr
                    <span className="text-xs ml-1 text-green-500">(+{upgradePreview.incomeIncrease}/hr)</span>
                  </span>
                </div>
              </div>

              <div className="p-3 rounded bg-gradient-to-r from-neon-purple/10 to-transparent border border-neon-purple/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-semibold">Upgrade Cost</span>
                  <span className={cn(
                    "text-lg font-mono font-bold",
                    upgradePreview.canAfford ? "text-neon-purple" : "text-red-500"
                  )}>
                    {upgradePreview.upgradeCost.toLocaleString()} credits
                  </span>
                </div>
                {!upgradePreview.canAfford && (
                  <p className="text-xs text-red-500 font-mono mt-1">
                    You need {upgradePreview.upgradeCost - upgradePreview.playerCredits} more credits
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
              className="font-mono text-xs uppercase"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpgrade}
              disabled={!upgradePreview?.canAfford}
              className="bg-gradient-to-r from-neon-purple to-neon-purple/80 hover:from-neon-purple hover:to-neon-purple text-white border border-neon-purple/50 font-mono text-xs uppercase tracking-wider"
            >
              Confirm Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
