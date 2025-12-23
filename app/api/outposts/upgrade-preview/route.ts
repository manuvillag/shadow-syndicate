import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Get upgrade preview for an outpost (cost, new level, new income rate)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { outpostId } = body

    if (!outpostId) {
      return NextResponse.json({ error: 'Outpost ID is required' }, { status: 400 })
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

    // Get outpost with template data
    const { data: outpost, error: outpostError } = await supabase
      .from('outposts')
      .select(`
        *,
        outpost_templates:outpost_template_id (
          base_income_rate
        )
      `)
      .eq('id', outpostId)
      .eq('player_id', player.id)
      .single()

    if (outpostError || !outpost) {
      return NextResponse.json({ error: 'Outpost not found' }, { status: 404 })
    }

    // Check max level
    if (outpost.level >= 10) {
      return NextResponse.json({ error: 'Outpost is already at maximum level' }, { status: 400 })
    }

    // Get template base income rate (fallback to current income_rate if no template)
    const template = outpost.outpost_templates as any
    const baseIncomeRate = template?.base_income_rate ?? outpost.income_rate

    // Calculate upgrade cost
    const baseCost = baseIncomeRate * 10
    const upgradeCost = Math.floor(baseCost * (1 + outpost.level * 0.5))

    // Calculate new stats after upgrade
    const newLevel = outpost.level + 1
    const newIncomeRate = Math.floor(baseIncomeRate * (1 + (newLevel - 1) * 0.2))
    const incomeIncrease = newIncomeRate - outpost.income_rate

    const canAfford = player.credits >= upgradeCost

    return NextResponse.json({
      currentLevel: outpost.level,
      currentIncomeRate: outpost.income_rate,
      newLevel,
      newIncomeRate,
      incomeIncrease,
      upgradeCost,
      canAfford,
      playerCredits: player.credits,
    })
  } catch (error) {
    console.error('[API] Upgrade preview error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

