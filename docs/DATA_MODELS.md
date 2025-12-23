# Data Models Reference

Complete reference for all data structures used in the game.

---

## Core Player Data

### PlayerData
Main player state structure.

```typescript
interface PlayerData {
  // Primary Resources
  credits: number          // Main currency
  alloy: number            // Premium currency
  
  // Progression
  level: number            // Current level
  xpCurrent: number        // Current XP
  xpMax: number            // XP required for next level
  
  // Energy Systems
  charge: number           // Current charge (for contracts)
  chargeMax: number        // Maximum charge
  adrenal: number          // Current adrenal (for combat)
  adrenalMax: number       // Maximum adrenal
  
  // Crew
  crewSize: number         // Current crew count
  crewMax: number          // Maximum crew capacity
  
  // Identity (optional, shown on dashboard)
  handle?: string          // Player username
  rank?: string            // Player rank/title
  syndicate?: string       // Syndicate name
}
```

**Default Values Example:**
```typescript
{
  credits: 125780,
  alloy: 450,
  level: 28,
  xpCurrent: 15420,
  xpMax: 25000,
  charge: 85,
  chargeMax: 100,
  adrenal: 42,
  adrenalMax: 60,
  crewSize: 12,
  crewMax: 20,
  handle: "VOID_RUNNER_X",
  rank: "Shadow Enforcer",
  syndicate: "Eclipse Cartel"
}
```

---

## Contracts System

### Contract
Mission/contract structure.

```typescript
interface Contract {
  id: string
  name: string
  description: string
  energyCost: number       // Charge required
  creditsReward: number    // Credits earned
  xpReward: number         // XP earned
  lootChance: number       // Percentage (0-100)
  difficulty: "easy" | "risky" | "elite" | "event"
}
```

**Difficulty Tiers:**
- `easy`: 15-20 Charge, low rewards, 25-35% loot
- `risky`: 30-45 Charge, medium rewards, 45-65% loot
- `elite`: 45-50 Charge, high rewards, 65-75% loot
- `event`: 40 Charge, special rewards, 90%+ loot

**Example:**
```typescript
{
  id: "1",
  name: "Cargo Run: Proxima Station",
  description: "Transport encrypted data packets to the outer rim.",
  energyCost: 15,
  creditsReward: 2500,
  xpReward: 150,
  lootChance: 25,
  difficulty: "easy"
}
```

### ContractResult
Result after executing a contract.

```typescript
interface ContractResult {
  success: boolean
  creditsEarned: number
  xpEarned: number
  loot?: string            // Optional loot item
  leveledUp: boolean
  newLevel?: number
}
```

---

## Combat System

### Opponent
Combat target structure.

```typescript
interface Opponent {
  id: number
  name: string
  avatar: string           // Emoji or image URL
  powerLevel: number       // Combat power (25-45+)
  credits: number          // Reward on win
  xp: number               // XP reward on win
  adrenalCost: number      // Adrenal required (5-20)
  cooldown: number         // Minutes until can attack again
}
```

**Example:**
```typescript
{
  id: 1,
  name: "Scarlet Viper",
  avatar: "🐍",
  powerLevel: 25,
  credits: 3500,
  xp: 150,
  adrenalCost: 5,
  cooldown: 0
}
```

### FightResult
Combat outcome structure.

```typescript
interface FightResult {
  outcome: "win" | "lose"
  damageDealt: number
  damageTaken: number
  creditsEarned: number    // 0 if lost
  xpGained: number         // Reduced if lost
  streak: number           // Win streak count
  loot?: string            // Optional loot
}
```

---

## Crew System

### CrewMember
Individual crew member (purchased from marketplace).

```typescript
interface CrewMember {
  id: string
  player_id: string
  name: string                    // Predefined name (e.g., "Street Thug", "Assassin")
  role: "Enforcer" | "Hacker" | "Smuggler"
  attack: number                  // Individual attack stat
  defense: number                 // Individual defense stat
  level: number                   // Individual level (starts at 1)
  crew_template_id: string        // Links to crew_templates table
  created_at: string
}
```

**Role Stat Ranges:**
- `Enforcer`: High Attack (85-200), Medium Defense (65-160)
- `Hacker`: Medium Attack (55-150), High Defense (75-190)
- `Smuggler`: Balanced (65-160 Attack, 70-150 Defense)

