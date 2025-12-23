"use client"

import { cn } from "@/lib/utils"

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
  variant?: "cyan" | "purple" | "orange" | "default"
}

export function FilterChip({ label, active, onClick, variant = "default" }: FilterChipProps) {
  const variantStyles = {
    cyan: active
      ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan neon-glow-cyan"
      : "border-neon-cyan/30 text-neon-cyan/60",
    purple: active
      ? "bg-neon-purple/20 border-neon-purple text-neon-purple neon-glow-purple"
      : "border-neon-purple/30 text-neon-purple/60",
    orange: active
      ? "bg-neon-orange/20 border-neon-orange text-neon-orange"
      : "border-neon-orange/30 text-neon-orange/60",
    default: active ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground",
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all duration-200 font-mono",
        "hover:scale-105 active:scale-95",
        variantStyles[variant],
      )}
    >
      {label}
    </button>
  )
}
