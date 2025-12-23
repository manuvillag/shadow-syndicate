import { Radio } from "lucide-react"
import Image from "next/image"

export function CommsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="relative w-32 h-32 mb-4">
        <Image
          src="/.jpg?key=empty&height=128&width=128&query=futuristic radio transmission tower empty quiet cyberpunk neon blue purple"
          alt="No Transmissions"
          fill
          className="object-cover rounded-full opacity-50"
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-secondary/80 backdrop-blur-sm flex items-center justify-center border-2 border-neon-cyan/30">
            <Radio className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No New Transmissions</h3>
      <p className="text-sm text-muted-foreground max-w-xs text-pretty">
        Your comms feed is quiet. Complete contracts and engage in skirmishes to see activity updates.
      </p>
    </div>
  )
}
