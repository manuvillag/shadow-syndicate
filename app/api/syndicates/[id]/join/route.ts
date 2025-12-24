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

    // Check if already in a syndicate
    if (currentPlayer.syndicate_id) {
      return createErrorResponse('You are already in a syndicate. Leave it first.', 400)
    }

    // Check if syndicate exists
    const { data: syndicate } = await supabase
      .from('syndicates')
      .select('id')
      .eq('id', id)
      .single()

    if (!syndicate) {
      return createErrorResponse('Syndicate not found', 404)
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('syndicate_members')
      .select('id')
        .eq('syndicate_id', id)
      .eq('player_id', currentPlayer.id)
      .single()

    if (existingMember) {
      return createErrorResponse('You are already a member of this syndicate', 400)
    }

    // Add as member
    const { error: memberError } = await supabase
      .from('syndicate_members')
      .insert({
        syndicate_id: id,
        player_id: currentPlayer.id,
        role: 'member',
      })

    if (memberError) {
      console.error('[API] Join syndicate error:', JSON.stringify(memberError, null, 2))
      
      // Check for common errors
      if (memberError.code === '42501') {
        return createErrorResponse(
          'Permission denied. Check RLS policies for the syndicate_members table.',
          500
        )
      }
      
      const errorMessage = memberError.message || 'Failed to join syndicate'
      const errorDetails = memberError.details || memberError.hint || ''
      const errorCode = memberError.code ? ` (Code: ${memberError.code})` : ''
      return createErrorResponse(
        errorDetails ? `${errorMessage}: ${errorDetails}${errorCode}` : `${errorMessage}${errorCode}`,
        500
      )
    }

    // Update player's syndicate_id
    const { error: updateError } = await supabase
      .from('players')
        .update({ syndicate_id: id })
      .eq('id', currentPlayer.id)

    if (updateError) {
      console.error('[API] Update player syndicate error:', updateError)
      // Don't fail, just log
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to join syndicate')
  }
}

