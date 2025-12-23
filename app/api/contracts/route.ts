import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get player level if authenticated (for filtering locked contracts)
    let playerLevel = 0
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: player } = await supabase
        .from('players')
        .select('level')
        .eq('user_id', user.id)
        .single()
      playerLevel = player?.level || 0
    }

    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('is_active', true)
      .order('level_requirement', { ascending: true })
      .order('difficulty', { ascending: true })
      .order('energy_cost', { ascending: true })

    if (error) {
      const { error: errorMessage, status } = handleApiError(error, 'Contracts fetch')
      return NextResponse.json(createErrorResponse(errorMessage, status), { status })
    }

    return NextResponse.json({ contracts: contracts || [] })
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error, 'Contracts fetch')
    return NextResponse.json(createErrorResponse(errorMessage, status), { status })
  }
}


