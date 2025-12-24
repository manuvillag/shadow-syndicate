import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

// PATCH: Accept or decline invitation
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
      .select('id, syndicate_id')
      .eq('user_id', user.id)
      .single()

    if (!currentPlayer) {
      return createErrorResponse('Player not found', 404)
    }

    // Get invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('syndicate_invitations')
      .select('*')
      .eq('id', id)
      .eq('invitee_id', currentPlayer.id)
      .eq('status', 'pending')
      .single()

    if (fetchError || !invitation) {
      return createErrorResponse('Invitation not found', 404)
    }

    if (action === 'accept') {
      // Check if already in a syndicate
      if (currentPlayer.syndicate_id) {
        return createErrorResponse('You are already in a syndicate. Leave it first.', 400)
      }

      // Add as member
      const { error: memberError } = await supabase
        .from('syndicate_members')
        .insert({
          syndicate_id: invitation.syndicate_id,
          player_id: currentPlayer.id,
          role: 'member',
        })

      if (memberError) {
        console.error('[API] Accept invitation error:', memberError)
        return createErrorResponse('Failed to join syndicate', 500)
      }

      // Update player's syndicate_id
      const { error: updateError } = await supabase
        .from('players')
        .update({ syndicate_id: invitation.syndicate_id })
        .eq('id', currentPlayer.id)

      if (updateError) {
        console.error('[API] Update player syndicate error:', updateError)
      }
    }

    // Update invitation status
    const newStatus = action === 'accept' ? 'accepted' : 'declined'
    const { data: updatedInvitation, error: updateError } = await supabase
      .from('syndicate_invitations')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        id,
        status,
        created_at,
        updated_at,
        syndicate:syndicate_id (id, name, description),
        inviter:inviter_id (id, handle),
        invitee:invitee_id (id, handle)
      `)
      .single()

    if (updateError) {
      console.error('[API] Update invitation error:', updateError)
      return createErrorResponse('Failed to update invitation', 500)
    }

    return NextResponse.json({ invitation: updatedInvitation })
  } catch (error) {
    return handleApiError(error, 'Failed to update invitation')
  }
}