**Example:**
```typescript
{
  id: "uuid",
  player_id: "player-uuid",
  name: "Assassin",
  role: "Enforcer",
  attack: 160,
  defense: 120,
  level: 1,
  crew_template_id: "template-uuid",
  created_at: "2024-01-01T00:00:00Z"
}
```

### CrewTemplate
Predefined crew member available for purchase in marketplace.

```typescript
interface CrewTemplate {
  id: string
  name: string                    // Unique name (e.g., "Street Thug")
  role: "Enforcer" | "Hacker" | "Smuggler"
  attack: number                  // Base attack stat
  defense: number                 // Base defense stat
  price: number                   // Credits required to purchase
  level_requirement: number       // Player level required
  description: string             // Flavor text
  is_active: boolean              // Whether available in marketplace
}
```

**Tier Examples:**
- **Tier 1 (Lv1)**: Street Thug (85/65), Script Kiddie (55/75), Small-Time Runner (65/70) - 5,000 credits
- **Tier 2 (Lv5-10)**: Veteran Enforcer (120/85), Cyber Specialist (75/110), Heavy Gunner (140/100) - 15,000-25,000 credits
- **Tier 3 (Lv15-20)**: Assassin (160/120), Quantum Hacker (110/150), War Veteran (180/140) - 50,000-75,000 credits
- **Tier 4 (Lv30+)**: Death Dealer (200/160), Reality Hacker (150/190), Void Walker (160/150) - 150,000 credits

### CrewStats
Overall crew statistics.

```typescript
interface CrewStats {
  crewSize: number                // Current number of crew members
  crewMax: number                 // Maximum crew capacity
  totalAttack: number             // Sum of all crew attack stats
  totalDefense: number            // Sum of all crew defense stats
  totalPower: number              // totalAttack + totalDefense
}
```

**Combat Integration:**
- Total crew power is added to player's base power in combat
- `Player Combat Power = (Player Level × 50) + Total Crew Power`
- Higher total power increases win chance in skirmishes

---

## Outposts System

### Outpost
Owned outpost structure.

```typescript
interface Outpost {
  id: number
  name: string
  type: string             // e.g., "Mining Facility"
  level: number           // Upgrade level (1-5+)
  incomeRate: number      // Credits per hour
  availableIncome: number // Accumulated income ready to collect
  upgradeAvailable: boolean
}
```

**Outpost Types:**
- Mining Facility
- Black Market
- Weapons Cache
- Entertainment (Casino)
- Resource Processing (Refinery)
- Command Center

**Example:**
```typescript
{
  id: 1,
  name: "Nebula Station Alpha",
  type: "Mining Facility",
  level: 3,
  incomeRate: 1250,
  availableIncome: 8750,
  upgradeAvailable: true
}
```

### MarketplaceOutpost
Outpost available for purchase.

```typescript
interface MarketplaceOutpost extends Outpost {
  price: number           // Purchase cost in Credits
  requirements?: string   // e.g., "Level 30"
  locked: boolean        // Whether player can purchase
}
```

**Example:**
```typescript
{
  id: 4,
  name: "Starlight Casino",
  type: "Entertainment",
  incomeRate: 3500,
  price: 50000,
  level: 1,
  requirements: undefined,
  locked: false
}
```

---

## Equipment System

### Item
Equipment/item structure.

```typescript
interface Item {
  id: string
  name: string
  rarity: "common" | "rare" | "epic" | "legendary"
  type: "weapon" | "armor" | "gadget" | "consumable"
  attackBoost?: number    // For weapons
  defenseBoost?: number   // For armor
  specialBoost?: string   // Special effect description
}
```

**Rarity Tiers:**
- `common`: Basic stats, no special effects
- `rare`: Moderate stats + special effect
- `epic`: High stats + strong special effect
- `legendary`: Maximum stats + powerful special effect

**Item Types:**
- `weapon`: Attack bonuses, crit chance, special attacks
- `armor`: Defense bonuses, damage reduction, dodge
- `gadget`: Special bonuses (XP gain, loot chance, tech effects)
- `consumable`: Temporary boosts or resource restoration

**Example:**
```typescript
{
  id: "w1",
  name: "Plasma Rifle MK-7",
  rarity: "epic",
  type: "weapon",
  attackBoost: 85,
  specialBoost: "15% crit chance"
}
```

### Loadout
Currently equipped items.

```typescript
interface Loadout {
  weapon?: Item
  armor?: Item
  gadget?: Item
}
```

---

## Health System

