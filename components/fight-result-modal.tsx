"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trophy, Skull, Award, Zap, Heart, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface FightResultModalProps {
  open: boolean
  onClose: () => void
  result: {
    outcome: "win" | "lose"
    damageDealt: number
    damageTaken: number
    creditsEarned: number
    xpGained: number
    streak: number
    loot?: string
    xpProgress?: {
      current: number
      max: number
      gained: number
      leveledUp: boolean
      newLevel?: number
    }
    newHealth?: number
  }
}

export function FightResultModal({ open, onClose, result }: FightResultModalProps) {
  const isWin = result.outcome === "win"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-card/95 backdrop-blur-md border-2 border-neon-purple/50 p-0 gap-0">
        <DialogTitle className="sr-only">
          {isWin ? "Victory" : "Defeated"} - Combat Result
        </DialogTitle>
        {/* Header */}
        <div
          className={cn(
            "relative p-6 border-b",
            isWin
              ? "bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border-neon-cyan/30"
              : "bg-red-950/20 border-red-500/30",
          )}
        >
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-current opacity-50" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-current opacity-50" />

          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center border-2",
                isWin ? "bg-neon-cyan/20 border-neon-cyan" : "bg-red-500/20 border-red-500",
              )}
            >
              {isWin ? <Trophy className="w-8 h-8 text-neon-cyan" /> : <Skull className="w-8 h-8 text-red-500" />}
            </div>
            <div className="text-center">
              <h2
                className={cn(
                  "text-2xl font-bold uppercase tracking-wider font-mono",
                  isWin ? "text-neon-cyan" : "text-red-500",
                )}
              >
                {isWin ? "Victory" : "Defeated"}
              </h2>
              {result.streak > 1 && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-mono text-orange-500">{result.streak} Win Streak</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Battle Summary */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Battle Summary</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-background/50">
                <span className="text-xs font-mono text-muted-foreground">Damage Dealt</span>
                <span className="text-sm font-mono text-neon-cyan">{result.damageDealt}</span>
              </div>
              {!isWin && (
                <div className="flex items-center justify-between p-2 rounded bg-red-500/10 border border-red-500/30">
                  <span className="text-xs font-mono text-muted-foreground">Health Lost</span>
                  <span className="text-sm font-mono text-red-500">-{result.damageTaken}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rewards */}
          {isWin && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Rewards</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-gradient-to-r from-neon-cyan/10 to-transparent border border-neon-cyan/30">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-neon-cyan" />
                    <span className="text-xs font-mono text-foreground">Credits</span>
                  </div>
                  <span className="text-sm font-bold text-neon-cyan">+{result.creditsEarned.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-mono text-foreground">Experience</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-500">+{result.xpGained} XP</span>
                </div>
                {result.loot && (
                  <div className="flex items-center justify-between p-2 rounded bg-gradient-to-r from-neon-purple/10 to-transparent border border-neon-purple/30">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-neon-purple" />
                      <span className="text-xs font-mono text-foreground">Loot Drop</span>
                    </div>
                    <span className="text-sm font-bold text-neon-purple">{result.loot}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Level Up Notification */}
          {result.xpProgress?.leveledUp && (
            <div className="p-3 rounded bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="text-sm font-bold text-yellow-500">Level Up!</div>
                  <div className="text-xs text-muted-foreground">You reached level {result.xpProgress.newLevel}</div>
                </div>
              </div>
            </div>
          )}

          {/* Health Warning */}
          {result.newHealth !== undefined && result.newHealth < 50 && (
            <div className="p-3 rounded bg-red-500/20 border border-red-500/30">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-sm font-bold text-red-500">Low Health!</div>
                  <div className="text-xs text-muted-foreground">Visit Medbay to recover</div>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-purple/90 hover:to-neon-cyan/90 text-white border border-neon-purple/50 font-mono uppercase tracking-wider"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
