"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { signIn } from "@/lib/auth"
import { parseAuthError, getAuthErrorTitle } from "@/lib/auth-error-handler"

export default function SignInPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email format
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter your password",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const result = await signIn(email.trim(), password)
      const { data, error } = result || {}

      // Log the full response for debugging
      console.log("[SignIn] Sign in result:", { hasData: !!data, hasError: !!error, error })

      if (error) {
        console.error("[SignIn] Auth error:", error)
        const errorTitle = getAuthErrorTitle(error)
        const errorMessage = parseAuthError(error)
        console.log("[SignIn] Toast will show:", { errorTitle, errorMessage })
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        })
        
        setLoading(false)
        return
      }

      if (!data || !data.user) {
        console.error("[SignIn] No user data returned, result:", result)
        toast({
          title: "Sign in failed",
          description: "Invalid email or password. Please check your credentials and try again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "Signed in!",
        description: "Welcome back",
      })

      // Clear any cached player data and force refresh
      // Use router.push with a timestamp to force a fresh load
      const playerResponse = await fetch("/api/player", { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      })
      const playerData = await playerResponse.json()

      if (!playerData.player) {
        router.push("/setup")
      } else {
        // Force a hard navigation to clear all caches
        window.location.href = '/'
      }
    } catch (error) {
      console.error("[SignIn] Error:", error)
      toast({
        title: getAuthErrorTitle(error),
        description: parseAuthError(error),
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground font-mono uppercase tracking-wider">
            Shadow Syndicate
          </h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-mono uppercase tracking-wider">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="operator@shadownet.syn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-mono uppercase tracking-wider">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-neon-cyan hover:underline">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  )
}


