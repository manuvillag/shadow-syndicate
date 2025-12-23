import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Get activity feed for Comms page
 * Aggregates events from contracts, combat, crew, outposts, etc.
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
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const feedItems: any[] = []

    // Get recent contract executions (last 20)
    const { data: contractExecutions } = await supabase
      .from('contract_executions')
      .select(`
        *,
        contracts (
          name
        )
      `)
      .eq('player_id', player.id)
      .order('executed_at', { ascending: false })
      .limit(10)

    if (contractExecutions) {
      for (const exec of contractExecutions) {
        const contract = exec.contracts as any
        feedItems.push({
          id: `contract-${exec.id}`,
          icon: 'FileText',
          eventType: exec.success ? 'Contract Complete' : 'Contract Failed',
          message: exec.success
            ? `Contract executed: ${contract?.name || 'Unknown'}. Target neutralized.`
            : `Contract failed: ${contract?.name || 'Unknown'}. Mission aborted.`,
          rewards: exec.success
            ? [
                { type: 'credits', amount: exec.credits_earned },
                { type: 'xp', amount: exec.xp_earned },
                ...(exec.loot_received ? [{ type: 'loot', amount: exec.loot_received }] : []),
              ]
            : undefined,
          timestamp: exec.executed_at,
          variant: 'cyan',
          category: 'contracts',
        })
      }
    }

    // Get recent combat logs (last 10)
    const { data: combatLogs } = await supabase
      .from('combat_logs')
      .select('*')
      .eq('player_id', player.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (combatLogs) {
      for (const log of combatLogs) {
        feedItems.push({
          id: `combat-${log.id}`,
          icon: 'Swords',
          eventType: log.victory ? 'Skirmish Victory' : 'Skirmish Defeat',
          message: log.victory
            ? `Defeated ${log.opponent_name} in combat. Reputation increased.`
            : `Defeated by ${log.opponent_name}. Health lost: ${log.damage_taken} HP.`,
          rewards: log.victory
            ? [
                { type: 'credits', amount: log.credits_earned },
                { type: 'xp', amount: log.xp_earned },
                ...(log.loot_received ? [{ type: 'loot', amount: log.loot_received }] : []),
              ]
            : undefined,
          timestamp: log.created_at,
          variant: log.victory ? 'purple' : 'default',
          category: 'skirmish',
        })
      }
    }

    // Get recent crew members (last 5)
    const { data: crewMembers } = await supabase
      .from('crew_members')
      .select('*')
      .eq('player_id', player.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (crewMembers) {
      for (const member of crewMembers) {
        feedItems.push({
          id: `crew-${member.id}`,
          icon: 'Users',
          eventType: 'Crew Activity',
          message: `${member.name} joined your crew. ${member.role} role assigned.`,
          timestamp: member.created_at,
          variant: 'default',
          category: 'crew',
        })
      }
    }

    // Get recent outpost collections (we'd need to track this, but for now we can check last_collected_at)
    // This is a simplified version - in a real system you'd have a separate activity log
    const { data: outposts } = await supabase
      .from('outposts')
      .select('name, last_collected_at')
      .eq('player_id', player.id)
      .order('last_collected_at', { ascending: false })
      .limit(5)

    if (outposts) {
      for (const outpost of outposts) {
        if (outpost.last_collected_at) {
          feedItems.push({
            id: `outpost-${outpost.name}-${outpost.last_collected_at}`,
            icon: 'Building2',
            eventType: 'Outpost Income',
            message: `${outpost.name} income collected.`,
            timestamp: outpost.last_collected_at,
            variant: 'orange',
            category: 'outposts',
          })
        }
      }
    }

    // Sort by timestamp (newest first)
    feedItems.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return timeB - timeA
    })

    // Format timestamps to relative time
    const now = new Date()
    const formattedFeed = feedItems.map((item) => {
      const time = new Date(item.timestamp)
      const diffMs = now.getTime() - time.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      let timestamp = ''
      if (diffMins < 1) {
        timestamp = 'Just now'
      } else if (diffMins < 60) {
        timestamp = `${diffMins}m ago`
      } else if (diffHours < 24) {
        timestamp = `${diffHours}h ago`
      } else {
        timestamp = `${diffDays}d ago`
      }

      return {
        ...item,
        timestamp,
      }
    })

    return NextResponse.json({ feed: formattedFeed })
  } catch (error) {
    console.error('[API] Comms feed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

