import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '20')

    if (query.length < 2) {
      return NextResponse.json({ players: [] })
    }

    // Get current player
    const { data: currentPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!currentPlayer) {
      return createErrorResponse('Player not found', 404)
    }

    // Search for players by handle (excluding self)
    const { data: players, error } = await supabase
      .from('players')
      .select('id, handle, level, rank, syndicate_id')
      .ilike('handle', `%${query}%`)
      .neq('id', currentPlayer.id)
      .limit(limit)

    if (error) {
      console.error('[API] Search players error:', error)
      return createErrorResponse('Failed to search players', 500)
    }

    // Get friend request status for each player
    const playerIds = players?.map(p => p.id) || []
    let friendRequests: any[] = []
    
    if (playerIds.length > 0) {
      // Get requests where current player is requester and search results are recipients
      const { data: sentRequests } = await supabase
        .from('friend_requests')
        .select('requester_id, recipient_id, status')
        .eq('requester_id', currentPlayer.id)
        .in('recipient_id', playerIds)
      
      // Get requests where current player is recipient and search results are requesters
      const { data: receivedRequests } = await supabase
        .from('friend_requests')
        .select('requester_id, recipient_id, status')
        .eq('recipient_id', currentPlayer.id)
        .in('requester_id', playerIds)
      
      friendRequests = [...(sentRequests || []), ...(receivedRequests || [])]
    }

    // Map friend status
    const playersWithStatus = (players || []).map(player => {
      const request = friendRequests.find(fr => 
        (fr.requester_id === currentPlayer.id && fr.recipient_id === player.id) ||
        (fr.requester_id === player.id && fr.recipient_id === currentPlayer.id)
      )

      let friendStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked' = 'none'
      if (request) {
        if (request.status === 'accepted') {
          friendStatus = 'accepted'
        } else if (request.status === 'blocked') {
          friendStatus = 'blocked'
        } else if (request.status === 'pending') {
          friendStatus = request.requester_id === currentPlayer.id ? 'pending_sent' : 'pending_received'
        }
      }

      return {
        id: player.id,
        handle: player.handle,
        level: player.level,
        rank: player.rank,
        friendStatus,
      }
    })

    return NextResponse.json({ players: playersWithStatus })
  } catch (error) {
    return handleApiError(error, 'Failed to search players')
  }
}

