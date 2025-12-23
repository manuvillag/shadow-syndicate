"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Zap, Coins, TrendingUp, Package, AlertTriangle } from "lucide-react"

interface ContractConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contractName: string
  energyCost: number
  creditsReward: number
  xpReward: number
  lootChance: number
  currentCharge: number
  onConfirm: () => void
}

export function ContractConfirmationModal({
  open,
  onOpenChange,
  contractName,
  energyCost,
  creditsReward,
  xpReward,
  lootChance,
  currentCharge,
  onConfirm,
}: ContractConfirmationModalProps) {
  const hasEnoughEnergy = currentCharge >= energyCost

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-2 border-neon-cyan/50 neon-glow-cyan">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-neon-cyan neon-text-cyan">Deploy Contract</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Confirm mission parameters for <span className="text-foreground font-semibold">{contractName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Energy Cost Warning */}
          {!hasEnoughEnergy && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/50 rounded">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="text-sm text-destructive font-semibold">Insufficient Charge</span>
            </div>
          )}

          {/* Cost Section */}
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-mono">Cost</h4>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-cyan" />
              <span className="text-lg font-bold text-neon-cyan font-mono">{energyCost} Charge</span>
              <span className="text-sm text-muted-foreground ml-auto font-mono">({currentCharge} available)</span>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-mono">Projected Rewards</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-neon-orange" />
                  <span className="text-sm text-muted-foreground">Credits</span>
                </div>
                <span className="text-base font-bold text-neon-orange font-mono">
                  +{creditsReward.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-neon-purple" />
                  <span className="text-sm text-muted-foreground">Experience</span>
                </div>
                <span className="text-base font-bold text-neon-purple font-mono">+{xpReward.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">Loot Chance</span>
                </div>
                <span className="text-base font-bold text-success font-mono">{lootChance}%</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="border-border hover:bg-secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            disabled={!hasEnoughEnergy}
            className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50 font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deploy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
