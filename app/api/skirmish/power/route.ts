import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player data
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, level')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get crew members and calculate total power
    const { data: crew } = await supabase
      .from('crew_members')
      .select('attack, defense')
      .eq('player_id', player.id)

    const totalCrewAttack = (crew || []).reduce((sum, m) => sum + (m.attack || 0), 0)
    const totalCrewDefense = (crew || []).reduce((sum, m) => sum + (m.defense || 0), 0)
    const totalCrewPower = totalCrewAttack + totalCrewDefense

    // Get equipped items and calculate equipment stats
    const { data: inventory } = await supabase
      .from('player_inventory')
      .select(`
        items (
          attack_boost,
          defense_boost
        )
      `)
      .eq('player_id', player.id)
      .eq('equipped', true)
      .in('slot', ['weapon', 'armor', 'gadget'])

    const totalEquippedAttack = (inventory || []).reduce((sum, inv) => {
      const item = inv.items as any
      return sum + (item?.attack_boost || 0)
    }, 0)

    const totalEquippedDefense = (inventory || []).reduce((sum, inv) => {
      const item = inv.items as any
      return sum + (item?.defense_boost || 0)
    }, 0)

    // Calculate total power: base level + crew power + equipped item stats
    const playerBasePower = player.level * 50
    const totalPower = playerBasePower + totalCrewPower + totalEquippedAttack + totalEquippedDefense

    return NextResponse.json({
      totalPower,
      breakdown: {
        basePower: playerBasePower,
        crewPower: totalCrewPower,
        equipmentPower: totalEquippedAttack + totalEquippedDefense,
        crewAttack: totalCrewAttack,
        crewDefense: totalCrewDefense,
        equipmentAttack: totalEquippedAttack,
        equipmentDefense: totalEquippedDefense,
      }
    })
  } catch (error) {
    console.error('[API] Power calculation error:', error)
    return NextResponse.json({ error: 'Failed to calculate power' }, { status: 500 })
  }
}

