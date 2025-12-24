import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

// GET: List all syndicates or search
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let query = supabase
      .from('syndicates')
      .select(`
        id,
        name,
        description,
        created_at,
        leader_id,
        leader:leader_id (id, handle, level, rank)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: syndicates, error } = await query

    if (error) {
      console.error('[API] Get syndicates error:', error)
      return createErrorResponse('Failed to fetch syndicates', 500)
    }

    // Get actual member counts and ensure leader data exists
    const syndicatesWithCounts = await Promise.all(
      (syndicates || []).map(async (syndicate) => {
        const { count } = await supabase
          .from('syndicate_members')
          .select('*', { count: 'exact', head: true })
          .eq('syndicate_id', syndicate.id)

        // If leader is null, fetch it separately
        let leader = syndicate.leader
        if (!leader && syndicate.leader_id) {
          const { data: leaderData } = await supabase
            .from('players')
            .select('id, handle, level, rank')
            .eq('id', syndicate.leader_id)
            .single()
          
          leader = leaderData || { id: syndicate.leader_id, handle: 'Unknown', level: 1, rank: 'Initiate' }
        }

        return {
          ...syndicate,
          leader: leader || { id: 'unknown', handle: 'Unknown', level: 1, rank: 'Initiate' },
          memberCount: count || 0,
        }
      })
    )

    return NextResponse.json({ syndicates: syndicatesWithCounts })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch syndicates')
  }
}

// POST: Create a new syndicate
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || name.trim().length === 0) {
      return createErrorResponse('Syndicate name is required', 400)
    }

    if (name.length < 3 || name.length > 30) {
      return createErrorResponse('Syndicate name must be between 3 and 30 characters', 400)
    }

    // Get current player
    const { data: currentPlayer, error: playerError } = await supabase
      .from('players')
      .select('id, syndicate_id')
      .eq('user_id', user.id)
      .single()

    if (playerError) {
      console.error('[API] Get player error:', JSON.stringify(playerError, null, 2))
      return createErrorResponse('Failed to fetch player data', 500)
    }

    if (!currentPlayer) {
      return createErrorResponse('Player not found', 404)
    }

    console.log('[API] Creating syndicate for player:', currentPlayer.id, 'user:', user.id)

    // Check if player is already in a syndicate
    if (currentPlayer.syndicate_id) {
      return createErrorResponse('You are already in a syndicate. Leave it first to create a new one.', 400)
    }

    // Check if name is taken (handle case where table doesn't exist)
    const { data: existingSyndicate, error: checkError } = await supabase
      .from('syndicates')
      .select('id')
      .eq('name', name.trim())
      .single()

    // If table doesn't exist, return helpful error
    if (checkError && checkError.code === '42P01') {
      return createErrorResponse(
        'Syndicates table not found. Please run migration 018_syndicates_system.sql in Supabase.',
        500
      )
    }

    if (existingSyndicate) {
      return createErrorResponse('Syndicate name already taken', 400)
    }

    // Create syndicate (first without the join to avoid issues)
    const { data: newSyndicate, error: createError } = await supabase
      .from('syndicates')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        leader_id: currentPlayer.id,
      })
      .select('id, name, description, created_at, leader_id')
      .single()

    if (createError) {
      console.error('[API] Create syndicate error:', JSON.stringify(createError, null, 2))
      
      // Check for common errors
      if (createError.code === '42P01') {
        return createErrorResponse(
          'Syndicates table not found. Please run migration 018_syndicates_system.sql in Supabase.',
          500
        )
      }
      
      if (createError.code === '42501') {
        return createErrorResponse(
          'Permission denied. Check RLS policies for the syndicates table. The policy requires that leader_id matches your player ID.',
          500
        )
      }
      
      // Return more detailed error message
      const errorMessage = createError.message || 'Failed to create syndicate'
      const errorDetails = createError.details || createError.hint || ''
      const errorCode = createError.code ? ` (Code: ${createError.code})` : ''
      return createErrorResponse(
        errorDetails ? `${errorMessage}: ${errorDetails}${errorCode}` : `${errorMessage}${errorCode}`,
        500
      )
    }

    if (!newSyndicate || !newSyndicate.id) {
      console.error('[API] Syndicate created but no data returned')
      return createErrorResponse('Syndicate created but no data returned', 500)
    }

    // Fetch leader info separately to avoid join issues
    const { data: leaderData } = await supabase
      .from('players')
      .select('id, handle, level, rank')
      .eq('id', currentPlayer.id)
      .single()

    const syndicateWithLeader = {
      ...newSyndicate,
      leader: leaderData || {
        id: currentPlayer.id,
        handle: 'Unknown',
        level: 1,
        rank: 'Initiate',
      },
    }

    // Add leader as member
    const { error: memberError } = await supabase
      .from('syndicate_members')
      .insert({
        syndicate_id: newSyndicate.id,
        player_id: currentPlayer.id,
        role: 'leader',
      })

    if (memberError) {
      console.error('[API] Add leader as member error:', memberError)
      // Rollback syndicate creation
      await supabase.from('syndicates').delete().eq('id', newSyndicate.id)
      const errorMessage = memberError.message || 'Failed to add leader as member'
      const errorDetails = memberError.details || memberError.hint || ''
      return createErrorResponse(
        errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
        500
      )
    }

    // Update player's syndicate_id
    const { error: updateError } = await supabase
      .from('players')
      .update({ syndicate_id: newSyndicate.id })
      .eq('id', currentPlayer.id)

    if (updateError) {
      console.error('[API] Update player syndicate error:', updateError)
      // Don't rollback, just log
    }

    return NextResponse.json({ syndicate: syndicateWithLeader }, { status: 201 })
  } catch (error) {
    console.error('[API] Create syndicate exception:', error)
    return handleApiError(error, 'Failed to create syndicate')
  }
}

