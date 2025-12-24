import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player data including power calculation and refresh time
    const { data: player } = await supabase
      .from('players')
      .select('id, level, last_opponent_refresh')
      .eq('user_id', user.id)
      .single()

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Calculate player's total power (same as in power route)
    const { data: crew } = await supabase
      .from('crew_members')
      .select('attack, defense')
      .eq('player_id', player.id)

    const totalCrewAttack = (crew || []).reduce((sum, m) => sum + (m.attack || 0), 0)
    const totalCrewDefense = (crew || []).reduce((sum, m) => sum + (m.defense || 0), 0)
    const totalCrewPower = totalCrewAttack + totalCrewDefense

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

    const playerBasePower = player.level * 50
    const playerTotalPower = playerBasePower + totalCrewPower + totalEquippedAttack + totalEquippedDefense

    // Check if opponents need refresh (refresh every 30 minutes or if never refreshed)
    const refreshIntervalMinutes = 30
    const needsRefresh = !player.last_opponent_refresh || 
      (Date.now() - new Date(player.last_opponent_refresh).getTime()) > (refreshIntervalMinutes * 60 * 1000)

    // Get opponent cooldowns for this player
    const { data: cooldowns } = await supabase
      .from('opponent_cooldowns')
      .select('opponent_id, cooldown_until')
      .eq('player_id', player.id)
      .gt('cooldown_until', new Date().toISOString())

    const cooldownMap = new Map(
      (cooldowns || []).map(c => [c.opponent_id, new Date(c.cooldown_until)])
    )

    // Fetch opponents from database
    const { data: allOpponents, error: opponentsError } = await supabase
      .from('opponents')
      .select('*')
      .eq('is_active', true)
      .order('base_power', { ascending: true })

    if (opponentsError) {
      console.error('[API] Opponents fetch error:', opponentsError)
      return NextResponse.json({ error: 'Failed to fetch opponents' }, { status: 500 })
    }

    // Filter and scale opponents based on player power
    // Show opponents within a reasonable range: 50% to 200% of player power
    const minPower = Math.max(50, Math.floor(playerTotalPower * 0.5))
    const maxPower = Math.floor(playerTotalPower * 2)

    const suitableOpponents = (allOpponents || [])
      .filter(opp => opp.base_power >= minPower && opp.base_power <= maxPower)
      .slice(0, 8) // Show up to 8 opponents

    // If we don't have enough suitable opponents, include some slightly outside range
    if (suitableOpponents.length < 5) {
      const additionalOpponents = (allOpponents || [])
        .filter(opp => 
          (opp.base_power >= minPower * 0.7 && opp.base_power < minPower) ||
          (opp.base_power > maxPower && opp.base_power <= maxPower * 1.5)
        )
        .slice(0, 5 - suitableOpponents.length)
      
      suitableOpponents.push(...additionalOpponents)
    }

    // Filter out opponents on cooldown
    const availableOpponents = suitableOpponents.filter(opp => {
      const cooldownUntil = cooldownMap.get(opp.id)
      if (!cooldownUntil) return true
      return cooldownUntil <= new Date()
    })

    // Sort by power
    availableOpponents.sort((a, b) => a.base_power - b.base_power)
    
    // Select 5 diverse opponents - randomize selection if refresh needed, otherwise use same logic
    const selectedOpponents = []
    if (availableOpponents.length > 0) {
      if (needsRefresh || availableOpponents.length <= 5) {
        // If refresh needed or few options, shuffle and take diverse selection
        const shuffled = [...availableOpponents].sort(() => Math.random() - 0.5)
        const powerRanges = [
          { min: 0, max: 0.2 },      // Very easy
          { min: 0.2, max: 0.4 },    // Easy
          { min: 0.4, max: 0.6 },    // Moderate
          { min: 0.6, max: 0.8 },    // Hard
          { min: 0.8, max: 1.0 },   // Very hard
        ]

        for (const range of powerRanges) {
          const rangeOpponents = shuffled.filter(opp => {
            const powerRatio = (opp.base_power - minPower) / (maxPower - minPower || 1)
            return powerRatio >= range.min && powerRatio < range.max
          })
          if (rangeOpponents.length > 0) {
            selectedOpponents.push(rangeOpponents[0])
          }
        }

        // Fill remaining slots with random opponents
        while (selectedOpponents.length < 5 && shuffled.length > selectedOpponents.length) {
          const remaining = shuffled.filter(opp => !selectedOpponents.includes(opp))
          if (remaining.length > 0) {
            selectedOpponents.push(remaining[0])
          } else {
            break
          }
        }
      } else {
        // Use deterministic selection (same opponents until refresh)
        const indices = [
          0, // Lowest
          Math.floor(availableOpponents.length * 0.25),
          Math.floor(availableOpponents.length * 0.5),
          Math.floor(availableOpponents.length * 0.75),
          availableOpponents.length - 1 // Highest
        ].filter((idx, i, arr) => arr.indexOf(idx) === i) // Remove duplicates
          .slice(0, 5) // Take max 5

        for (const idx of indices) {
          if (availableOpponents[idx]) {
            selectedOpponents.push(availableOpponents[idx])
          }
        }
      }
    }

    // Update refresh timestamp if needed
    if (needsRefresh) {
      await supabase
        .from('players')
        .update({ last_opponent_refresh: new Date().toISOString() })
        .eq('id', player.id)
    }

    // Map to API format with cooldown info
    const opponents = selectedOpponents.map((opp) => {
      const cooldownUntil = cooldownMap.get(opp.id)
      const now = new Date()
      const cooldownMinutes = cooldownUntil && cooldownUntil > now
        ? Math.ceil((cooldownUntil.getTime() - now.getTime()) / (60 * 1000))
        : 0

      return {
        id: opp.id,
        name: opp.name,
        avatar: '👤', // Can be customized later
        powerLevel: opp.base_power,
        credits: opp.base_credits,
        xp: opp.base_xp,
        adrenalCost: opp.adrenal_cost,
        cooldown: Math.max(cooldownMinutes, opp.cooldown_minutes || 0),
        difficulty: opp.difficulty,
        description: opp.description,
      }
    })

    return NextResponse.json({ opponents })
  } catch (error) {
    console.error('[API] Opponents fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
