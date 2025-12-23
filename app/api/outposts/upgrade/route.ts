import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
          base_income_rate,
          special_features
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

    // Calculate upgrade cost based on base income rate and current level
    // Formula: base_income_rate * 10 * (1 + level * 0.5)
    const baseCost = baseIncomeRate * 10
    const upgradeCost = Math.floor(baseCost * (1 + outpost.level * 0.5))

    // Check if player can afford it
    if (player.credits < upgradeCost) {
      return NextResponse.json({ error: 'Insufficient credits for upgrade' }, { status: 400 })
    }

    // Upgrade outpost: calculate new income rate based on template base + 20% per level
    // Formula: base_income_rate * (1 + (new_level - 1) * 0.2)
    const newLevel = outpost.level + 1
    const newIncomeRate = Math.floor(baseIncomeRate * (1 + (newLevel - 1) * 0.2))

    const { error: upgradeError } = await supabase
      .from('outposts')
      .update({
        level: newLevel,
        income_rate: newIncomeRate,
      })
      .eq('id', outpostId)

    if (upgradeError) {
      console.error('[API] Outpost upgrade error:', upgradeError)
      return NextResponse.json({ error: upgradeError.message }, { status: 500 })
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from('players')
      .update({ credits: player.credits - upgradeCost })
      .eq('id', player.id)

    if (updateError) {
      console.error('[API] Credits deduction error:', updateError)
      // Rollback upgrade
      await supabase
        .from('outposts')
        .update({
          level: outpost.level,
          income_rate: outpost.income_rate,
        })
        .eq('id', outpostId)
      return NextResponse.json({ error: 'Failed to process upgrade' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      newLevel,
      newIncomeRate,
      newCredits: player.credits - upgradeCost 
    })
  } catch (error) {
    console.error('[API] Upgrade outpost error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


