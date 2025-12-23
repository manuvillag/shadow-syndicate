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

    // Get outpost
    const { data: outpost, error: outpostError } = await supabase
      .from('outposts')
      .select('*')
      .eq('id', outpostId)
      .eq('player_id', player.id)
      .single()

    if (outpostError || !outpost) {
      return NextResponse.json({ error: 'Outpost not found' }, { status: 404 })
    }

    // Calculate available income
    const now = new Date()
    const lastCollected = new Date(outpost.last_collected_at)
    const hoursSinceCollection = (now.getTime() - lastCollected.getTime()) / (1000 * 60 * 60)
    const availableIncome = Math.floor(hoursSinceCollection * outpost.income_rate)
    
    // Cap at 24 hours worth
    const maxIncome = outpost.income_rate * 24
    const incomeToCollect = Math.min(Math.max(0, availableIncome), maxIncome)

    if (incomeToCollect === 0) {
      return NextResponse.json({ error: 'No income available to collect' }, { status: 400 })
    }

    // Calculate hours passed for passive effects (simplified - process all outposts)
    const hoursPassed = Math.min(hoursSinceCollection, 24) // Cap at 24 hours
    
    // Process passive effects for all outposts (alloy generation, health regen, etc.)
    // Get all outposts with templates
    const { data: allOutposts } = await supabase
      .from('outposts')
      .select(`
        *,
        outpost_templates:outpost_template_id (
          special_features
        )
      `)
      .eq('player_id', player.id)

    let totalAlloyGenerated = 0
    let totalHealthRegenerated = 0

    for (const op of allOutposts || []) {
      const template = op.outpost_templates as any
      const specialFeatures = template?.special_features
      if (!specialFeatures || !specialFeatures.type) continue

      const effectType = specialFeatures.type
      const effectValue = specialFeatures.value || 0
      const opLevel = op.level

      if (effectType === 'alloy_generation') {
        totalAlloyGenerated += Math.floor(effectValue * opLevel * hoursPassed)
      } else if (effectType === 'health_regeneration') {
        totalHealthRegenerated += Math.floor(effectValue * opLevel * hoursPassed)
      }
    }

    // Apply passive effects
    if (totalAlloyGenerated > 0 || totalHealthRegenerated > 0) {
      const { data: fullPlayer } = await supabase
        .from('players')
        .select('alloy, health, max_health')
        .eq('id', player.id)
        .single()

      if (fullPlayer) {
        const updates: any = {}
        if (totalAlloyGenerated > 0) {
          updates.alloy = (fullPlayer.alloy || 0) + totalAlloyGenerated
        }
        if (totalHealthRegenerated > 0) {
          updates.health = Math.min(
            (fullPlayer.health || 0) + totalHealthRegenerated,
            fullPlayer.max_health || 100
          )
        }
        
        if (Object.keys(updates).length > 0) {
          await supabase
            .from('players')
            .update(updates)
            .eq('id', player.id)
        }
      }
    }

    // Update player credits and outpost last_collected_at
    const { error: updateError } = await supabase
      .from('players')
      .update({ credits: player.credits + incomeToCollect })
      .eq('id', player.id)

    if (updateError) {
      console.error('[API] Player update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const { error: outpostUpdateError } = await supabase
      .from('outposts')
      .update({ last_collected_at: now.toISOString() })
      .eq('id', outpostId)

    if (outpostUpdateError) {
      console.error('[API] Outpost update error:', outpostUpdateError)
      // Don't fail the request, income was already collected
    }

    return NextResponse.json({ 
      success: true, 
      incomeCollected: incomeToCollect,
      newCredits: player.credits + incomeToCollect 
    })
  } catch (error) {
    console.error('[API] Collect income error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


