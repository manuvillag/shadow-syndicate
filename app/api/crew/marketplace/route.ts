import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, level, crew_size, crew_max')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get all active crew templates
    const { data: templates, error: templatesError } = await supabase
      .from('crew_templates')
      .select('*')
      .eq('is_active', true)
      .gte('level_requirement', player.level)
      .order('level_requirement', { ascending: true })
      .order('price', { ascending: true })

    if (templatesError) {
      const { error: errorMessage, status } = handleApiError(templatesError, 'Crew templates fetch')
      return NextResponse.json(createErrorResponse(errorMessage, status), { status })
    }

    // Get player's owned crew template IDs
    const { data: ownedCrew } = await supabase
      .from('crew_members')
      .select('crew_template_id')
      .eq('player_id', player.id)
      .not('crew_template_id', 'is', null)

    const ownedTemplateIds = new Set((ownedCrew || []).map(c => c.crew_template_id).filter(Boolean))

    // Filter out already owned crew and check capacity
    const available = (templates || []).filter(template => {
      const isOwned = ownedTemplateIds.has(template.id)
      const hasCapacity = player.crew_size < player.crew_max
      return !isOwned && hasCapacity
    })

    return NextResponse.json({
      available,
      ownedCount: ownedTemplateIds.size,
      crewSize: player.crew_size,
      crewMax: player.crew_max,
    })
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error, 'Crew marketplace')
    return NextResponse.json(createErrorResponse(errorMessage, status), { status })
  }
}

