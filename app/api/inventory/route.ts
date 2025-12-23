import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Find player for this user
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: playerError?.message || 'Player not found' }, { status: 404 })
    }

    // Join inventory with item definitions
    const { data: inventory, error } = await supabase
      .from('player_inventory')
      .select(
        `
        id,
        quantity,
        equipped,
        slot,
        item:items (
          id,
          name,
          rarity,
          type,
          attack_boost,
          defense_boost,
          special_boost
        )
      `,
      )
      .eq('player_id', player.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API] Inventory fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items = (inventory || []).map((row) => ({
      id: row.id,
      quantity: row.quantity ?? 1,
      equipped: row.equipped ?? false,
      slot: row.slot ?? null,
      item: row.item,
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('[API] Inventory route error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}