### HealthStatus
Current health state.

```typescript
interface HealthStatus {
  currentHealth: number   // 0-100
  maxHealth: number       // Usually 100
  regenTime: string       // e.g., "2:55:00"
}
```

### CombatLog
Record of recent combat.

```typescript
interface CombatLog {
  time: string            // e.g., "2m ago"
  opponent: string        // Opponent name
  result: "win" | "lose"
  damage: number          // Health lost
  rewards?: number        // Credits earned (if win)
}
```

---

## Progression System

### DailyMission
Daily mission structure.

```typescript
interface DailyMission {
  title: string
  description: string
  progress: number        // Current progress
  total: number          // Required amount
  rewards: {
    credits: number
    xp: number
  }
  completed?: boolean
}
```

**Example:**
```typescript
{
  title: "Complete 3 Contracts",
  description: "Execute any three contracts to prove your worth",
  progress: 2,
  total: 3,
  rewards: { credits: 5000, xp: 500 }
}
```

### StreakData
Login streak information.

```typescript
interface StreakData {
  currentStreak: number   // Days in current streak
  longestStreak: number   // Best streak ever
  nextRewardAt: number    // Streak milestone for reward
}
```

---

## Events & Special Content

### LimitedOffer
Limited-time offer structure.

```typescript
interface LimitedOffer {
  title: string
  description: string
  originalPrice?: number  // Original price (if discounted)
  discountedPrice: number
  discount?: number       // Percentage discount
  timeRemaining: string  // e.g., "6h 45m"
  featured?: boolean     // Highlighted offer
}
```

### SyndicateDirective
Community-wide event.

```typescript
interface SyndicateDirective {
  title: string
  description: string
  type: "defense" | "recruitment" | string
  participants: number   // Current participants
  goal: number          // Target participants
  rewards: {
    credits: number
    xp: number
  }
  timeRemaining: string
}
```

### EventBanner
Event announcement.

```typescript
interface EventBanner {
  title: string
  description: string
  timeRemaining: string
}
```

---

## Activity Feed

### FeedItem
Activity feed entry.

```typescript
interface FeedItem {
  id: string
  icon: React.ComponentType
  eventType: string      // e.g., "Contract Complete"
  message: string
  rewards?: Array<{
    type: "credits" | "xp" | "loot"
    amount: number | string
  }>
  timestamp: string      // e.g., "2m ago"
  priority?: "normal" | "important"
  variant?: "cyan" | "purple" | "orange" | "default"
  category: "all" | "crew" | "contracts" | "skirmish" | "outposts" | "system"
}
```

**Categories:**
- `crew`: Crew-related events
- `contracts`: Contract completions
- `skirmish`: Combat results
- `outposts`: Outpost income/upgrades
- `system`: System notifications

**Example:**
```typescript
{
  id: "1",
  icon: FileText,
  eventType: "Contract Complete",
  message: "Contract executed: Ghost Run. Target neutralized.",
  rewards: [
    { type: "credits", amount: 8500 },
    { type: "xp", amount: 450 }
  ],
  timestamp: "15m ago",
  variant: "cyan",
  category: "contracts"
}
```

---

## Settings

### NotificationSettings
Notification preferences.

```typescript
interface NotificationSettings {
  chargeFull: boolean
  outpostIncome: boolean
  dailyMissions: boolean
  crewInvites: boolean
}
```

### AudioSettings
Audio preferences.

```typescript
interface AudioSettings {
  musicVolume: number    // 0-100
  sfxVolume: number      // 0-100
}
```

### AccessibilitySettings
Accessibility options.

```typescript
interface AccessibilitySettings {
  reduceMotion: boolean
  haptics: boolean
}
```

---

## Type Aliases

### DifficultyFilter
```typescript
type DifficultyFilter = "all" | "easy" | "risky" | "elite" | "event"
```

### FeedFilter
```typescript
type FeedFilter = "all" | "crew" | "contracts" | "skirmish" | "outposts" | "system"
```

### OutpostTab
```typescript
type OutpostTab = "owned" | "marketplace"
```

---

## Notes

- All numeric values are integers unless specified
- Percentages are stored as integers (0-100) not decimals
- Timestamps are relative strings ("2m ago") or ISO strings for backend
- Optional fields use `?` in TypeScript
- All IDs are strings for consistency (except Opponent.id which is number)

---

*For component prop interfaces, see [Component Reference](./COMPONENT_REFERENCE.md)*

