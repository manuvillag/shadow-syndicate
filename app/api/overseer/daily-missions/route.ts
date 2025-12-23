import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Get daily missions for the player
 * Tracks progress on various objectives that reset daily
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, level, created_at')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get today's date (UTC midnight)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    // Get player stats for today
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

    // Check which missions have been claimed today
    const { data: claimedMissions } = await supabase
      .from('mission_claims')
      .select('mission_id')
      .eq('player_id', player.id)
      .eq('claim_date', todayStr.split('T')[0])

    const claimedIds = new Set(claimedMissions?.map((c) => c.mission_id) || [])

    // Calculate progress
    const contractsCompleted = contractExecutions?.filter((e) => e.success).length || 0
    const combatsWon = combatLogs?.filter((l) => l.victory).length || 0
    const totalActions = (contractExecutions?.length || 0) + (combatLogs?.length || 0)

    // Define daily missions
    const missions = [
      {
        id: 'daily-contracts',
        title: 'Complete 3 Contracts',
        description: 'Execute and successfully complete 3 contracts today',
        progress: contractsCompleted,
        total: 3,
        rewards: {
          credits: 5000,
          xp: 200,
        },
        timeLimit: 'Resets in 24h',
        completed: contractsCompleted >= 3,
      },
      {
        id: 'daily-combat',
        title: 'Win 2 Skirmishes',
        description: 'Defeat 2 opponents in combat today',
        progress: combatsWon,
        total: 2,
        rewards: {
          credits: 3000,
          xp: 150,
        },
        timeLimit: 'Resets in 24h',
        completed: combatsWon >= 2,
      },
      {
        id: 'daily-activity',
        title: 'Stay Active',
        description: 'Complete 5 total actions (contracts or skirmishes)',
        progress: totalActions,
        total: 5,
        rewards: {
          credits: 2000,
          xp: 100,
        },
        timeLimit: 'Resets in 24h',
        completed: totalActions >= 5,
      },
    ].map((mission) => ({
      ...mission,
      completed: mission.completed || claimedIds.has(mission.id), // Mark as completed if claimed
    }))

    return NextResponse.json({ missions })
  } catch (error) {
    console.error('[API] Daily missions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

