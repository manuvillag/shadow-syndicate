# Component Reference

## Shared Components

### HudBar
**Location**: `components/hud-bar.tsx`

Displays player resources and stats at the top of every page.

**Props:**
```typescript
interface HudBarProps {
  credits: number
  alloy: number
  level: number
  xpCurrent: number
  xpMax: number
  charge: number
  chargeMax: number
  adrenal: number
  adrenalMax: number
  crewSize: number
  crewMax: number
}
```

**Usage**: Included on every page to show current resources.

---

### BottomNav
**Location**: `components/bottom-nav.tsx`

Bottom navigation bar for main sections.

**Props:**
```typescript
interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}
```

**Tabs**: `home`, `contracts`, `skirmish`, `crew`, `outposts`, etc.

---

### IdentityCard
**Location**: `components/identity-card.tsx`

Displays player identity (handle, rank, syndicate) on main dashboard.

**Props:**
```typescript
interface IdentityCardProps {
  handle: string
  rank: string
  syndicate: string
}
```

---

## Feature Components

### ContractCard
**Location**: `components/contract-card.tsx`

Displays a contract with details and action button.

**Props:**
```typescript
interface ContractCardProps {
  id: string
  name: string
  description: string
  energyCost: number
  creditsReward: number
  xpReward: number
  lootChance: number
  difficulty: "easy" | "risky" | "elite" | "event"
  onRunContract: () => void
}
```

---

### ContractConfirmationModal
**Location**: `components/contract-confirmation-modal.tsx`

Confirmation dialog before executing a contract.

**Props:**
```typescript
interface ContractConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contractName: string
  energyCost: number
  creditsReward: number
  xpReward: number
  lootChance: number
  currentCharge: number
  onConfirm: () => void
}
```

---

### ResultModal
**Location**: `components/result-modal.tsx`

Shows results after completing a contract or action.

**Props:**
```typescript
interface ResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  outcome: "success" | "failure"
  rewards: {
    credits: number
    xp: number
    loot?: string
  }
  xpProgress: {
    current: number
    max: number
    gained: number
    leveledUp: boolean
    newLevel?: number
  }
  flavorText: string
  onRunAnother?: () => void
  onBackToHome: () => void
}
```

---

### OpponentCard
**Location**: `components/opponent-card.tsx`

Displays an opponent in the skirmish page.

**Props:**
```typescript
interface OpponentCardProps {
  id: number
  name: string
  avatar: string
  powerLevel: number
  credits: number
  xp: number
  adrenalCost: number
  cooldown: number
  playerPower: number
  currentAdrenal: number
  onEngage: () => void
}
```

---

### FightResultModal
**Location**: `components/fight-result-modal.tsx`

Shows combat results after a skirmish.

**Props:**
```typescript
interface FightResultModalProps {
  open: boolean
  onClose: () => void
  result: {
    outcome: "win" | "lose"
    damageDealt: number
    damageTaken: number
    creditsEarned: number
    xpGained: number
    streak: number
    loot?: string
  }
}
```

---

### CrewMemberCard
**Location**: `components/crew-member-card.tsx`

Displays a crew member with their stats.

**Props:**
```typescript
interface CrewMemberCardProps {
  name: string
  role: "Enforcer" | "Hacker" | "Smuggler"
  level: number
  bonus: string
}
```

---

### CrewStatsCard
**Location**: `components/crew-stats-card.tsx`

Shows overall crew statistics.

**Props:**
```typescript
interface CrewStatsCardProps {
  crewSize: number
  crewMax: number
  totalBonus: number
  nextMilestone: number
  nextBonus: string
}
```

---

### CrewMarketplaceCard
**Location**: `components/crew-marketplace-card.tsx`

Card displaying a crew member available for purchase in the marketplace.

**Props:**
```typescript
interface CrewMarketplaceCardProps {
  id: string
  name: string
  role: "Enforcer" | "Hacker" | "Smuggler"
  attack: number
  defense: number
  price: number
  levelRequirement: number
  description?: string | null
  playerLevel: number
  playerCredits: number
  onPurchase: () => void
  purchasing?: boolean
}
```

**Note:** The old `RecruitPanel` component has been replaced with a marketplace system where players purchase predefined crew members instead of recruiting random ones.

---

### OutpostCard
**Location**: `components/outpost-card.tsx`

Displays an owned outpost with income and upgrade options.

**Props:**
```typescript
interface OutpostCardProps {
  id: number
  name: string
  type: string
  level: number
  incomeRate: number
  availableIncome: number
  upgradeAvailable: boolean
  onCollect: () => void
  onUpgrade: () => void
}
```

---

### MarketplaceCard
**Location**: `components/marketplace-card.tsx`

Displays an outpost available for purchase.

