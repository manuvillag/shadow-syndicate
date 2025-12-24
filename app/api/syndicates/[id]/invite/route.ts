import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

// POST: Invite a player to the syndicate
export async function POST(
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
    const { inviteeId } = body

    if (!inviteeId) {
      return createErrorResponse('Invitee ID is required', 400)
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

    // Check if current player is leader or officer
    const { data: member } = await supabase
      .from('syndicate_members')
      .select('role')
      .eq('syndicate_id', id)
      .eq('player_id', currentPlayer.id)
      .single()

    if (!member || !['leader', 'officer'].includes(member.role)) {
      return createErrorResponse('Only leaders and officers can invite members', 403)
    }

    // Check if invitee exists
    const { data: invitee } = await supabase
      .from('players')
      .select('id, syndicate_id')
      .eq('id', inviteeId)
      .single()

    if (!invitee) {
      return createErrorResponse('Player not found', 404)
    }

    // Check if invitee is already in a syndicate
    if (invitee.syndicate_id) {
      return createErrorResponse('Player is already in a syndicate', 400)
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('syndicate_invitations')
      .select('id, status')
      .eq('syndicate_id', id)
      .eq('invitee_id', inviteeId)
      .single()

    if (existingInvitation) {
      if (existingInvitation.status === 'pending') {
        return createErrorResponse('Invitation already pending', 400)
      }
      if (existingInvitation.status === 'accepted') {
        return createErrorResponse('Player already accepted an invitation', 400)
      }
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('syndicate_invitations')
      .insert({
        syndicate_id: id,
        inviter_id: currentPlayer.id,
        invitee_id: inviteeId,
        status: 'pending',
      })
      .select(`
        id,
        status,
        created_at,
        inviter:inviter_id (id, handle),
        invitee:invitee_id (id, handle)
      `)
      .single()

    if (error) {
      console.error('[API] Create invitation error:', error)
      return createErrorResponse('Failed to send invitation', 500)
    }

    return NextResponse.json({ invitation }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Failed to send invitation')
  }
}

