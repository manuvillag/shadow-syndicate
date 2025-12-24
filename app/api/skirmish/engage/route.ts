import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getRankForLevel, calculateXPForLevel } from '@/lib/level-system'

interface CombatResult {
  outcome: 'win' | 'lose'
  damageDealt: number
  damageTaken: number
  creditsEarned: number
  xpGained: number
  streak: number
  loot?: string
}

// Loot pool definition
const LOOT_POOL = [
  { name: 'Plasma Cell', rarity: 'common', type: 'consumable' },
  { name: 'Energy Core', rarity: 'common', type: 'consumable' },
  { name: 'Quantum Fragment', rarity: 'rare', type: 'consumable' },
  { name: 'Nano Repair Kit', rarity: 'common', type: 'consumable' },
] as const

// Calculate combat outcome based on power levels (Mafia Wars style)
function calculateCombat(playerPower: number, opponentPowerLevel: number): CombatResult {
  const powerDiff = playerPower - opponentPowerLevel
  // 1% win chance per 10 power difference
  const baseWinChance = 0.5 + (powerDiff / 10) * 0.01
  const winChance = Math.max(0.1, Math.min(0.9, baseWinChance)) // Clamp between 10% and 90%
  
  const isWin = Math.random() < winChance

  if (isWin) {
    // Win: Deal damage, take less damage, get rewards
    const damageDealt = Math.floor(Math.random() * 300) + 200
    const damageTaken = Math.floor(Math.random() * 100) + 50
    // Rebalanced credits: ~20-30 credits per power level (caps around 25k for high power opponents)
    // Much lower than before to match contract rewards better
    const creditsEarned = Math.floor(opponentPowerLevel * 25 + Math.random() * opponentPowerLevel * 10)
    const xpGained = opponentPowerLevel * 6 + Math.floor(Math.random() * opponentPowerLevel * 2)
    const streak = Math.floor(Math.random() * 5) + 1
    const gotLoot = Math.random() > 0.7
    
    // Higher level opponents have better loot chances
    const rareLootChance = opponentPowerLevel > 30 ? 0.3 : 0.1
    const lootItem = gotLoot 
      ? (Math.random() < rareLootChance 
          ? LOOT_POOL.find(item => item.rarity === 'rare') || LOOT_POOL[0]
          : LOOT_POOL[Math.floor(Math.random() * (LOOT_POOL.length - 1))])
      : undefined
    const loot = lootItem?.name

    return {
      outcome: 'win',
      damageDealt,
      damageTaken,
      creditsEarned,
      xpGained,
      streak,
      loot,
    }
  } else {
    // Lose: Deal less damage, take more damage, get reduced rewards
    const damageDealt = Math.floor(Math.random() * 150) + 50
    const damageTaken = Math.floor(Math.random() * 200) + 100
    const creditsEarned = 0
    const xpGained = Math.floor((opponentPowerLevel * 6) * 0.2) // 20% XP on loss

    return {
      outcome: 'lose',
      damageDealt,
      damageTaken,
      creditsEarned,
      xpGained,
      streak: 0,
    }
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { opponentId, opponentPowerLevel, opponentCredits, opponentXp, adrenalCost } = body

    if (!opponentId || opponentPowerLevel === undefined || !adrenalCost) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Regenerate energy first
    await supabase.rpc('regenerate_energy')

    // Get player data
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Check if player has enough adrenal
    if (player.adrenal < adrenalCost) {
      return NextResponse.json(
        { error: 'Insufficient adrenal', currentAdrenal: player.adrenal, required: adrenalCost },
        { status: 400 }
      )
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

    const totalItemAttack = (inventory || []).reduce((sum, inv) => {
      const item = inv.items as any
      return sum + (item?.attack_boost || 0)
    }, 0)

    const totalItemDefense = (inventory || []).reduce((sum, inv) => {
      const item = inv.items as any
      return sum + (item?.defense_boost || 0)
    }, 0)

    // Calculate player power: base level + crew power + equipment stats
    // Each level contributes ~50 power, crew power is direct addition, equipment adds to attack/defense
    const playerBasePower = player.level * 50
    const equipmentPower = totalItemAttack + totalItemDefense
    const playerTotalPower = playerBasePower + totalCrewPower + equipmentPower

    // Calculate combat result using total power
    const combatResult = calculateCombat(playerTotalPower, opponentPowerLevel)

    // Calculate new health (reduce on loss, no change on win)
    const newHealth = combatResult.outcome === 'lose' 
      ? Math.max(0, player.health - combatResult.damageTaken)
      : player.health

    // Calculate new XP and check for level up
    const newXp = player.xp_current + combatResult.xpGained
    let currentLevel = player.level
    let remainingXP = newXp
    let finalLevel = currentLevel
    
    // Handle multiple level ups if XP gain is large
    while (finalLevel < 100) {
      const xpNeededForCurrentLevel = calculateXPForLevel(finalLevel)
      if (remainingXP >= xpNeededForCurrentLevel) {
        remainingXP -= xpNeededForCurrentLevel
        finalLevel++
      } else {
        break
      }
    }
    
    const leveledUp = finalLevel > currentLevel
    const newXpMax = calculateXPForLevel(finalLevel + 1)
    const finalXP = remainingXP
    const newLevel = finalLevel

    // Get opponent name (for logging)
    const opponentName = body.opponentName || `Opponent_${opponentId}`

    // Update player (including rank if leveled up)
    const newRank = leveledUp ? getRankForLevel(newLevel) : player.rank
    
    // If health decreased, reset last_health_regen so regeneration starts from now
    const updateData: any = {
      adrenal: player.adrenal - adrenalCost,
      credits: player.credits + combatResult.creditsEarned,
      xp_current: finalXP,
      xp_max: newXpMax,
      level: newLevel,
      rank: newRank,
      health: newHealth,
      updated_at: new Date().toISOString(),
    }
    
    // Reset health regeneration timer if health decreased
    if (newHealth < player.health) {
      updateData.last_health_regen = new Date().toISOString()
    }
    
    const { error: updateError } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', player.id)

    if (updateError) {
      console.error('[API] Player update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Add loot to inventory if received
    if (combatResult.loot) {
      // Find or create the item
      let { data: item } = await supabase
        .from('items')
        .select('id')
        .eq('name', combatResult.loot)
        .single()

      if (!item) {
        // Find the loot item details from the loot pool
        const lootItem = LOOT_POOL.find(i => i.name === combatResult.loot) || { 
          name: combatResult.loot, 
          rarity: 'common' as const, 
          type: 'consumable' as const
        }

        // Create the item if it doesn't exist
        const { data: newItem, error: itemError } = await supabase
          .from('items')
          .insert({
            name: lootItem.name,
            rarity: lootItem.rarity,
            type: lootItem.type,
          })
          .select('id')
          .single()

        if (itemError) {
          console.error('[API] Error creating item:', itemError)
        } else {
          item = newItem
        }
      }

      if (item) {
        // Add to player inventory (or increment quantity if exists)
        const { data: existingInventory } = await supabase
          .from('player_inventory')
          .select('id, quantity')
          .eq('player_id', player.id)
          .eq('item_id', item.id)
          .single()

        if (existingInventory) {
          // Increment quantity
          await supabase
            .from('player_inventory')
            .update({ quantity: existingInventory.quantity + 1 })
            .eq('id', existingInventory.id)
        } else {
          // Add new item to inventory
          await supabase
            .from('player_inventory')
            .insert({
              player_id: player.id,
              item_id: item.id,
              quantity: 1,
            })
        }
      }
    }

    // Log combat (opponent_id is optional, only if column exists)
    await supabase.from('combat_logs').insert({
      player_id: player.id,
      opponent_name: opponentName,
      outcome: combatResult.outcome,
      damage_dealt: combatResult.damageDealt,
      damage_taken: combatResult.damageTaken,
      credits_earned: combatResult.creditsEarned,
      xp_gained: combatResult.xpGained,
      loot_received: combatResult.loot || null,
    })

    // Set opponent cooldown (15 minutes after fighting, or use opponent's base cooldown)
    const { data: opponent } = await supabase
      .from('opponents')
      .select('cooldown_minutes')
      .eq('id', opponentId)
      .single()

    const baseCooldownMinutes = opponent?.cooldown_minutes || 15
    const cooldownUntil = new Date(Date.now() + baseCooldownMinutes * 60 * 1000)

    await supabase
      .from('opponent_cooldowns')
      .upsert({
        player_id: player.id,
        opponent_id: opponentId,
        fought_at: new Date().toISOString(),
        cooldown_until: cooldownUntil.toISOString(),
      }, {
        onConflict: 'player_id,opponent_id'
      })

    return NextResponse.json({
      ...combatResult,
      xpProgress: {
        current: finalXP,
        max: newXpMax,
        gained: combatResult.xpGained,
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined,
      },
      newHealth,
    })
  } catch (error) {
    console.error('[API] Combat engagement error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

