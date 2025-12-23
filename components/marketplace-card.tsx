"use client"

import { Building2, Award, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface MarketplaceCardProps {
  name: string
  type: string
  incomeRate: number
  price: number
  level: number
  requirements?: string
  locked?: boolean
  imageUrl?: string | null
  onPurchase: () => void
}

export function MarketplaceCard({
  name,
  type,
  incomeRate,
  price,
  level,
  requirements,
  locked = false,
  imageUrl,
  onPurchase,
}: MarketplaceCardProps) {
  return (
    <div
      className={cn(
        "relative bg-card/50 backdrop-blur-sm rounded-lg border border-border overflow-hidden transition-all",
        locked ? "opacity-60" : "hover:border-neon-purple/50",
      )}
    >
      {imageUrl ? (
        <div className="relative w-full h-36 sm:h-40 overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
          {locked && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <Lock className="w-8 h-8 text-red-500 mb-1" />
                <span className="text-xs font-mono text-red-500 uppercase">Locked</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-28 overflow-hidden bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20">
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
          {locked && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <Lock className="w-8 h-8 text-red-500 mb-1" />
                <span className="text-xs font-mono text-red-500 uppercase">Locked</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Corner accents */}
        {imageUrl && (
          <>
            <div className="absolute top-36 sm:top-40 left-0 w-3 h-3 border-l border-neon-purple/50" />
            <div className="absolute top-36 sm:top-40 right-0 w-3 h-3 border-r border-neon-purple/50" />
          </>
        )}
        {!imageUrl && (
          <>
            <div className="absolute top-28 left-0 w-3 h-3 border-l border-neon-purple/50" />
            <div className="absolute top-28 right-0 w-3 h-3 border-r border-neon-purple/50" />
          </>
        )}

        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-neon-purple" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-base leading-tight">{name}</h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{type}</p>
            {requirements && (
              <p className="text-xs text-orange-500 font-mono mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {requirements}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between p-2 rounded bg-background/50">
            <span className="text-xs font-mono text-muted-foreground">Base Income</span>
            <span className="text-sm font-mono text-foreground">{incomeRate.toLocaleString()}/hr</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-gradient-to-r from-neon-purple/10 to-transparent border border-neon-purple/30">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-neon-purple" />
              <span className="text-xs font-mono text-foreground">Price</span>
            </div>
            <span className="text-sm font-bold text-neon-purple">{price.toLocaleString()}</span>
          </div>
        </div>

        {/* Purchase Button */}
        <Button
          onClick={onPurchase}
          disabled={locked}
          className={cn(
            "w-full h-9 bg-gradient-to-r from-neon-purple to-neon-purple/80 hover:from-neon-purple hover:to-neon-purple text-white border border-neon-purple/50 font-mono text-xs uppercase tracking-wider",
            locked && "opacity-50 cursor-not-allowed",
          )}
        >
          {locked ? "Locked" : "Purchase"}
        </Button>
      </div>
    </div>
  )
}
