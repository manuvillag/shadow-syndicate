import { createClient } from '@/lib/supabase/client'

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string) {
  const supabase = createClient()
  // Configure email redirect URL for verification
  // Use the current origin (works in browser context)
  const redirectTo = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/verify-email`
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-email`
  
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: redirectTo,
    }
  })
}

export async function signOut() {
  const supabase = createClient()
  return await supabase.auth.signOut()
}


