import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { templateId } = body

    if (!templateId) {
      return createErrorResponse('Template ID is required', 400)
    }

    // Get the item template
    const { data: template, error: templateError } = await supabase
      .from('item_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      return createErrorResponse('Item template not found', 404)
    }

    // Get player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, credits, level')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return createErrorResponse('Player not found', 404)
    }

    // Check level requirement
    if (player.level < template.level_requirement) {
      return createErrorResponse(
        `Level ${template.level_requirement} required. Current level: ${player.level}`,
        400
      )
    }

    // Check if already owned
    const { data: existingItem } = await supabase
      .from('player_inventory')
      .select('id')
      .eq('player_id', player.id)
      .eq('item_id', template.id)
      .single()

    if (existingItem) {
      return createErrorResponse('You already own this item', 400)
    }

    // Check credits
    if (player.credits < template.price) {
      return createErrorResponse(
        `Insufficient credits. Required: ${template.price.toLocaleString()}, Have: ${player.credits.toLocaleString()}`,
        400
      )
    }

    // Create the item in items table if it doesn't exist
    let { data: item } = await supabase
      .from('items')
      .select('id')
      .eq('name', template.name)
      .single()

    if (!item) {
      const { data: newItem, error: itemError } = await supabase
        .from('items')
        .insert({
          name: template.name,
          rarity: template.rarity,
          type: template.type,
          attack_boost: template.attack_boost,
          defense_boost: template.defense_boost,
          special_boost: template.special_boost,
        })
        .select('id')
        .single()

      if (itemError || !newItem) {
        console.error('[API] Item creation error:', itemError)
        return createErrorResponse('Failed to create item', 500)
      }

      item = newItem
    }

    // Deduct credits and add item to inventory
    const { error: updateError } = await supabase
      .from('players')
      .update({
        credits: player.credits - template.price,
        updated_at: new Date().toISOString(),
      })
      .eq('id', player.id)

    if (updateError) {
      console.error('[API] Player update error:', updateError)
      return createErrorResponse('Failed to deduct credits', 500)
    }

    // Add to inventory
    const { error: inventoryError } = await supabase
      .from('player_inventory')
      .insert({
        player_id: player.id,
        item_id: item.id,
        quantity: 1,
        equipped: false,
        slot: null,
      })

    if (inventoryError) {
      console.error('[API] Inventory insert error:', inventoryError)
      // Rollback credits
      await supabase
        .from('players')
        .update({ credits: player.credits })
        .eq('id', player.id)
      
      return createErrorResponse('Failed to add item to inventory', 500)
    }

    return NextResponse.json({
      success: true,
      message: `Purchased ${template.name}`,
      creditsRemaining: player.credits - template.price,
    })
  } catch (error) {
    return handleApiError(error, 'Failed to purchase item')
  }
}

