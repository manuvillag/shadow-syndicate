import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HUD Bar Skeleton */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md border-b border-border px-3 py-3">
        <Skeleton className="h-12 w-full" />
      </div>

      {/* Content Skeleton */}
      <div className="px-3 py-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-3" />
          <Skeleton className="h-8 w-full" />
        </Card>
      ))}
    </div>
  )
}

export function ContractCardSkeleton() {
  return (
    <Card className="p-3 border-2">
      <div className="flex items-start gap-2 mb-2">
        <Skeleton className="h-4 w-4 rounded" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3 mb-3" />
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        <Skeleton className="h-12 w-full rounded" />
        <Skeleton className="h-12 w-full rounded" />
        <Skeleton className="h-12 w-full rounded" />
        <Skeleton className="h-12 w-full rounded" />
      </div>
      <Skeleton className="h-8 w-full rounded" />
    </Card>
  )
}

export function OutpostCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </Card>
  )
}

export function HudBarSkeleton() {
  return (
    <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md border-b border-border px-3 py-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function ItemCardSkeleton() {
  return (
    <Card className="p-3 border-2 opacity-40">
      <div className="flex gap-3">
        <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0 opacity-50" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 opacity-50" />
              <Skeleton className="h-3 w-1/3 opacity-50" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded opacity-50" />
            <Skeleton className="h-5 w-16 rounded opacity-50" />
          </div>
          <Skeleton className="h-8 w-full rounded mt-auto opacity-50" />
        </div>
      </div>
    </Card>
  )
}

