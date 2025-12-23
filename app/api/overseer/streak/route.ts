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

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

    const { data: recentActivity } = await supabase
      .from('contract_executions')
      .select('executed_at')
      .eq('player_id', player.id)
      .gte('executed_at', thirtyDaysAgoStr)
      .order('executed_at', { ascending: false })

    // Calculate streak (simplified - checks if player had activity in last 7 days)
    // In a real system, you'd track daily logins more precisely
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    
    const activityDays = new Set<string>()
    if (recentActivity) {
      for (const activity of recentActivity) {
        const date = new Date(activity.executed_at)
        date.setUTCHours(0, 0, 0, 0)
        activityDays.add(date.toISOString())
      }
    }

    // Simple streak calculation: count consecutive days with activity
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      checkDate.setUTCHours(0, 0, 0, 0)
      const dateStr = checkDate.toISOString()

      if (activityDays.has(dateStr)) {
        tempStreak++
        if (i === 0) {
          currentStreak = tempStreak
        }
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    // If no activity today, streak is 0
    const todayStr = today.toISOString()
    if (!activityDays.has(todayStr)) {
      currentStreak = 0
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

