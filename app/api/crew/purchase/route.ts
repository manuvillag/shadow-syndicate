import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId } = body

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Get player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, credits, level, crew_size, crew_max')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get crew template
    const { data: template, error: templateError } = await supabase
      .from('crew_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Crew template not found' }, { status: 404 })
    }

    // Check level requirement
    if (player.level < template.level_requirement) {
      return NextResponse.json(
        { error: `Requires level ${template.level_requirement}. You are level ${player.level}.` },
        { status: 400 }
      )
    }

    // Check if player already owns this crew member
    const { data: existingCrew } = await supabase
      .from('crew_members')
      .select('id')
      .eq('player_id', player.id)
      .eq('crew_template_id', templateId)
      .single()

    if (existingCrew) {
      return NextResponse.json({ error: 'You already own this crew member' }, { status: 400 })
    }

    // Check crew capacity
    if (player.crew_size >= player.crew_max) {
      return NextResponse.json({ error: 'Crew capacity reached' }, { status: 400 })
    }

    // Check if player has enough credits
    if (player.credits < template.price) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: template.price, current: player.credits },
        { status: 400 }
      )
    }

    // Purchase crew member
    const { data: newCrew, error: insertError } = await supabase
      .from('crew_members')
      .insert({
        player_id: player.id,
        name: template.name,
        role: template.role,
        attack: template.attack,
        defense: template.defense,
        level: 1,
        crew_template_id: template.id,
      })
      .select('*')
      .single()

    if (insertError) {
      const { error: errorMessage, status } = handleApiError(insertError, 'Crew purchase insert')
      return NextResponse.json(createErrorResponse(errorMessage, status), { status })
    }

    // Deduct credits and update crew size
    const { error: updateError } = await supabase
      .from('players')
      .update({
        credits: player.credits - template.price,
        crew_size: player.crew_size + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', player.id)

    if (updateError) {
      const { error: errorMessage, status } = handleApiError(updateError, 'Player update after crew purchase')
      return NextResponse.json(createErrorResponse(errorMessage, status), { status })
    }

    return NextResponse.json({
      success: true,
      crewMember: newCrew,
      creditsRemaining: player.credits - template.price,
    })
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error, 'Crew purchase')
    return NextResponse.json(createErrorResponse(errorMessage, status), { status })
  }
}

