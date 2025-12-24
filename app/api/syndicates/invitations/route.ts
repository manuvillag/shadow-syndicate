import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

// GET: Get invitations (received or sent)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'received' // 'sent' or 'received'

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
      .from('syndicate_invitations')
      .select(`
        id,
        status,
        created_at,
        syndicate:syndicate_id (id, name, description, leader:leader_id (id, handle, level, rank)),
        inviter:inviter_id (id, handle, level, rank),
        invitee:invitee_id (id, handle, level, rank)
      `)
      .eq('status', 'pending')

    if (type === 'sent') {
      query = query.eq('inviter_id', currentPlayer.id)
    } else {
      query = query.eq('invitee_id', currentPlayer.id)
    }

    const { data: invitations, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('[API] Get invitations error:', error)
      return createErrorResponse('Failed to fetch invitations', 500)
    }

    return NextResponse.json({ invitations: invitations || [] })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch invitations')
  }
}

