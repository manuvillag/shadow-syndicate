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
import { parseAuthError, getAuthErrorTitle } from "@/lib/auth-error-handler"

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email
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

    // Validate password
    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter a password",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
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
          title: getAuthErrorTitle(authError),
          description: parseAuthError(authError),
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!authData.user) {
        toast({
          title: "Sign up failed",
          description: "Account creation failed. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        // Show success message and redirect to verification page
        router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim())}`)
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

