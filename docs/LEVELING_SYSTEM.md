# Leveling System Documentation

## Starting Stats

When a new player is created, they start with:

```typescript
{
  level: 1,
  xp_current: 0,
  xp_max: 500,        // Need 500 XP to reach level 2
  credits: 10000,     // Starting credits
  alloy: 0,           // Premium currency
  charge: 100,        // Energy for contracts
  charge_max: 100,
  adrenal: 50,        // Energy for combat
  adrenal_max: 50,
  health: 100,        // Health points
  health_max: 100,
  crew_size: 0,       // Current crew members
  crew_max: 5,        // Maximum crew capacity
  rank: 'Initiate',   // Starting rank
  syndicate: 'Independent'
}
```

## XP Curve

The XP requirement increases linearly with tiered increments:

**Formula**: Linear progression with increasing increments at milestones
- Levels 1-10: +250 XP per level
- Levels 11-20: +500 XP per level  
- Levels 21-30: +1000 XP per level
- Levels 31+: +2000 XP per level

### XP Requirements by Level

| Level | XP Required | Total XP to Reach | Contracts Needed* |
|-------|-------------|------------------|-------------------|
| 1 → 2 | 500 | 0 | 2-3 Easy |
| 2 → 3 | 750 | 500 | 4-5 Easy |
| 3 → 4 | 1,000 | 1,250 | 5-7 Easy |
| 4 → 5 | 1,250 | 2,250 | 6-8 Easy |
| 5 → 6 | 1,500 | 3,500 | 8-10 Easy |
| 10 → 11 | 2,750 | 11,250 | 14-18 Easy |
| 20 → 21 | 5,000 | 38,750 | 25-33 Easy |
| 30 → 31 | 10,000 | 101,250 | 50-67 Easy |

*Based on Easy contracts giving 150-200 XP

**Key Points:**
- **Linear progression** - more predictable and balanced
- Early levels are quick (2-3 contracts per level)
- Mid levels require moderate effort (5-10 contracts per level)
- High levels require more effort but remain achievable (10-20 contracts per level)

## Rank/Title Progression

Ranks are automatically updated when you level up:

| Level Range | Rank/Title |
|-------------|------------|
| 1-4 | **Initiate** |
| 5-9 | **Rookie Operator** |
| 10-14 | **Street Veteran** |
| 15-19 | **Syndicate Agent** |
| 20-24 | **Void Runner** |
| 25-29 | **Shadow Enforcer** |
| 30-34 | **Elite Operative** |
| 35-39 | **Nexus Commander** |
| 40-49 | **Void Lord** |
| 50+ | **Shadow Master** |

## Level Up Process

When you gain XP:

1. **XP is added** to your current XP
2. **Check if level up**: If `xp_current >= xp_max`, you level up
3. **Multiple level ups**: If you gain enough XP, you can level up multiple times in one action
4. **Rank update**: Your rank automatically updates based on your new level
5. **XP reset**: After leveling, remaining XP carries over to the next level

### Example Level Up

```
Current: Level 5, 3,000/3,375 XP
Gain: 2,000 XP
Result: 
  - New XP: 5,000
  - Level up to 6 (5,000 >= 3,375)
  - Remaining: 5,000 - 3,375 = 1,625 XP
  - Next level needs: 5,063 XP
  - Final: Level 6, 1,625/5,063 XP
```

## Level Benefits

As you level up:

- **Unlock new contracts** (level requirements)
- **Unlock new equipment** (level requirements in shop)
- **Unlock new crew members** (level requirements in marketplace)
- **Increase combat power** (Level × 50 base power)
- **Higher rank/title** (prestige)

## XP Sources

You gain XP from:
- **Contracts**: 150-1,200 XP (varies by difficulty)
- **Skirmishes**: 6-200 XP (varies by opponent power)
- **Daily Missions**: 200-500 XP
- **Events**: Variable

