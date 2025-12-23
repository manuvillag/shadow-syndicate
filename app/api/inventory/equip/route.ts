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
    const { inventoryId, slot } = body

    if (!inventoryId || !slot) {
      return NextResponse.json({ error: 'Inventory ID and slot are required' }, { status: 400 })
    }

    if (!['weapon', 'armor', 'gadget'].includes(slot)) {
      return NextResponse.json({ error: 'Invalid slot. Must be weapon, armor, or gadget' }, { status: 400 })
    }

    // Get player
    const { data: player } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get the inventory item to equip
    const { data: inventoryItem, error: itemError } = await supabase
      .from('player_inventory')
      .select('*, items(*)')
      .eq('id', inventoryId)
      .eq('player_id', player.id)
      .single()

    if (itemError || !inventoryItem) {
      return NextResponse.json({ error: 'Item not found in inventory' }, { status: 404 })
    }

    // Verify item type matches slot (weapon -> weapon slot, etc.)
    const item = inventoryItem.items as any
    if (item.type === 'consumable') {
      return NextResponse.json({ error: 'Consumables cannot be equipped' }, { status: 400 })
    }
    if (item.type !== slot) {
      return NextResponse.json({ error: `Item type ${item.type} cannot be equipped in ${slot} slot` }, { status: 400 })
    }

    // Unequip any item currently in this slot
    await supabase
      .from('player_inventory')
      .update({ equipped: false, slot: null })
      .eq('player_id', player.id)
      .eq('slot', slot)
      .eq('equipped', true)

    // Equip the new item
    const { error: equipError } = await supabase
      .from('player_inventory')
      .update({ equipped: true, slot })
      .eq('id', inventoryId)

    if (equipError) {
      console.error('[API] Equip error:', equipError)
      return NextResponse.json({ error: equipError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Item equipped successfully' })
  } catch (error) {
    console.error('[API] Equip error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const inventoryId = searchParams.get('id')

    if (!inventoryId) {
      return NextResponse.json({ error: 'Inventory ID is required' }, { status: 400 })
    }

    // Get player
    const { data: player } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Unequip the item
    const { error: unequipError } = await supabase
      .from('player_inventory')
      .update({ equipped: false, slot: null })
      .eq('id', inventoryId)
      .eq('player_id', player.id)

    if (unequipError) {
      console.error('[API] Unequip error:', unequipError)
      return NextResponse.json({ error: unequipError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Item unequipped successfully' })
  } catch (error) {
    console.error('[API] Unequip error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

