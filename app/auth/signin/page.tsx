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

export default function SignInPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Fields required",
        description: "Please enter email and password",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { data, error } = await signIn(email.trim(), password)

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!data.user) {
        toast({
          title: "Sign in failed",
          description: "User not found",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "Signed in!",
        description: "Welcome back",
      })

      // Check if player exists, if not redirect to setup
      const playerResponse = await fetch("/api/player")
      const playerData = await playerResponse.json()

      if (!playerData.player) {
        router.push("/setup")
      } else {
        router.push("/")
      }
      router.refresh()
    } catch (error) {
      console.error("[SignIn] Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in",
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


