"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, TrendingUp, Package, CheckCircle2, XCircle, ArrowUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  outcome: "success" | "failure"
  rewards: {
    credits?: number
    xp?: number
    loot?: string
  }
  xpProgress?: {
    current: number
    max: number
    gained: number
    leveledUp?: boolean
    newLevel?: number
  }
  flavorText?: string
  onRunAnother?: () => void
  onBackToHome?: () => void
  primaryButtonText?: string
  secondaryButtonText?: string
}

export function ResultModal({
  open,
  onOpenChange,
  title = "Contract Complete",
  outcome,
  rewards,
  xpProgress,
  flavorText = "Transmission secured.",
  onRunAnother,
  onBackToHome,
  primaryButtonText = "Run Another",
  secondaryButtonText = "Back to Home",
}: ResultModalProps) {
  const isSuccess = outcome === "success"
  const xpPercentage = xpProgress ? (xpProgress.current / xpProgress.max) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-2 border-neon-cyan/50 neon-glow-cyan">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neon-cyan neon-text-cyan text-center">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Outcome Badge */}
          <div className="flex justify-center">
            {isSuccess ? (
              <Badge className="bg-success/20 text-success border-success/50 px-6 py-2 text-base font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Success
              </Badge>
            ) : (
              <Badge className="bg-destructive/20 text-destructive border-destructive/50 px-6 py-2 text-base font-bold uppercase tracking-wider">
                <XCircle className="w-5 h-5 mr-2" />
                Failed
              </Badge>
            )}
          </div>

          {/* Flavor Text */}
          {flavorText && <p className="text-center text-sm text-muted-foreground italic font-mono">{flavorText}</p>}

          {/* Rewards Section */}
          {isSuccess ? (
            <div className="bg-background/50 rounded-lg p-4 border border-border space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-mono">
                Rewards Acquired
              </h4>

              {rewards.credits !== undefined && rewards.credits > 0 && (
                <div className="flex items-center justify-between animate-in slide-in-from-left-5 duration-300">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-neon-orange" />
                    <span className="text-sm text-muted-foreground">Credits</span>
                  </div>
                  <span className="text-lg font-bold text-neon-orange font-mono">
                    +{rewards.credits.toLocaleString()}
                  </span>
                </div>
              )}

              {rewards.xp !== undefined && rewards.xp > 0 && (
                <div className="flex items-center justify-between animate-in slide-in-from-left-5 duration-500">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-neon-purple" />
                    <span className="text-sm text-muted-foreground">Experience</span>
                  </div>
                  <span className="text-lg font-bold text-neon-purple font-mono">+{rewards.xp.toLocaleString()}</span>
                </div>
              )}

              {rewards.loot && (
                <div className="flex items-center justify-between animate-in slide-in-from-left-5 duration-700">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-success" />
                    <span className="text-sm text-muted-foreground">Loot Drop</span>
                  </div>
                  <span className="text-lg font-bold text-success font-mono">{rewards.loot}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/30 space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-destructive mb-3 font-mono">
                Mission Failed
              </h4>

              {rewards.message && (
                <p className="text-sm text-foreground/80 mb-3">{rewards.message}</p>
              )}

              {rewards.creditsLost !== undefined && rewards.creditsLost > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-destructive" />
                    <span className="text-sm text-muted-foreground">Credits Lost</span>
                  </div>
                  <span className="text-lg font-bold text-destructive font-mono">
                    -{rewards.creditsLost.toLocaleString()}
                  </span>
                </div>
              )}

              {rewards.healthLost !== undefined && rewards.healthLost > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <span className="text-sm text-muted-foreground">Health Lost</span>
                  </div>
                  <span className="text-lg font-bold text-destructive font-mono">
                    -{rewards.healthLost} HP
                  </span>
                </div>
              )}

              {rewards.xp !== undefined && rewards.xp > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Experience (Reduced)</span>
                  </div>
                  <span className="text-lg font-bold text-muted-foreground font-mono">+{rewards.xp.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* XP Progress Section */}
          {xpProgress && isSuccess && (
            <div className="bg-background/50 rounded-lg p-4 border border-border space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  Experience Progress
                </h4>
                {xpProgress.leveledUp && (
                  <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/50 font-bold uppercase tracking-wider animate-pulse">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    Level Up!
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Progress value={xpPercentage} className="h-3 bg-secondary" />
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">
                    {xpProgress.current.toLocaleString()} / {xpProgress.max.toLocaleString()}
                  </span>
                  <span className="text-neon-purple font-bold">+{xpProgress.gained.toLocaleString()} XP</span>
                </div>
                {xpProgress.leveledUp && xpProgress.newLevel && (
                  <p className="text-center text-sm text-neon-purple font-bold animate-in zoom-in duration-500">
                    🎉 Now Level {xpProgress.newLevel}!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {onBackToHome && (
            <Button
              onClick={() => {
                onBackToHome()
                onOpenChange(false)
              }}
              variant="outline"
              className="border-border hover:bg-secondary"
            >
              {secondaryButtonText}
            </Button>
          )}
          {onRunAnother && isSuccess && (
            <Button
              onClick={() => {
                onRunAnother()
                onOpenChange(false)
              }}
              className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50 font-bold uppercase tracking-wider"
            >
              {primaryButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
