import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

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

    // Get current player
    const { data: currentPlayer } = await supabase
      .from('players')
      .select('id, syndicate_id')
      .eq('user_id', user.id)
      .single()

    if (!currentPlayer) {
      return createErrorResponse('Player not found', 404)
    }

    // Check if in this syndicate
    if (currentPlayer.syndicate_id !== id) {
      return createErrorResponse('You are not a member of this syndicate', 400)
    }

    // Check if leader (leaders can't leave, must delete syndicate)
    const { data: syndicate } = await supabase
      .from('syndicates')
      .select('leader_id')
      .eq('id', id)
      .single()

    if (syndicate && syndicate.leader_id === currentPlayer.id) {
      return createErrorResponse('Leaders cannot leave. Delete the syndicate instead.', 400)
    }

    // Remove from members
    const { error: memberError } = await supabase
      .from('syndicate_members')
      .delete()
      .eq('syndicate_id', id)
      .eq('player_id', currentPlayer.id)

    if (memberError) {
      console.error('[API] Leave syndicate error:', memberError)
      return createErrorResponse('Failed to leave syndicate', 500)
    }

    // Update player's syndicate_id
    const { error: updateError } = await supabase
      .from('players')
      .update({ syndicate_id: null })
      .eq('id', currentPlayer.id)

    if (updateError) {
      console.error('[API] Update player syndicate error:', updateError)
      // Don't fail, just log
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to leave syndicate')
  }
}

