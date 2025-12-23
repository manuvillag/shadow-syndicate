"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ErrorDisplayProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorDisplay({ 
  title = "Error", 
  message, 
  onRetry, 
  retryLabel = "Try Again",
  className 
}: ErrorDisplayProps) {
  return (
    <Card className={`p-6 border-destructive/50 bg-destructive/5 ${className}`}>
      <div className="flex flex-col items-center text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold text-destructive mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </div>
    </Card>
  )
}

interface ErrorPageProps {
  error: string | null
  onRetry?: () => void
}

export function ErrorPage({ error, onRetry }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ErrorDisplay
        title="Something went wrong"
        message={error || "An unexpected error occurred"}
        onRetry={onRetry}
      />
    </div>
  )
}

