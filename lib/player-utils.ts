// Utility to map database player data to component props format

interface DatabasePlayer {
  credits: number
  alloy: number
  level: number
  xp_current: number
  xp_max: number
  charge: number
  charge_max: number
  adrenal: number
  adrenal_max: number
  crew_size: number
  crew_max: number
  handle?: string
  rank?: string
  syndicate?: string
}

export function mapPlayerToHudData(player: DatabasePlayer) {
  return {
    credits: player.credits,
    alloy: player.alloy,
    level: player.level,
    xpCurrent: player.xp_current,
    xpMax: player.xp_max,
    charge: player.charge,
    chargeMax: player.charge_max,
    adrenal: player.adrenal,
    adrenalMax: player.adrenal_max,
    crewSize: player.crew_size,
    crewMax: player.crew_max,
  }
}


