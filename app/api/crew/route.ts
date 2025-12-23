import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find player for this user
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, crew_size, crew_max')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: playerError?.message || 'Player not found' }, { status: 404 })
    }

    // Get crew members
    const { data: crew, error } = await supabase
      .from('crew_members')
      .select('*')
      .eq('player_id', player.id)
      .order('created_at', { ascending: true })

    if (error) {
      const { error: errorMessage, status } = handleApiError(error, 'Crew fetch')
      return NextResponse.json(createErrorResponse(errorMessage, status), { status })
    }

    // Calculate total crew power (sum of all attack + defense)
    const totalAttack = (crew || []).reduce((sum, member) => sum + (member.attack || 0), 0)
    const totalDefense = (crew || []).reduce((sum, member) => sum + (member.defense || 0), 0)
    const totalPower = totalAttack + totalDefense

    return NextResponse.json({
      crew: crew || [],
      stats: {
        crewSize: player.crew_size,
        crewMax: player.crew_max,
        totalAttack,
        totalDefense,
        totalPower,
      },
    })
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error, 'Crew route')
    return NextResponse.json(createErrorResponse(errorMessage, status), { status })
  }
}



