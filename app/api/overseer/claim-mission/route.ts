import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Claim rewards for a completed daily mission
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { missionId } = body

    if (!missionId) {
      return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 })
    }

    // Get player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, credits, xp, level')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get today's date (UTC midnight)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    // Check if mission is already claimed today
    const { data: existingClaim } = await supabase
      .from('mission_claims')
      .select('id')
      .eq('player_id', player.id)
      .eq('mission_id', missionId)
      .eq('claim_date', todayStr.split('T')[0]) // Just the date part
      .single()

    if (existingClaim) {
      return NextResponse.json({ error: 'Mission already claimed today' }, { status: 400 })
    }
    const { data: contractExecutions } = await supabase
      .from('contract_executions')
      .select('id, success')
      .eq('player_id', player.id)
      .gte('executed_at', todayStr)

    const { data: combatLogs } = await supabase
      .from('combat_logs')
      .select('id, victory')
      .eq('player_id', player.id)
      .gte('created_at', todayStr)

    const contractsCompleted = contractExecutions?.filter((e) => e.success).length || 0
    const combatsWon = combatLogs?.filter((l) => l.victory).length || 0
    const totalActions = (contractExecutions?.length || 0) + (combatLogs?.length || 0)

    // Define mission requirements and rewards
    const missionConfig: Record<string, { required: number; rewards: { credits: number; xp: number } }> = {
      'daily-contracts': {
        required: 3,
        rewards: { credits: 5000, xp: 200 },
      },
      'daily-combat': {
        required: 2,
        rewards: { credits: 3000, xp: 150 },
      },
      'daily-activity': {
        required: 5,
        rewards: { credits: 2000, xp: 100 },
      },
    }

    const config = missionConfig[missionId]
    if (!config) {
      return NextResponse.json({ error: 'Invalid mission ID' }, { status: 400 })
    }

    // Check if mission is complete
    let isComplete = false
    if (missionId === 'daily-contracts') {
      isComplete = contractsCompleted >= config.required
    } else if (missionId === 'daily-combat') {
      isComplete = combatsWon >= config.required
    } else if (missionId === 'daily-activity') {
      isComplete = totalActions >= config.required
    }

    if (!isComplete) {
      return NextResponse.json({ error: 'Mission not completed yet' }, { status: 400 })
    }

    // TODO: Check if already claimed (would need a mission_claims table)
    // For now, we'll allow multiple claims (not ideal, but functional)

    // Calculate new values
    const newCredits = player.credits + config.rewards.credits
    const newXp = player.xp + config.rewards.xp

    // Check for level up
    const xpForNextLevel = Math.floor(100 * Math.pow(1.5, player.level))
    let newLevel = player.level
    let remainingXp = newXp

    // Calculate level ups
    while (remainingXp >= xpForNextLevel && newLevel < 100) {
      remainingXp -= xpForNextLevel
      newLevel++
    }

    // Update player
    const { error: updateError } = await supabase
      .from('players')
      .update({
        credits: newCredits,
        xp: remainingXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', player.id)

    if (updateError) {
      console.error('[API] Claim mission update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Record the claim
    const { error: claimError } = await supabase
      .from('mission_claims')
      .insert({
        player_id: player.id,
        mission_id: missionId,
        claim_date: todayStr.split('T')[0], // Just the date part
        rewards_credits: config.rewards.credits,
        rewards_xp: config.rewards.xp,
      })

    if (claimError) {
      console.error('[API] Mission claim record error:', claimError)
      // Don't fail the request, but log it
    }

    return NextResponse.json({
      success: true,
      rewards: config.rewards,
      newCredits,
      newXp: remainingXp,
      newLevel,
      leveledUp: newLevel > player.level,
    })
  } catch (error) {
    console.error('[API] Claim mission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

