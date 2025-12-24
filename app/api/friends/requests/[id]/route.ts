import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

// PATCH: Accept or decline friend request
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { action } = body // 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return createErrorResponse('Invalid action. Use "accept" or "decline"', 400)
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

    // Get friend request
    const { data: friendRequest, error: fetchError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', id)
      .eq('recipient_id', currentPlayer.id)
      .eq('status', 'pending')
      .single()

    if (fetchError || !friendRequest) {
      return createErrorResponse('Friend request not found', 404)
    }

    // Update request status
    const newStatus = action === 'accept' ? 'accepted' : 'declined'
    const { data: updatedRequest, error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        id,
        status,
        created_at,
        updated_at,
        requester:requester_id (id, handle, level, rank),
        recipient:recipient_id (id, handle, level, rank)
      `)
      .single()

    if (updateError) {
      console.error('[API] Update friend request error:', updateError)
      return createErrorResponse('Failed to update friend request', 500)
    }

    return NextResponse.json({ request: updatedRequest })
  } catch (error) {
    return handleApiError(error, 'Failed to update friend request')
  }
}

// DELETE: Cancel or remove friend request
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    // Get friend request
    const { data: friendRequest } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', id)
      .or(`requester_id.eq.${currentPlayer.id},recipient_id.eq.${currentPlayer.id}`)
      .single()

    if (!friendRequest) {
      return createErrorResponse('Friend request not found', 404)
    }

    // Delete request
    const { error: deleteError } = await supabase
      .from('friend_requests')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[API] Delete friend request error:', deleteError)
      return createErrorResponse('Failed to delete friend request', 500)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to delete friend request')
  }
}

