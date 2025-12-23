"use client"

import { Home, FileText, Swords, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function BottomNav({ activeTab = "home", onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "contracts", label: "Contracts", icon: FileText },
    { id: "skirmish", label: "Skirmish", icon: Swords },
    { id: "crew", label: "Crew", icon: Users },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50">
      <div className="grid grid-cols-4 gap-0">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-3 transition-colors relative",
                isActive ? "text-neon-cyan bg-neon-cyan/10" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] uppercase tracking-wider font-mono">{tab.label}</span>
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
