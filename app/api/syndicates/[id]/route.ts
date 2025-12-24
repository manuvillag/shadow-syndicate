import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

// GET: Get syndicate details
export async function GET(
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

    // Get syndicate
    const { data: syndicate, error: syndicateError } = await supabase
      .from('syndicates')
      .select(`
        id,
        name,
        description,
        created_at,
        leader_id,
        leader:leader_id (id, handle, level, rank)
      `)
      .eq('id', id)
      .single()

    if (syndicateError || !syndicate) {
      return createErrorResponse('Syndicate not found', 404)
    }

    // If leader is null, fetch it separately
    let leader = syndicate.leader
    if (!leader && syndicate.leader_id) {
      const { data: leaderData } = await supabase
        .from('players')
        .select('id, handle, level, rank')
        .eq('id', syndicate.leader_id)
        .single()
      
      leader = leaderData || { id: syndicate.leader_id, handle: 'Unknown', level: 1, rank: 'Initiate' }
    }

    const syndicateWithLeader = {
      ...syndicate,
      leader: leader || { id: 'unknown', handle: 'Unknown', level: 1, rank: 'Initiate' },
    }

    // Get members
    const { data: members, error: membersError } = await supabase
      .from('syndicate_members')
      .select(`
        id,
        role,
        joined_at,
        player_id,
        player:player_id (id, handle, level, rank)
      `)
      .eq('syndicate_id', id)
      .order('joined_at', { ascending: true })

    if (membersError) {
      console.error('[API] Get members error:', membersError)
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
          ...member,
          player: player || { id: 'unknown', handle: 'Unknown', level: 1, rank: 'Initiate' },
        }
      })
    )

    // Check if current player is a member
    const currentMember = membersWithPlayerData.find(m => m.player?.id === currentPlayer.id)

    return NextResponse.json({
      syndicate: {
        ...syndicateWithLeader,
        memberCount: membersWithPlayerData.length,
      },
      members: membersWithPlayerData,
      currentMember: currentMember ? {
        role: currentMember.role,
        joinedAt: currentMember.joined_at,
      } : null,
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch syndicate')
  }
}

// PATCH: Update syndicate (leader only)
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
    const { name, description } = body

    // Get current player
    const { data: currentPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!currentPlayer) {
      return createErrorResponse('Player not found', 404)
    }

    // Check if player is leader
    const { data: syndicate } = await supabase
      .from('syndicates')
      .select('leader_id')
      .eq('id', id)
      .single()

    if (!syndicate || syndicate.leader_id !== currentPlayer.id) {
      return createErrorResponse('Only the leader can update the syndicate', 403)
    }

    // Update syndicate
    const updates: any = {}
    if (name !== undefined) {
      if (name.length < 3 || name.length > 30) {
        return createErrorResponse('Syndicate name must be between 3 and 30 characters', 400)
      }
      updates.name = name.trim()
    }
    if (description !== undefined) {
      updates.description = description?.trim() || null
    }
    updates.updated_at = new Date().toISOString()

    const { data: updatedSyndicate, error } = await supabase
      .from('syndicates')
      .update(updates)
      .eq('id', id)
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at,
        leader:leader_id (id, handle, level, rank)
      `)
      .single()

    if (error) {
      console.error('[API] Update syndicate error:', error)
      return createErrorResponse('Failed to update syndicate', 500)
    }

    return NextResponse.json({ syndicate: updatedSyndicate })
  } catch (error) {
    return handleApiError(error, 'Failed to update syndicate')
  }
}

// DELETE: Delete syndicate (leader only)
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

    // Check if player is leader
    const { data: syndicate } = await supabase
      .from('syndicates')
      .select('leader_id')
      .eq('id', id)
      .single()

    if (!syndicate || syndicate.leader_id !== currentPlayer.id) {
      return createErrorResponse('Only the leader can delete the syndicate', 403)
    }

    // Delete syndicate (cascade will handle members and invitations)
    const { error } = await supabase
      .from('syndicates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[API] Delete syndicate error:', error)
      return createErrorResponse('Failed to delete syndicate', 500)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to delete syndicate')
  }
}

