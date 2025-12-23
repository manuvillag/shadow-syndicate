import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Get recent combat logs
    const { data: logs, error } = await supabase
      .from('combat_logs')
      .select('*')
      .eq('player_id', player.id)
      .order('fought_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format logs for display
    const formattedLogs = logs.map((log) => {
      const foughtAt = new Date(log.fought_at)
      const now = new Date()
      const diffMs = now.getTime() - foughtAt.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)

      let timeAgo = ''
      if (diffMins < 1) {
        timeAgo = 'Just now'
      } else if (diffMins < 60) {
        timeAgo = `${diffMins}m ago`
      } else if (diffHours < 24) {
        timeAgo = `${diffHours}h ago`
      } else {
        timeAgo = `${Math.floor(diffHours / 24)}d ago`
      }

      return {
        time: timeAgo,
        opponent: log.opponent_name,
        result: log.outcome,
        damage: log.damage_taken,
        rewards: log.outcome === 'win' ? log.credits_earned : undefined,
      }
    })

    return NextResponse.json({ logs: formattedLogs })
  } catch (error) {
    console.error('[API] Combat logs fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


