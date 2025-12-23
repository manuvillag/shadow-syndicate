"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Clock, Zap } from "lucide-react"
import { useState } from "react"

interface LimitedOfferCardProps {
  title: string
  description: string
  originalPrice?: number
  discountedPrice: number
  discount?: number
  timeRemaining: string
  featured?: boolean
}

export function LimitedOfferCard({
  title,
  description,
  originalPrice,
  discountedPrice,
  discount,
  timeRemaining,
  featured = false,
}: LimitedOfferCardProps) {
  const [purchased, setPurchased] = useState(false)

  const handlePurchase = () => {
    setPurchased(true)
  }

  return (
    <Card className={`border ${featured ? "border-warning/50 bg-warning/5" : "border-border/50"} transition-all`}>
      <div className="p-4">
        {featured && (
          <div className="flex items-center gap-1 mb-2">
            <Sparkles className="w-3 h-3 text-warning" />
            <span className="text-[10px] uppercase tracking-wider text-warning font-bold">Featured Deal</span>
          </div>
        )}

        <h4 className="text-sm font-semibold mb-1 text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mb-3">{description}</p>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-3">
          {originalPrice && <span className="text-xs text-muted-foreground line-through">{originalPrice} Alloy</span>}
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-lg font-bold text-warning">{discountedPrice}</span>
            <span className="text-xs text-muted-foreground">Alloy</span>
          </div>
          {discount && (
            <span className="px-1.5 py-0.5 bg-destructive/20 text-destructive text-[10px] font-bold rounded uppercase">
              -{discount}%
            </span>
          )}
        </div>

        {/* Time remaining */}
        <div className="flex items-center gap-1 mb-3 text-xs text-warning">
          <Clock className="w-3 h-3" />
          <span className="font-mono">Ends in {timeRemaining}</span>
        </div>

        {/* Purchase button */}
        {!purchased ? (
          <Button
            onClick={handlePurchase}
            className={`w-full ${
              featured ? "bg-warning hover:bg-warning/90 text-warning-foreground" : "bg-primary hover:bg-primary/90"
            }`}
            size="sm"
          >
            Purchase Now
          </Button>
        ) : (
          <div className="text-center text-xs text-success font-semibold">Purchased</div>
        )}
      </div>
    </Card>
  )
}
