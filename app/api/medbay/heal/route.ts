import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Heal player - instant heal with alloy or trigger natural regeneration
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body // "instant" or "free"

    if (!type || (type !== 'instant' && type !== 'free')) {
      return NextResponse.json({ error: 'Invalid heal type' }, { status: 400 })
    }

    // Regenerate health first (natural regen)
    await supabase.rpc('regenerate_energy')

    // Get player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, health, health_max, alloy')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Check if already at full health
    if (player.health >= player.health_max) {
      return NextResponse.json({ 
        success: true, 
        message: 'Already at full health',
        health: player.health,
        healthMax: player.health_max,
      })
    }

    if (type === 'instant') {
      // Instant heal with alloy
      const alloyCost = 50
      const healAmount = player.health_max - player.health

      if (player.alloy < alloyCost) {
        return NextResponse.json({ 
          error: `Insufficient alloy. Need ${alloyCost}, have ${player.alloy}` 
        }, { status: 400 })
      }

      // Heal to full and deduct alloy
      const { error: updateError } = await supabase
        .from('players')
        .update({
          health: player.health_max,
          alloy: player.alloy - alloyCost,
          updated_at: new Date().toISOString(),
        })
        .eq('id', player.id)

      if (updateError) {
        console.error('[API] Heal update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        health: player.health_max,
        healthMax: player.health_max,
        healAmount,
        alloyCost,
        newAlloy: player.alloy - alloyCost,
      })
    } else {
      // Free heal - just trigger regeneration (already done above)
      // Return current health after regen
      return NextResponse.json({
        success: true,
        health: player.health,
        healthMax: player.health_max,
        message: 'Natural regeneration is active. Health will restore over time.',
      })
    }
  } catch (error) {
    console.error('[API] Heal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

