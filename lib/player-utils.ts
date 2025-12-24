// Utility to map database player data to component props format

interface DatabasePlayer {
  id?: string
  credits: number
  alloy: number
  level: number
  xp_current: number
  xp_max: number
  charge: number
  charge_max: number
  adrenal: number
  adrenal_max: number
  health?: number
  health_max?: number
  crew_size: number
  crew_max: number
  last_charge_regen?: string
  last_adrenal_regen?: string
  last_health_regen?: string
  handle?: string
  rank?: string
  syndicate?: string
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function calculateRegenTime(
  current: number,
  max: number,
  lastRegen: string | undefined,
  regenRateSeconds: number
): string | undefined {
  if (current >= max || !lastRegen) return undefined
  
  const missing = max - current
  const secondsUntilNext = regenRateSeconds - (Math.floor((Date.now() - new Date(lastRegen).getTime()) / 1000) % regenRateSeconds)
  const totalSeconds = (missing - 1) * regenRateSeconds + secondsUntilNext
  
  return formatTime(totalSeconds)
}

export function mapPlayerToHudData(player: DatabasePlayer) {
  // Regeneration rates (from migration: charge=60s, adrenal=120s, health=300s)
  const chargeRegenTime = calculateRegenTime(
    player.charge,
    player.charge_max,
    player.last_charge_regen,
    60 // 1 per minute
  )
  
  const adrenalRegenTime = calculateRegenTime(
    player.adrenal,
    player.adrenal_max,
    player.last_adrenal_regen,
    120 // 1 per 2 minutes
  )
  
  const healthRegenTime = player.health !== undefined && player.health_max !== undefined
    ? calculateRegenTime(
        player.health,
        player.health_max,
        player.last_health_regen,
        300 // 1 per 5 minutes
      )
    : undefined

  return {
    credits: player.credits,
    alloy: player.alloy,
    xpCurrent: player.xp_current,
    xpMax: player.xp_max,
    charge: player.charge,
    chargeMax: player.charge_max,
    adrenal: player.adrenal,
    adrenalMax: player.adrenal_max,
    health: player.health,
    healthMax: player.health_max,
    chargeRegenTime,
    adrenalRegenTime,
    healthRegenTime,
  }
}

export function formatPlayerId(playerId: string): string {
  // Format UUID to readable format: first 4, middle 4, last 2 groups
  const cleaned = playerId.replace(/-/g, '')
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 10)}`
}


