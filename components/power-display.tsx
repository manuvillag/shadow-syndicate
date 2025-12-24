"use client"

import { Card } from "@/components/ui/card"
import { Sword, Shield, Users, Zap, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface PowerDisplayProps {
  totalPower: number
  breakdown?: {
    basePower: number
    crewPower: number
    equipmentPower: number
    crewAttack: number
    crewDefense: number
    equipmentAttack: number
    equipmentDefense: number
  }
  playerLevel?: number
  className?: string
}

export function PowerDisplay({ 
  totalPower, 
  breakdown, 
  playerLevel,
  className 
}: PowerDisplayProps) {
  if (!breakdown) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-xs font-mono font-bold text-foreground bg-neon-cyan/10 border border-neon-cyan/30 px-2 py-1 rounded">
          Power: {totalPower}
        </span>
      </div>
    )
  }

  return (
    <Card className={cn("p-3 bg-card/50 border border-neon-cyan/30", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm font-bold text-foreground font-mono">Total Power: {totalPower}</span>
        </div>
      </div>
      
      <div className="space-y-2 text-xs">
        {/* Base Power */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-neon-purple/50" />
            <span>Base (L{playerLevel || 0} × 50)</span>
          </div>
          <span className="font-mono font-semibold text-foreground">{breakdown.basePower}</span>
        </div>

        {/* Crew Power */}
        {breakdown.crewPower > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-3 h-3 text-neon-cyan" />
              <span>Crew</span>
            </div>
            <div className="flex items-center gap-2">
              {breakdown.crewAttack > 0 && (
                <span className="font-mono text-destructive">+{breakdown.crewAttack} ATK</span>
              )}
              {breakdown.crewDefense > 0 && (
                <span className="font-mono text-neon-cyan">+{breakdown.crewDefense} DEF</span>
              )}
              <span className="font-mono font-semibold text-foreground">= {breakdown.crewPower}</span>
            </div>
          </div>
        )}

        {/* Equipment Power */}
        {breakdown.equipmentPower > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sword className="w-3 h-3 text-neon-purple" />
              <span>Equipment</span>
            </div>
            <div className="flex items-center gap-2">
              {breakdown.equipmentAttack > 0 && (
                <span className="font-mono text-destructive">+{breakdown.equipmentAttack} ATK</span>
              )}
              {breakdown.equipmentDefense > 0 && (
                <span className="font-mono text-neon-cyan">+{breakdown.equipmentDefense} DEF</span>
              )}
              <span className="font-mono font-semibold text-foreground">= {breakdown.equipmentPower}</span>
            </div>
          </div>
        )}

        {/* Show message if no crew/equipment */}
        {breakdown.crewPower === 0 && breakdown.equipmentPower === 0 && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
            <Info className="w-3 h-3" />
            <span>Recruit crew and equip items to increase power</span>
          </div>
        )}
      </div>
    </Card>
  )
}

