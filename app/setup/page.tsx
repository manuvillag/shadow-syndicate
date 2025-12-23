"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"

export default function SetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [handle, setHandle] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if user is authenticated
  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/auth/signin")
        return
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!handle.trim()) {
      toast({
        title: "Handle required",
        description: "Please enter a handle",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.trim() }),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        const text = await response.text()
        toast({
          title: "Error",
          description: `Server error: ${response.status} - ${text || "Unknown error"}`,
          variant: "destructive",
        })
        setLoading(false)
        console.error("[Setup] Parse Error:", parseError, "Response:", text)
        return
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
        setLoading(false)
        console.error("[Setup] API Error:", {
          status: response.status,
          statusText: response.statusText,
          data: data,
        })
        return
      }

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
        setLoading(false)
        console.error("[Setup] API Error:", data)
        return
      }

      if (!data.player) {
        toast({
          title: "Error",
          description: "Player created but no data returned",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "Player created!",
        description: `Welcome, ${data.player.handle}`,
      })

      // Small delay to show toast, then redirect
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 500)
    } catch (error) {
      console.error("[Setup] Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create player",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono">Checking authentication...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground font-mono uppercase tracking-wider">
            Shadow Syndicate
          </h1>
          <p className="text-sm text-muted-foreground">Create your operator profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="handle" className="text-sm font-mono uppercase tracking-wider">
              Operator Handle
            </Label>
            <Input
              id="handle"
              type="text"
              placeholder="VOID_RUNNER_X"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toUpperCase())}
              maxLength={20}
              className="font-mono"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Your handle will be displayed in UPPERCASE. Choose wisely.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !handle.trim()}>
            {loading ? "Creating..." : "Begin Operations"}
          </Button>
        </form>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Starting resources:</p>
          <div className="flex justify-center gap-4">
            <span>10,000 Credits</span>
            <span>•</span>
            <span>Level 1</span>
            <span>•</span>
            <span>100 Charge</span>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
          <Link href="/auth/signin" className="text-neon-cyan hover:underline">
            Sign out
          </Link>
        </div>
      </Card>
    </div>
  )
}

