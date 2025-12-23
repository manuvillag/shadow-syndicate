"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { signUp } from "@/lib/auth"

export default function SignUpPage() {
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

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Sign up the user
      const { data: authData, error: authError } = await signUp(email.trim(), password)

      if (authError) {
        toast({
          title: "Sign up failed",
          description: authError.message || "Failed to create account",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!authData.user) {
        toast({
          title: "Sign up failed",
          description: "Account created but user not found",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        toast({
          title: "Check your email",
          description: "Please confirm your email address, then sign in to create your player profile.",
          variant: "default",
        })
        router.push("/auth/signin")
        setLoading(false)
        return
      }

      // If session exists, redirect to setup to create player
      toast({
        title: "Account created!",
        description: "Now create your operator profile",
      })

      // Redirect to setup page
      setTimeout(() => {
        router.push("/setup")
        router.refresh()
      }, 500)
    } catch (error) {
      console.error("[SignUp] Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
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
          <p className="text-sm text-muted-foreground">Create your account</p>
          <p className="text-xs text-muted-foreground">You'll create your operator profile after signing up</p>
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
              minLength={6}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">At least 6 characters</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-neon-cyan hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  )
}

