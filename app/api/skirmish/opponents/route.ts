import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Opponent {
  id: number
  name: string
  avatar: string
  powerLevel: number
  credits: number
  xp: number
  adrenalCost: number
  cooldown: number
}

// Generate opponents based on player level
function generateOpponents(playerLevel: number): Opponent[] {
  const opponents: Opponent[] = []
  const avatars = ['🐍', '👻', '🎯', '💀', '⚔️', '🔥', '🌑', '⚡', '🗡️', '🎭']
  const names = [
    'Scarlet Viper', 'Neon Ghost', 'Void Hunter', 'Cyber Reaper', 'Quantum Blade',
    'Shadow Flame', 'Dark Void', 'Lightning Strike', 'Steel Edge', 'Phantom Mask'
  ]

  // Generate 5 opponents around player's level
  for (let i = 0; i < 5; i++) {
    const levelDiff = (i - 2) * 5 // -10, -5, 0, +5, +10
    const opponentLevel = Math.max(1, playerLevel + levelDiff)
    const powerLevel = opponentLevel

    // Calculate rewards based on level
    const baseCredits = opponentLevel * 150
    const baseXp = opponentLevel * 6
    const adrenalCost = Math.max(5, Math.floor(opponentLevel / 3))

    opponents.push({
      id: i + 1,
      name: names[i % names.length],
      avatar: avatars[i % avatars.length],
      powerLevel,
      credits: baseCredits + Math.floor(Math.random() * baseCredits * 0.3),
      xp: baseXp + Math.floor(Math.random() * baseXp * 0.2),
      adrenalCost,
      cooldown: 0, // TODO: Implement cooldown system
    })
  }

  return opponents
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player level
    const { data: player } = await supabase
      .from('players')
      .select('level')
      .eq('user_id', user.id)
      .single()

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Generate opponents based on player level
    const opponents = generateOpponents(player.level)

    return NextResponse.json({ opponents })
  } catch (error) {
    console.error('[API] Opponents fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


