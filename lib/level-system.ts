/**
 * Level System Utilities
 * Handles XP curves, level calculations, and rank progression
 */

/**
 * Calculate XP required for a given level
 * Formula: baseXP + (level - 1) * incrementPerLevel
 * This creates a linear progression that scales better with XP rewards
 * Level 1→2: 500 XP
 * Level 2→3: 750 XP (500 + 250)
 * Level 3→4: 1000 XP (750 + 250)
 * Level 4→5: 1250 XP (1000 + 250)
 * Level 5→6: 1500 XP (1250 + 250)
 * etc.
 * 
 * After level 10, increment increases to 500 per level
 * After level 20, increment increases to 1000 per level
 */
export function calculateXPForLevel(level: number): number {
  const baseXP = 500 // Starting XP requirement
  
  if (level <= 1) return baseXP
  
  // Linear progression with increasing increments at milestones
  let totalXP = baseXP
  for (let i = 2; i <= level; i++) {
    if (i <= 10) {
      totalXP += 250 // +250 per level for levels 2-10
    } else if (i <= 20) {
      totalXP += 500 // +500 per level for levels 11-20
    } else if (i <= 30) {
      totalXP += 1000 // +1000 per level for levels 21-30
    } else {
      totalXP += 2000 // +2000 per level for levels 31+
    }
  }
  
  return totalXP
}

/**
 * Calculate total XP needed to reach a level from level 1
 */
export function calculateTotalXPForLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += calculateXPForLevel(i)
  }
  return total
}

/**
 * Get rank/title based on level
 * Ranks progress as players level up
 */
export function getRankForLevel(level: number): string {
  if (level >= 50) return 'Shadow Master'
  if (level >= 40) return 'Void Lord'
  if (level >= 35) return 'Nexus Commander'
  if (level >= 30) return 'Elite Operative'
  if (level >= 25) return 'Shadow Enforcer'
  if (level >= 20) return 'Void Runner'
  if (level >= 15) return 'Syndicate Agent'
  if (level >= 10) return 'Street Veteran'
  if (level >= 5) return 'Rookie Operator'
  return 'Initiate'
}

/**
 * Starting stats for new players
 */
export const STARTING_STATS = {
  level: 1,
  xp_current: 0,
  xp_max: 500,
  credits: 10000,
  alloy: 0,
  charge: 100,
  charge_max: 100,
  adrenal: 50,
  adrenal_max: 50,
  health: 100,
  health_max: 100,
  crew_size: 0,
  crew_max: 5,
  rank: 'Initiate',
  syndicate: 'Independent',
} as const

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXP(totalXP: number): number {
  let level = 1
  let xpNeeded = 0
  
  while (xpNeeded <= totalXP) {
    xpNeeded += calculateXPForLevel(level)
    if (xpNeeded > totalXP) break
    level++
  }
  
  return level
}

/**
 * Get XP breakdown for display
 */
export function getXPBreakdown(currentLevel: number, currentXP: number) {
  const xpForCurrentLevel = calculateXPForLevel(currentLevel)
  const xpForNextLevel = calculateXPForLevel(currentLevel + 1)
  const totalXPForCurrentLevel = calculateTotalXPForLevel(currentLevel)
  const totalXPForNextLevel = calculateTotalXPForLevel(currentLevel + 1)
  
  return {
    currentLevel,
    currentXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpNeededForNextLevel: xpForNextLevel - currentXP,
    totalXPForCurrentLevel,
    totalXPForNextLevel,
    progress: (currentXP / xpForNextLevel) * 100,
  }
}

