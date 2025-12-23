import type React from "react"
import { cn } from "@/lib/utils"

interface ResourceChipProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  variant?: "cyan" | "purple" | "orange" | "default"
  className?: string
}

export function ResourceChip({ label, value, icon, variant = "default", className }: ResourceChipProps) {
  const variantStyles = {
    cyan: "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan",
    purple: "border-neon-purple/50 bg-neon-purple/10 text-neon-purple",
    orange: "border-neon-orange/50 bg-neon-orange/10 text-neon-orange",
    default: "border-border bg-secondary text-foreground",
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded border backdrop-blur-sm",
        variantStyles[variant],
        className,
      )}
    >
      {icon && <span className="text-xs">{icon}</span>}
      <div className="flex flex-col items-start min-w-0">
        <span className="text-[10px] uppercase tracking-wider opacity-70 leading-none font-mono">{label}</span>
        <span className="text-xs font-semibold leading-none mt-0.5 font-mono">{value}</span>
      </div>
    </div>
  )
}
