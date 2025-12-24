import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

// GET: List friend requests (sent and received)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // 'sent', 'received', 'all'

    // Get current player
    const { data: currentPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!currentPlayer) {
      return createErrorResponse('Player not found', 404)
    }

    let query = supabase
      .from('friend_requests')
      .select(`
        id,
        status,
        created_at,
        requester_id,
        recipient_id,
        requester:requester_id (id, handle, level, rank),
        recipient:recipient_id (id, handle, level, rank)
      `)

    if (type === 'sent') {
      query = query.eq('requester_id', currentPlayer.id)
    } else if (type === 'received') {
      query = query.eq('recipient_id', currentPlayer.id)
    } else {
      query = query.or(`requester_id.eq.${currentPlayer.id},recipient_id.eq.${currentPlayer.id}`)
    }

    const { data: requests, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('[API] Get friend requests error:', error)
      return createErrorResponse('Failed to fetch friend requests', 500)
    }

    // Ensure all requests have player data (fetch separately if join fails)
    const requestsWithPlayerData = await Promise.all(
      (requests || []).map(async (req: any) => {
        let requester = req.requester
        let recipient = req.recipient

        // Fetch requester separately if join failed
        if (!requester && req.requester_id) {
          const { data: requesterData } = await supabase
            .from('players')
            .select('id, handle, level, rank')
            .eq('id', req.requester_id)
            .single()
          
          requester = requesterData || { id: req.requester_id, handle: 'Unknown', level: 1, rank: 'Initiate' }
        }

        // Fetch recipient separately if join failed
        if (!recipient && req.recipient_id) {
          const { data: recipientData } = await supabase
            .from('players')
            .select('id, handle, level, rank')
            .eq('id', req.recipient_id)
            .single()
          
          recipient = recipientData || { id: req.recipient_id, handle: 'Unknown', level: 1, rank: 'Initiate' }
        }

        return {
          id: req.id,
          status: req.status,
          created_at: req.created_at,
          requester: requester || { id: 'unknown', handle: 'Unknown', level: 1, rank: 'Initiate' },
          recipient: recipient || { id: 'unknown', handle: 'Unknown', level: 1, rank: 'Initiate' },
        }
      })
    )

    return NextResponse.json({ requests: requestsWithPlayerData })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch friend requests')
  }
}

// POST: Send friend request
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { recipientId } = body

    if (!recipientId) {
      return createErrorResponse('Recipient ID is required', 400)
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

    if (currentPlayer.id === recipientId) {
      return createErrorResponse('Cannot send friend request to yourself', 400)
    }

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from('friend_requests')
      .select('id, status')
      .or(`and(requester_id.eq.${currentPlayer.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${currentPlayer.id})`)
      .single()

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        return createErrorResponse('Already friends', 400)
      }
      if (existingRequest.status === 'pending') {
        return createErrorResponse('Friend request already pending', 400)
      }
      if (existingRequest.status === 'blocked') {
        return createErrorResponse('Cannot send request to blocked player', 400)
      }
    }

    // Create friend request
    const { data: newRequest, error } = await supabase
      .from('friend_requests')
      .insert({
        requester_id: currentPlayer.id,
        recipient_id: recipientId,
        status: 'pending',
      })
      .select(`
        id,
        status,
        created_at,
        requester_id,
        recipient_id,
        requester:requester_id (id, handle, level, rank),
        recipient:recipient_id (id, handle, level, rank)
      `)
      .single()

    if (error) {
      console.error('[API] Create friend request error:', error)
      return createErrorResponse('Failed to send friend request', 500)
    }

    // Ensure player data is present (fetch separately if join failed)
    let requester = newRequest.requester
    let recipient = newRequest.recipient

    if (!requester && newRequest.requester_id) {
      const { data: requesterData } = await supabase
        .from('players')
        .select('id, handle, level, rank')
        .eq('id', newRequest.requester_id)
        .single()
      
      requester = requesterData || { id: newRequest.requester_id, handle: 'Unknown', level: 1, rank: 'Initiate' }
    }

    if (!recipient && newRequest.recipient_id) {
      const { data: recipientData } = await supabase
        .from('players')
        .select('id, handle, level, rank')
        .eq('id', newRequest.recipient_id)
        .single()
      
      recipient = recipientData || { id: newRequest.recipient_id, handle: 'Unknown', level: 1, rank: 'Initiate' }
    }

    const requestWithPlayerData = {
      ...newRequest,
      requester: requester || { id: 'unknown', handle: 'Unknown', level: 1, rank: 'Initiate' },
      recipient: recipient || { id: 'unknown', handle: 'Unknown', level: 1, rank: 'Initiate' },
    }

    return NextResponse.json({ request: requestWithPlayerData }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Failed to send friend request')
  }
}

