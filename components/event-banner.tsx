import { Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import Image from "next/image"

interface EventBannerProps {
  title: string
  description: string
  timeRemaining: string
}

export function EventBanner({ title, description, timeRemaining }: EventBannerProps) {
  return (
    <Card className="border-2 border-warning bg-gradient-to-r from-warning/10 to-warning/5 overflow-hidden relative">
      <div className="absolute inset-0">
        <Image
          src="/.jpg?key=event&height=100&width=400&query=dramatic space event explosion neon warning yellow orange cyberpunk"
          alt="Event Background"
          fill
          className="object-cover opacity-20"
        />
      </div>
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          <div className="bg-warning/20 p-2 rounded-lg backdrop-blur-sm border border-warning/30">
            <Sparkles className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-warning uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-xs text-foreground/90 mb-2">{description}</p>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-warning/20 backdrop-blur-sm rounded text-[10px] font-mono text-warning uppercase border border-warning/30">
                Ends in {timeRemaining}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