**Props:**
```typescript
interface MarketplaceCardProps {
  id: number
  name: string
  type: string
  incomeRate: number
  price: number
  level: number
  requirements?: string
  locked: boolean
  onPurchase: () => void
}
```

---

### ItemCard
**Location**: `components/item-card.tsx`

Displays an equipment item in the loadout.

**Props:**
```typescript
interface ItemCardProps {
  id: string
  name: string
  rarity: "common" | "rare" | "epic" | "legendary"
  type: "weapon" | "armor" | "gadget" | "consumable"
  attackBoost?: number
  defenseBoost?: number
  specialBoost?: string
  equipped: boolean
  onEquip: () => void
}
```

---

### HealthStatusCard
**Location**: `components/health-status-card.tsx`

Shows current health status in medbay.

**Props:**
```typescript
interface HealthStatusCardProps {
  currentHealth: number
  maxHealth: number
  regenTime: string  // e.g., "2:55:00"
}
```

---

### HealOptionsCard
**Location**: `components/heal-options-card.tsx`

Displays healing options.

**Props:**
```typescript
interface HealOptionsCardProps {
  currentHealth: number
  maxHealth: number
  alloyCost: number
  onHeal: (type: "free" | "instant") => void
}
```

---

### CombatLogCard
**Location**: `components/combat-log-card.tsx`

Shows recent combat history.

**Props:**
```typescript
interface CombatLogCardProps {
  logs: Array<{
    time: string
    opponent: string
    result: "win" | "lose"
    damage: number
    rewards?: number
  }>
}
```

---

### FeedItemCard
**Location**: `components/feed-item-card.tsx`

Displays an item in the comms feed.

**Props:**
```typescript
interface FeedItemCardProps {
  id: string
  icon: React.ComponentType
  eventType: string
  message: string
  rewards?: Array<{
    type: "credits" | "xp" | "loot"
    amount: number | string
  }>
  timestamp: string
  priority?: "normal" | "important"
  variant?: "cyan" | "purple" | "orange" | "default"
}
```

---

### MissionCard
**Location**: `components/mission-card.tsx`

Displays a daily mission in the overseer page.

**Props:**
```typescript
interface MissionCardProps {
  title: string
  description: string
  progress: number
  total: number
  rewards: {
    credits: number
    xp: number
  }
  completed?: boolean
}
```

---

### LimitedOfferCard
**Location**: `components/limited-offer-card.tsx`

Displays a limited-time offer.

**Props:**
```typescript
interface LimitedOfferCardProps {
  title: string
  description: string
  originalPrice?: number
  discountedPrice: number
  discount?: number
  timeRemaining: string
  featured?: boolean
}
```

---

### SyndicateDirectiveCard
**Location**: `components/syndicate-directive-card.tsx`

Displays a syndicate-wide directive/event.

**Props:**
```typescript
interface SyndicateDirectiveCardProps {
  title: string
  description: string
  type: "defense" | "recruitment" | string
  participants: number
  goal: number
  rewards: {
    credits: number
    xp: number
  }
  timeRemaining: string
}
```

---

### EventBanner
**Location**: `components/event-banner.tsx`

Banner for special events.

**Props:**
```typescript
interface EventBannerProps {
  title: string
  description: string
  timeRemaining: string
}
```

---

### StreakTracker
**Location**: `components/streak-tracker.tsx`

Tracks daily login streaks.

**Props:**
```typescript
interface StreakTrackerProps {
  currentStreak: number
  longestStreak: number
  nextRewardAt: number
}
```

---

## UI Primitives (shadcn/ui)

All UI primitives are located in `components/ui/` and follow shadcn/ui patterns.

**Common Components:**
- `Button`: Various variants and sizes
- `Card`: Container component
- `Dialog`: Modal dialogs
- `Tabs`: Tab navigation
- `Switch`: Toggle switches
- `Slider`: Range sliders
- `Toast`: Notification system
- `Badge`: Status badges
- `Avatar`: User avatars
- And more...

**Usage**: Import from `@/components/ui/[component]`

---

## Utility Components

### ResourceChip
**Location**: `components/resource-chip.tsx`

Small chip displaying a resource value.

**Props:**
```typescript
interface ResourceChipProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  variant?: "cyan" | "purple" | "orange" | "default"
}
```

---

### FilterChip
**Location**: `components/filter-chip.tsx`

Filter button/chip for filtering lists.

**Props:**
```typescript
interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
  variant?: "cyan" | "purple" | "orange" | "default"
}
```

---

### ActionTile
**Location**: `components/action-tile.tsx`

Tile button for main dashboard actions.

**Props:**
```typescript
interface ActionTileProps {
  label: string
  icon: React.ComponentType
  variant?: "cyan" | "purple" | "orange" | "default"
  onClick: () => void
  disabled?: boolean
}
```

