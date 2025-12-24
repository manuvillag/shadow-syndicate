import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get current player
    const { data: currentPlayer } = await supabase
      .from('players')
      .select('id, syndicate_id')
      .eq('user_id', user.id)
      .single()

    if (!currentPlayer) {
      return createErrorResponse('Player not found', 404)
    }

    // If player is not in a syndicate, return empty array
    if (!currentPlayer.syndicate_id) {
      return NextResponse.json({ members: [] })
    }

    // Get syndicate members (excluding self)
    const { data: members, error: membersError } = await supabase
      .from('syndicate_members')
      .select(`
        id,
        role,
        player_id,
        player:player_id (id, handle, level, rank)
      `)
      .eq('syndicate_id', currentPlayer.syndicate_id)
      .neq('player_id', currentPlayer.id)
      .order('joined_at', { ascending: true })

    if (membersError) {
      console.error('[API] Get syndicate members error:', membersError)
      return createErrorResponse('Failed to fetch syndicate members', 500)
    }

    // Ensure all members have player data (fetch separately if join fails)
    const membersWithPlayerData = await Promise.all(
      (members || []).map(async (member: any) => {
        let player = member.player
        if (!player && member.player_id) {
          const { data: playerData } = await supabase
            .from('players')
            .select('id, handle, level, rank')
            .eq('id', member.player_id)
            .single()
          
          player = playerData || { id: member.player_id, handle: 'Unknown', level: 1, rank: 'Initiate' }
        }

        return {
          id: member.id,
          role: member.role,
          player: player || { id: 'unknown', handle: 'Unknown', level: 1, rank: 'Initiate' },
        }
      })
    )

    // Get friend request status for each member
    const playerIds = membersWithPlayerData.map(m => m.player.id)
    let friendRequests: any[] = []
    
    if (playerIds.length > 0) {
      // Get requests where current player is requester and members are recipients
      const { data: sentRequests } = await supabase
        .from('friend_requests')
        .select('requester_id, recipient_id, status')
        .eq('requester_id', currentPlayer.id)
        .in('recipient_id', playerIds)
      
      // Get requests where current player is recipient and members are requesters
      const { data: receivedRequests } = await supabase
        .from('friend_requests')
        .select('requester_id, recipient_id, status')
        .eq('recipient_id', currentPlayer.id)
        .in('requester_id', playerIds)
      
      friendRequests = [...(sentRequests || []), ...(receivedRequests || [])]
    }

    // Map friend status for each member
    const membersWithStatus = membersWithPlayerData.map(member => {
      const request = friendRequests.find(fr => 
        (fr.requester_id === currentPlayer.id && fr.recipient_id === member.player.id) ||
        (fr.requester_id === member.player.id && fr.recipient_id === currentPlayer.id)
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
        id: member.player.id,
        handle: member.player.handle,
        level: member.player.level,
        rank: member.player.rank,
        role: member.role,
        friendStatus,
      }
    })

    return NextResponse.json({ members: membersWithStatus })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch syndicate members')
  }
}

