import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Require authentication
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player by user_id
    const { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // Player doesn't exist yet, return null (will be created on first action)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ player: null, needsSetup: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!player) {
      return NextResponse.json({ player: null, needsSetup: true })
    }

    // Regenerate energy before returning
    await supabase.rpc('regenerate_energy')

    // Fetch updated player data after regeneration
    const { data: updatedPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('id', player.id)
      .single()

    return NextResponse.json({ player: updatedPlayer || player })
  } catch (error) {
    console.error('[API] Player fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Require authentication
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in first.' }, { status: 401 })
    }

    const body = await request.json()
    const { handle } = body

    if (!handle || handle.trim().length === 0) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 })
    }

    // Check if handle is taken
    const { data: handleTaken } = await supabase
      .from('players')
      .select('id')
      .eq('handle', handle.trim().toUpperCase())
      .single()

    if (handleTaken) {
      return NextResponse.json({ error: 'Handle already taken' }, { status: 400 })
    }

    // Check if user already has a player
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingPlayer) {
      return NextResponse.json({ error: 'Player already exists' }, { status: 400 })
    }

    // Create new player
    const playerData = {
      user_id: user.id,
      handle: handle.trim().toUpperCase(),
      rank: 'Initiate',
      syndicate: 'Independent',
      credits: 10000,
      alloy: 0,
      level: 1,
      xp_current: 0,
      xp_max: 1000,
      charge: 100,
      charge_max: 100,
      adrenal: 50,
      adrenal_max: 50,
      health: 100,
      health_max: 100,
      crew_size: 0,
      crew_max: 5,
    }

    const { data: newPlayer, error } = await supabase
      .from('players')
      .insert(playerData)
      .select()
      .single()

    if (error) {
      console.error('[API] Player creation error:', JSON.stringify(error, null, 2))
      // Return more detailed error information
      const errorResponse = {
        error: error.message || 'Failed to create player',
        details: error.details || null,
        code: error.code || null,
        hint: error.hint || null,
        fullError: process.env.NODE_ENV === 'development' ? error : undefined
      }
      console.error('[API] Error response:', JSON.stringify(errorResponse, null, 2))
      return NextResponse.json(errorResponse, { status: 500 })
    }

    if (!newPlayer) {
      return NextResponse.json({ error: 'Player created but no data returned' }, { status: 500 })
    }

    return NextResponse.json({ player: newPlayer }, { status: 201 })
  } catch (error) {
    console.error('[API] Player creation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ 
      error: errorMessage,
      message: errorMessage
    }, { status: 500 })
  }
}

