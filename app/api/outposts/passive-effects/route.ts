import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Calculate and apply passive outpost effects
 * This should be called periodically (e.g., when collecting income or on player login)
 * Effects include:
 * - Alloy generation (Mining Station)
 * - Health regeneration (Safehouse)
 * - Item generation (Salvage Yard)
 * - Alloy to credits conversion (Manufacturing Hub)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { hoursPassed = 1 } = body // Default to 1 hour if not specified

    // Get player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, credits, alloy, health, max_health')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get all owned outposts with their templates
    const { data: outposts, error: outpostsError } = await supabase
      .from('outposts')
      .select(`
        *,
        outpost_templates:outpost_template_id (
          special_features
        )
      `)
      .eq('player_id', player.id)

    if (outpostsError) {
      console.error('[API] Outposts fetch error:', outpostsError)
      return NextResponse.json({ error: 'Failed to fetch outposts' }, { status: 500 })
    }

    let totalAlloyGenerated = 0
    let totalHealthRegenerated = 0
    let totalCreditsFromAlloy = 0
    let itemsGenerated: string[] = []

    // Process each outpost's special effects
    for (const outpost of outposts || []) {
      const template = outpost.outpost_templates as any
      const specialFeatures = template?.special_features

      if (!specialFeatures || !specialFeatures.type) continue

      const effectType = specialFeatures.type
      const effectValue = specialFeatures.value || 0
      const level = outpost.level

      switch (effectType) {
        case 'alloy_generation':
          // Mining Station: Generates alloy per hour per level
          const alloyPerHour = effectValue * level
          totalAlloyGenerated += Math.floor(alloyPerHour * hoursPassed)
          break

        case 'health_regeneration':
          // Safehouse: Regenerates health per hour per level
          const healthPerHour = effectValue * level
          totalHealthRegenerated += Math.floor(healthPerHour * hoursPassed)
          break

        case 'alloy_conversion':
          // Manufacturing Hub: Converts alloy to credits (1:10 ratio per level)
          // This would need player's current alloy, so we'll handle it separately
          // For now, we'll calculate potential conversion
          break

        case 'item_generation':
          // Salvage Yard: Generates items (1 per day per level)
          const itemsPerDay = effectValue * level
          const itemsThisPeriod = Math.floor((itemsPerDay / 24) * hoursPassed)
          if (itemsThisPeriod > 0) {
            // Generate random items (simplified - you'd want to pull from item pool)
            for (let i = 0; i < itemsThisPeriod; i++) {
              itemsGenerated.push(`Generated Item ${i + 1}`)
            }
          }
          break
      }
    }

    // Apply alloy generation
    if (totalAlloyGenerated > 0) {
      const { error: alloyError } = await supabase
        .from('players')
        .update({ alloy: (player.alloy || 0) + totalAlloyGenerated })
        .eq('id', player.id)

      if (alloyError) {
        console.error('[API] Alloy update error:', alloyError)
      }
    }

    // Apply health regeneration (cap at max_health)
    if (totalHealthRegenerated > 0) {
      const newHealth = Math.min(
        (player.health || 0) + totalHealthRegenerated,
        player.max_health || 100
      )
      const { error: healthError } = await supabase
        .from('players')
        .update({ health: newHealth })
        .eq('id', player.id)

      if (healthError) {
        console.error('[API] Health update error:', healthError)
      }
    }

    // Handle alloy to credits conversion (Manufacturing Hub)
    // This requires checking if player has alloy and converting it
    if (player.alloy && player.alloy > 0) {
      const { data: manufacturingOutposts } = await supabase
        .from('outposts')
        .select(`
          *,
          outpost_templates:outpost_template_id (
            special_features
          )
        `)
        .eq('player_id', player.id)
        .eq('type', 'Manufacturing')

      for (const hub of manufacturingOutposts || []) {
        const template = hub.outpost_templates as any
        if (template?.special_features?.type === 'alloy_conversion' && player.alloy > 0) {
          const conversionRate = template.special_features.value * hub.level // 10 per level
          const alloyToConvert = Math.min(player.alloy, conversionRate * hoursPassed)
          const creditsFromAlloy = Math.floor(alloyToConvert * 10) // 1:10 ratio

          if (creditsFromAlloy > 0) {
            totalCreditsFromAlloy += creditsFromAlloy
            const { error: conversionError } = await supabase
              .from('players')
              .update({
                alloy: player.alloy - alloyToConvert,
                credits: (player.credits || 0) + creditsFromAlloy,
              })
              .eq('id', player.id)

            if (conversionError) {
              console.error('[API] Alloy conversion error:', conversionError)
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      effects: {
        alloyGenerated: totalAlloyGenerated,
        healthRegenerated: totalHealthRegenerated,
        creditsFromAlloy: totalCreditsFromAlloy,
        itemsGenerated: itemsGenerated.length,
      },
    })
  } catch (error) {
    console.error('[API] Passive effects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

