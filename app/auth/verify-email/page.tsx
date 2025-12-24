"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [checking, setChecking] = useState(false)
  const [verified, setVerified] = useState(false)

  // Check if email is already verified (handles both direct visit and callback from email)
  useEffect(() => {
    async function checkVerification() {
      setChecking(true)
      const supabase = createClient()
      
      // Handle auth callback from email link (Supabase adds tokens to URL)
      const { data: { session } } = await supabase.auth.getSession()
      
      // Check if user is authenticated and email is confirmed
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && user.email_confirmed_at) {
        setVerified(true)
        // Redirect to setup after a moment
        setTimeout(() => {
          router.push("/setup")
        }, 2000)
      } else if (session && user) {
        // User just clicked verification link and is now authenticated
        // Check again after a brief moment for email confirmation
        setTimeout(async () => {
          const { data: { user: updatedUser } } = await supabase.auth.getUser()
          if (updatedUser && updatedUser.email_confirmed_at) {
            setVerified(true)
            setTimeout(() => {
              router.push("/setup")
            }, 2000)
          }
        }, 1000)
      }
      
      setChecking(false)
    }

    checkVerification()
  }, [email, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-4">
          {verified ? (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-foreground font-mono uppercase tracking-wider">
                Email Verified!
              </h1>
              <p className="text-sm text-muted-foreground">
                Your email has been confirmed. Redirecting to create your profile...
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-neon-cyan" />
              </div>
              <h1 className="text-2xl font-bold text-foreground font-mono uppercase tracking-wider">
                Verify Your Email
              </h1>
              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  We've sent a verification email to:
                </p>
                <p className="text-sm font-semibold text-neon-cyan">{email}</p>
                <p className="text-xs text-muted-foreground">
                  Please check your inbox and click the verification link to activate your account.
                </p>
              </div>
            </>
          )}
        </div>

        {!verified && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-2">What to do next:</h3>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return here and sign in to create your operator profile</li>
              </ol>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => router.push("/auth/signin")}
                className="w-full"
                variant="outline"
              >
                Go to Sign In
              </Button>
              <Button
                onClick={async () => {
                  if (!email) return
                  setChecking(true)
                  const supabase = createClient()
                  // Resend verification email
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: email,
                  })
                  
                  if (error) {
                    alert(`Error: ${error.message}`)
                  } else {
                    alert("Verification email sent! Please check your inbox.")
                  }
                  setChecking(false)
                }}
                disabled={checking || !email}
                className="w-full"
                variant="ghost"
              >
                {checking ? "Sending..." : "Resend Verification Email"}
              </Button>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/auth/signin"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  )
}

