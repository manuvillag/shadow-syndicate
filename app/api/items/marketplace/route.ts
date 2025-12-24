import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get player to check level and owned items
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, level')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return createErrorResponse('Player not found', 404)
    }

    // Get all active item templates
    const { data: templates, error: templatesError } = await supabase
      .from('item_templates')
      .select('*')
      .eq('is_active', true)
      .order('level_requirement', { ascending: true })
      .order('price', { ascending: true })

    if (templatesError) {
      console.error('[API] Item templates fetch error:', templatesError)
      return createErrorResponse('Failed to fetch item templates', 500)
    }

    // Get player's owned items to filter out already purchased items
    // We need to check by item name since items are created from templates
    const { data: inventory } = await supabase
      .from('player_inventory')
      .select(`
        item:items (
          name
        )
      `)
      .eq('player_id', player.id)

    const ownedItemNames = new Set(
      (inventory || [])
        .map(i => (i.item as any)?.name)
        .filter(Boolean)
    )

    // Map templates to marketplace format
    const marketplaceItems = (templates || [])
      .filter((template) => {
        // Filter out owned items completely
        return !ownedItemNames.has(template.name)
      })
      .map((template) => {
        const meetsLevel = player.level >= template.level_requirement
        const locked = !meetsLevel

      return {
        id: template.id,
        name: template.name,
        rarity: template.rarity,
        type: template.type,
        attackBoost: template.attack_boost || 0,
        defenseBoost: template.defense_boost || 0,
        specialBoost: template.special_boost,
        price: template.price,
        levelRequirement: template.level_requirement,
        description: template.description,
        locked,
        isOwned: false, // Items are filtered out if owned, so this is always false
        requirements: locked 
          ? (!meetsLevel ? `Level ${template.level_requirement} required` : undefined)
          : undefined,
      }
    })

    return NextResponse.json({ items: marketplaceItems })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch item marketplace')
  }
}

