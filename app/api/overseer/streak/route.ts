import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Get player's daily login streak
 * Simple implementation: tracks consecutive days with activity
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
      .select('id, created_at')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get recent activity from multiple sources (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

    // Get activity from contracts
    const { data: contractActivity } = await supabase
      .from('contract_executions')
      .select('executed_at')
      .eq('player_id', player.id)
      .gte('executed_at', thirtyDaysAgoStr)

    // Get activity from skirmishes (combat_logs)
    const { data: combatActivity } = await supabase
      .from('combat_logs')
      .select('fought_at')
      .eq('player_id', player.id)
      .gte('fought_at', thirtyDaysAgoStr)

    // Combine all activity timestamps
    const allActivity: { date: string }[] = []
    if (contractActivity) {
      allActivity.push(...contractActivity.map(a => ({ date: a.executed_at })))
    }
    if (combatActivity) {
      allActivity.push(...combatActivity.map(a => ({ date: a.fought_at })))
    }

    // Calculate streak: count consecutive days with activity
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    
    // Collect unique activity days
    const activityDays = new Set<string>()
    for (const activity of allActivity) {
      const date = new Date(activity.date)
      date.setUTCHours(0, 0, 0, 0)
      activityDays.add(date.toISOString())
    }

    // Calculate current streak (consecutive days from today backwards)
    let currentStreak = 0
    
    // Check if there's activity today
    const todayStr = today.toISOString()
    if (activityDays.has(todayStr)) {
      // Count backwards from today
      for (let i = 0; i < 30; i++) {
        const dateToCheck = new Date(today)
        dateToCheck.setDate(dateToCheck.getDate() - i)
        dateToCheck.setUTCHours(0, 0, 0, 0)
        const dateStr = dateToCheck.toISOString()
        
        if (activityDays.has(dateStr)) {
          currentStreak++
        } else {
          break // Streak broken
        }
      }
    }

    // Calculate longest streak (check all 30 days)
    let longestStreak = 0
    let tempStreak = 0
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      checkDate.setUTCHours(0, 0, 0, 0)
      const dateStr = checkDate.toISOString()

      if (activityDays.has(dateStr)) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    return NextResponse.json({
      currentStreak: Math.max(currentStreak, 0),
      longestStreak: Math.max(longestStreak, 0),
      nextRewardAt: 7, // Next milestone at 7 days
    })
  } catch (error) {
    console.error('[API] Streak error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

