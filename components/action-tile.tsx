"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface ActionTileProps {
  label: string
  icon: LucideIcon
  onClick?: () => void
  variant?: "cyan" | "purple" | "default"
  disabled?: boolean
  className?: string
}

export function ActionTile({
  label,
  icon: Icon,
  onClick,
  variant = "default",
  disabled = false,
  className = "",
}: ActionTileProps) {
  const variantStyles = {
    cyan: "border-neon-cyan/30 hover:border-neon-cyan hover:bg-neon-cyan/10 text-neon-cyan",
    purple: "border-neon-purple/30 hover:border-neon-purple hover:bg-neon-purple/10 text-neon-purple",
    default: "border-border hover:border-neon-cyan/50 hover:bg-neon-cyan/5 text-foreground",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-card/50 backdrop-blur-sm transition-all duration-200",
        "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        !disabled && variantStyles[variant],
        className,
      )}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" />

      <Icon className="w-6 h-6" strokeWidth={1.5} />
      <span className="text-xs font-semibold uppercase tracking-wider font-mono text-center leading-tight">
        {label}
      </span>
    </button>
  )
}
