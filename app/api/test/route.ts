import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Simple test endpoint to verify Supabase connection
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test database connection
    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        message: 'Database connection failed. Check your Supabase configuration.',
      })
    }

    // Test auth
    const { data: { user } } = await supabase.auth.getUser()

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      authenticated: !!user,
      userId: user?.id || null,
      contractsFound: contracts !== null,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to Supabase',
    })
  }
}

