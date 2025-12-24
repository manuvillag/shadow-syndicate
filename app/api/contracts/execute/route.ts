import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'
import { getRankForLevel, calculateXPForLevel } from '@/lib/level-system'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contractId } = await request.json()

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 })
    }

    // Get player data
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Regenerate energy first
    await supabase.rpc('regenerate_energy')

    // Get updated player data
    const { data: updatedPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const currentPlayer = updatedPlayer || player

    // Get contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .eq('is_active', true)
      .single()

    if (contractError || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Check level requirement
    const levelRequirement = contract.level_requirement || (contract.difficulty === 'easy' ? 1 : contract.difficulty === 'risky' ? 5 : contract.difficulty === 'elite' ? 15 : 10)
    if (currentPlayer.level < levelRequirement) {
      return NextResponse.json(
        { error: `Contract requires level ${levelRequirement}. You are level ${currentPlayer.level}.` },
        { status: 400 }
      )
    }

    // Check if player has enough charge
    if (currentPlayer.charge < contract.energy_cost) {
      return NextResponse.json(
        { error: 'Insufficient charge', currentCharge: currentPlayer.charge, required: contract.energy_cost },
        { status: 400 }
      )
    }

    // Get player's outposts to check for bonuses
    const { data: outposts } = await supabase
      .from('outposts')
      .select(`
        *,
        outpost_templates:outpost_template_id (
          special_features
        )
      `)
      .eq('player_id', currentPlayer.id)

    // Calculate outpost bonuses
    let contractBonus = 0 // Data Center Delta: +10% per level
    let smugglingBonus = 0 // Smuggler's Dock: +25% per level for smuggling contracts
    const isSmugglingContract = contract.type?.toLowerCase().includes('smuggl') || 
                                 contract.name?.toLowerCase().includes('smuggl') ||
                                 contract.description?.toLowerCase().includes('smuggl')

    for (const outpost of outposts || []) {
      const template = outpost.outpost_templates as any
      const specialFeatures = template?.special_features

      if (!specialFeatures || !specialFeatures.type) continue

      if (specialFeatures.type === 'contract_bonus') {
        // Data Center Delta: boosts all contract payouts
        contractBonus += (specialFeatures.value || 0) * outpost.level
      } else if (specialFeatures.type === 'smuggling_bonus' && isSmugglingContract) {
        // Smuggler's Dock: bonus for smuggling contracts only
        smugglingBonus += (specialFeatures.value || 0) * outpost.level
      }
    }

    // Apply bonuses to credits reward
    const baseCreditsReward = contract.credits_reward
    const contractBonusAmount = Math.floor(baseCreditsReward * (contractBonus / 100))
    const smugglingBonusAmount = Math.floor(baseCreditsReward * (smugglingBonus / 100))
    const finalCreditsReward = baseCreditsReward + contractBonusAmount + smugglingBonusAmount

    // Calculate base success rate based on difficulty tier
    const tierBaseSuccessRate = {
      easy: 0.95,
      risky: 0.75,
      elite: 0.50,
      event: 0.60,
    }[contract.difficulty] || 0.75

    // Within-tier difficulty modifier based on energy cost
    // Higher energy cost = slightly harder = lower success rate
    // This creates variation within the same difficulty tier
    let energyModifier = 0
    if (contract.difficulty === 'easy') {
      // Easy tier: -2% per 2 energy above minimum (10)
      // Package Delivery (10): 95%, Data Retrieval (12): 93%
      const minEnergy = 10
      energyModifier = -Math.floor((contract.energy_cost - minEnergy) / 2) * 0.02
    } else if (contract.difficulty === 'risky') {
      // Risky tier: -2% per 3 energy above minimum (15)
      // Debt Collection (15): 75%, Smuggling Run (18): 73%, Sabotage (20): 73%
      const minEnergy = 15
      energyModifier = -Math.floor((contract.energy_cost - minEnergy) / 3) * 0.02
    } else if (contract.difficulty === 'elite') {
      // Elite tier: -2% per 5 energy above minimum (25)
      // Creates more variation: Assassination (25): 50%, Espionage (30): 48%, Recovery (35): 46%, Takeover (40): 44%, War (50): 40%, Corp Assassination (60): 36%, Reality Breach (75): 30%
      const minEnergy = 25
      energyModifier = -Math.floor((contract.energy_cost - minEnergy) / 5) * 0.02
    } else if (contract.difficulty === 'event') {
      // Event tier: -2% per 5 energy above minimum (50)
      const minEnergy = 50
      energyModifier = -Math.floor((contract.energy_cost - minEnergy) / 5) * 0.02
    }

    // Level modifier: +5% per level above requirement (max +20% for very over-leveled), no penalty if at requirement
    const levelDiff = currentPlayer.level - levelRequirement
    let levelModifier = 0
    if (levelDiff > 0) {
      levelModifier = Math.min(0.20, levelDiff * 0.05) // +5% per level above, max +20% (allows up to 100%)
    }
    // No negative modifier - if player is below requirement, contract is blocked (handled earlier)

    // Calculate final base success rate (tier base + energy modifier)
    const baseSuccessRate = Math.max(0.30, tierBaseSuccessRate + energyModifier) // Minimum 30% base
    
    // Final success rate with level modifier (no upper cap, allows 100% for very over-leveled players)
    const successRate = Math.max(0.05, Math.min(1.0, baseSuccessRate + levelModifier))
    const success = Math.random() < successRate

    // Calculate failure consequences
    let healthLoss = 0
    let creditLoss = 0
    let xpGained = 0
    let lootItem: string | null = null

    if (success) {
      // Success: Full rewards
      xpGained = contract.xp_reward
      const gotLoot = Math.random() * 100 < contract.loot_chance
      lootItem = gotLoot ? 'Rare Tech Module' : null
    } else {
      // Failure: Penalties based on difficulty
      if (contract.difficulty === 'risky') {
        creditLoss = Math.floor(finalCreditsReward * 0.10) // Lose 10% of reward as damages
        xpGained = Math.floor(contract.xp_reward * 0.25) // Only 25% XP on failure
      } else if (contract.difficulty === 'elite') {
        creditLoss = Math.floor(finalCreditsReward * 0.25) // Lose 25% of reward as damages
        healthLoss = 5 + Math.floor(Math.random() * 11) // 5-15 HP loss
        xpGained = Math.floor(contract.xp_reward * 0.25) // Only 25% XP on failure
      } else if (contract.difficulty === 'event') {
        creditLoss = Math.floor(finalCreditsReward * 0.15) // Lose 15% of reward
        xpGained = Math.floor(contract.xp_reward * 0.50) // 50% XP on failure
      } else {
        // Easy: Just lose energy, no other penalties
        xpGained = 0
      }
    }

    // Calculate new XP and check for level up
    const newXp = currentPlayer.xp_current + xpGained
    let currentLevel = currentPlayer.level
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

    // Calculate final credits (success gets reward, failure loses penalty)
    const finalCredits = success 
      ? currentPlayer.credits + finalCreditsReward
      : currentPlayer.credits - creditLoss

    // Calculate new health (apply health loss on failure)
    const newHealth = Math.max(0, currentPlayer.health - healthLoss)

    // Update player (including rank if leveled up)
    const newRank = leveledUp ? getRankForLevel(newLevel) : currentPlayer.rank
    
    // If health decreased, reset last_health_regen so regeneration starts from now
    const updateData: any = {
      charge: currentPlayer.charge - contract.energy_cost, // Always consume energy
      credits: finalCredits,
      health: newHealth,
      xp_current: finalXP,
      xp_max: newXpMax,
      level: newLevel,
      rank: newRank,
      updated_at: new Date().toISOString(),
    }
    
    // Reset health regeneration timer if health decreased
    if (newHealth < currentPlayer.health) {
      updateData.last_health_regen = new Date().toISOString()
    }
    
    const { error: updateError } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', currentPlayer.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log execution
    await supabase.from('contract_executions').insert({
      player_id: currentPlayer.id,
      contract_id: contractId,
      success,
      credits_earned: success ? finalCreditsReward : -creditLoss,
      xp_earned: xpGained,
      loot_received: lootItem,
    })

    return NextResponse.json({
      success,
      successRate: Math.round(successRate * 100),
      rewards: success ? {
        credits: finalCreditsReward,
        creditsBase: baseCreditsReward,
        creditsBonus: contractBonusAmount + smugglingBonusAmount,
        xp: xpGained,
        loot: lootItem,
      } : {
        credits: -creditLoss,
        creditsLost: creditLoss,
        xp: xpGained,
        healthLost: healthLoss,
        message: contract.difficulty === 'easy' 
          ? 'Mission failed. Energy consumed, but no other penalties.'
          : contract.difficulty === 'risky'
          ? 'Mission failed. Lost 10% of potential reward as damages.'
          : 'Mission failed. Lost 25% of potential reward and took damage.'
      },
      xpProgress: {
        current: finalXP,
        max: newXpMax,
        gained: xpGained,
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined,
      },
      health: {
        current: newHealth,
        max: currentPlayer.health_max,
        lost: healthLoss,
      },
    })
  } catch (error) {
    console.error('[API] Contract execution error:', error)
    return handleApiError(error, 'Failed to execute contract')
  }
}


