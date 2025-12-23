import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, credits')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get owned outposts with template data
    const { data: outposts, error } = await supabase
      .from('outposts')
      .select(`
        *,
        outpost_templates:outpost_template_id (
          image_url,
          special_features
        )
      `)
      .eq('player_id', player.id)
      .order('created_at', { ascending: false })

    if (error) {
      const { error: errorMessage, status } = handleApiError(error, 'Outposts fetch')
      return NextResponse.json(createErrorResponse(errorMessage, status), { status })
    }

    // Calculate available income for each outpost
    const now = new Date()
    const outpostsWithIncome = (outposts || []).map((outpost: any) => {
      const lastCollected = new Date(outpost.last_collected_at)
      const hoursSinceCollection = (now.getTime() - lastCollected.getTime()) / (1000 * 60 * 60)
      const availableIncome = Math.floor(hoursSinceCollection * outpost.income_rate)

      // Cap at reasonable max (e.g., 24 hours worth)
      const maxIncome = outpost.income_rate * 24
      const cappedIncome = Math.min(availableIncome, maxIncome)

      // Get template data (if joined) or null
      const template = outpost.outpost_templates as any
      const templateImageUrl = template?.image_url ?? null
      const specialFeatures = template?.special_features ?? null

      return {
        id: outpost.id,
        name: outpost.name,
        type: outpost.type,
        level: outpost.level,
        incomeRate: outpost.income_rate,
        availableIncome: Math.max(0, cappedIncome),
        upgradeAvailable: outpost.level < 10, // Max level 10
        imageUrl: templateImageUrl,
        specialFeatures: specialFeatures,
      }
    })

    return NextResponse.json({ outposts: outpostsWithIncome })
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error, 'Outposts route')
    return NextResponse.json(createErrorResponse(errorMessage, status), { status })
  }
}

