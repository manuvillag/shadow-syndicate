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
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!currentPlayer) {
      return createErrorResponse('Player not found', 404)
    }

    // Get all accepted friend requests
    const { data: friendRequests, error } = await supabase
      .from('friend_requests')
      .select(`
        id,
        requester_id,
        recipient_id,
        requester:requester_id (id, handle, level, rank, syndicate_id),
        recipient:recipient_id (id, handle, level, rank, syndicate_id)
      `)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${currentPlayer.id},recipient_id.eq.${currentPlayer.id}`)

    if (error) {
      console.error('[API] Get friends list error:', error)
      return createErrorResponse('Failed to fetch friends', 500)
    }

    // Ensure all requests have player data (fetch separately if join fails)
    const requestsWithPlayerData = await Promise.all(
      (friendRequests || []).map(async (req: any) => {
        let requester = req.requester
        let recipient = req.recipient

        // Fetch requester separately if join failed
        if (!requester && req.requester_id) {
          const { data: requesterData } = await supabase
            .from('players')
            .select('id, handle, level, rank, syndicate_id')
            .eq('id', req.requester_id)
            .single()
          
          requester = requesterData || { id: req.requester_id, handle: 'Unknown', level: 1, rank: 'Initiate', syndicate_id: null }
        }

        // Fetch recipient separately if join failed
        if (!recipient && req.recipient_id) {
          const { data: recipientData } = await supabase
            .from('players')
            .select('id, handle, level, rank, syndicate_id')
            .eq('id', req.recipient_id)
            .single()
          
          recipient = recipientData || { id: req.recipient_id, handle: 'Unknown', level: 1, rank: 'Initiate', syndicate_id: null }
        }

        return {
          id: req.id,
          requester: requester || { id: 'unknown', handle: 'Unknown', level: 1, rank: 'Initiate', syndicate_id: null },
          recipient: recipient || { id: 'unknown', handle: 'Unknown', level: 1, rank: 'Initiate', syndicate_id: null },
        }
      })
    )

    // Map to friend list (get the other player, not self)
    const friends = requestsWithPlayerData.map(request => {
      const friend = request.requester?.id === currentPlayer.id 
        ? request.recipient 
        : request.requester
      
      return {
        id: friend?.id,
        handle: friend?.handle,
        level: friend?.level,
        rank: friend?.rank,
        syndicateId: friend?.syndicate_id,
      }
    }).filter(f => f.id) // Filter out any nulls

    return NextResponse.json({ friends })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch friends')
  }
}

