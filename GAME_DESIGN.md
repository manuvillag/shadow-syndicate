# Game Design Document

## 🎮 Shadow Syndicate - Space Mafia Wars Clone

### Vision Statement
A browser-based idle RPG where players build and manage a space crime syndicate, competing with others while completing missions, recruiting crew, and expanding their criminal empire.

---

## Core Gameplay Loop

### Primary Loop (5-15 minutes)
1. **Check Resources** → View Charge/Adrenal levels
2. **Complete Contracts** → Spend Charge, earn Credits/XP
3. **Engage in Skirmishes** → Spend Adrenal, earn Credits/XP
4. **Collect Outpost Income** → Gather passive earnings
5. **Manage Crew** → Recruit new members for bonuses
6. **Upgrade Equipment** → Improve stats for better performance
7. **Check Daily Missions** → Complete objectives for rewards

### Secondary Loop (Daily)
1. **Login** → Maintain streak, collect daily rewards
2. **Complete Daily Missions** → Earn bonus rewards
3. **Participate in Events** → Special limited-time content
4. **Check Comms** → Review activity feed

### Long-term Loop (Weeks/Months)
1. **Level Up** → Unlock new content
2. **Expand Outposts** → Increase passive income
3. **Build Crew** → Maximize bonuses
4. **Compete** → Climb leaderboards
5. **Join Syndicate Events** → Community goals

---

## Game Systems Deep Dive

### 1. Resource Economy

#### Credits (Primary Currency)
- **Earned From**:
  - Contracts (2,500 - 25,000 per contract)
  - Skirmishes (3,500 - 18,000 per win)
  - Outpost income (900 - 10,000+ per hour)
  - Daily missions (3,000 - 8,000)
  - Syndicate events (25,000+)
- **Spent On**:
  - Outpost purchases (50,000 - 500,000+)
  - Outpost upgrades
  - Crew recruitment
  - Equipment purchases (future)
- **Balance Goal**: Encourage active play while allowing progression

#### Alloy (Premium Currency)
- **Earned From**:
  - Purchases (real money)
  - Special events
  - Rare contract rewards
- **Spent On**:
  - Instant healing (50 Alloy)
  - Instant charge/adrenal refill
  - Limited-time offers
  - Premium equipment
- **Balance Goal**: Convenience, not pay-to-win

#### Charge (Energy System)
- **Max**: 100 (increases with level/upgrades)
- **Regeneration**: 1 per 5 minutes (or configurable)
- **Consumption**: 15-50 per contract
- **Purpose**: Gate contract completion, encourage return visits
- **Refill Options**: Time-based, Alloy purchase

#### Adrenal (Combat Energy)
- **Max**: 50-60 (increases with level)
- **Regeneration**: 1 per 6 minutes (or configurable)
- **Consumption**: 5-20 per skirmish
- **Purpose**: Gate PvP combat
- **Refill Options**: Time-based, Alloy purchase

#### Experience Points (XP)
- **Earned From**: All activities
- **Purpose**: Level progression
- **Level Up**: Unlocks new content, increases stats
- **XP Curve**: Exponential (more XP needed per level)

---

### 2. Contracts System

#### Difficulty Tiers

**Easy Contracts**
- Energy Cost: 15-20
- Credit Reward: 2,500 - 3,500
- XP Reward: 150 - 200
- Loot Chance: 25-35%
- Risk: Low
- Target: New players, quick actions

**Risky Contracts**
- Energy Cost: 30-40
- Credit Reward: 8,500 - 12,000
- XP Reward: 450 - 600
- Loot Chance: 55-65%
- Risk: Medium
- Target: Mid-level players

**Elite Contracts**
- Energy Cost: 45-50
- Credit Reward: 18,000 - 25,000
- XP Reward: 950 - 1,200
- Loot Chance: 65-75%
- Risk: High
- Target: Advanced players

**Event Contracts**
- Energy Cost: 40
- Credit Reward: 15,000
- XP Reward: 800
- Loot Chance: 90%
- Risk: Medium-High
- Target: All players (limited time)

#### Contract Mechanics
- **Selection**: Filter by difficulty
- **Confirmation**: Modal shows cost/rewards
- **Execution**: Instant (or with timer for realism)
- **Results**: Success guaranteed (or % chance based on stats)
- **Loot**: Random item drop based on loot chance
- **Cooldowns**: None (limited by Charge)

---

### 3. Skirmish System (PvP)

#### Opponent Scaling
- **Power Level**: Based on player level ±5
- **Rewards**: Scale with opponent power
- **Difficulty**: Higher power = better rewards, harder to win

#### Combat Mechanics
- **Win Chance**: Based on player power vs opponent power
- **Damage**: Calculated from stats + equipment
- **Rewards on Win**: Full credits/XP
- **Rewards on Loss**: 20% XP only
- **Streaks**: Bonus rewards for consecutive wins
- **Cooldowns**: Some opponents have cooldown timers

#### Opponent Types
- **Regular**: Always available, standard rewards
- **Elite**: Higher rewards, longer cooldowns
- **Boss**: Rare spawns, exceptional rewards

---

### 4. Crew System

#### Roles

**Enforcer**
- **Bonus Type**: Combat power
- **Examples**: +15% Combat DMG, +10% Combat DEF, +16% ATK Power
- **Use Case**: Improve skirmish performance
- **Synergy**: Multiple enforcers stack bonuses

**Hacker**
- **Bonus Type**: Tech operations
- **Examples**: +12% Hack Speed, +13% Tech Bonus, +15% Exploit Chance
- **Use Case**: Improve contract success rates
- **Synergy**: Multiple hackers stack bonuses

**Smuggler**
- **Bonus Type**: Resource income
- **Examples**: +18% Loot Chance, +11% Income Rate, +19% Trade Bonus
- **Use Case**: Increase earnings
- **Synergy**: Multiple smugglers stack bonuses

#### Crew Mechanics
- **Recruitment**: Costs Credits (scales with level)
- **Leveling**: Crew members level up (improves bonuses)
- **Size Limits**: Start at 10-15, increase with level
- **Milestones**: Bonus at 15, 20, 25, etc. members
- **Role Balance**: Encourage diverse crew composition

---

### 5. Outposts System

#### Outpost Types

**Mining Facility**
- **Income**: Low-medium (900-1,500/hr)
- **Upgrade Cost**: Low
- **Purpose**: Early game income

**Black Market**
- **Income**: Medium-high (2,800-5,000/hr)
- **Upgrade Cost**: Medium
- **Purpose**: Mid-game income

**Weapons Cache**
- **Income**: Medium (900-2,000/hr)
- **Upgrade Cost**: Medium
- **Purpose**: Thematic variety

**Entertainment (Casino)**
- **Income**: High (3,500-7,000/hr)
- **Upgrade Cost**: High
- **Purpose**: Late game income

**Resource Processing (Refinery)**
- **Income**: Very High (5,000-10,000/hr)
- **Upgrade Cost**: Very High
- **Requirements**: Level 30+
- **Purpose**: End game income

**Command Center (HQ)**
- **Income**: Exceptional (10,000+/hr)
- **Upgrade Cost**: Exceptional
- **Requirements**: Level 40+, 5 Outposts
- **Purpose**: Prestige income

#### Outpost Mechanics
- **Income Generation**: Passive, accumulates over time
- **Collection**: Manual collection (or auto-collect premium)
- **Upgrades**: Increase income rate, cost scales exponentially
- **Purchase**: One-time cost, permanent income
- **Balance**: Encourage active collection, reward investment

---

### 6. Loadout System

#### Equipment Rarity

**Common**
- **Stats**: Low bonuses
- **Availability**: Frequent drops
- **Use Case**: Early game, filler

**Rare**
- **Stats**: Medium bonuses
- **Availability**: Occasional drops
- **Use Case**: Mid game standard

**Epic**
- **Stats**: High bonuses
- **Availability**: Rare drops
- **Use Case**: Late game standard

**Legendary**
- **Stats**: Exceptional bonuses
- **Availability**: Very rare drops, events
- **Use Case**: End game, prestige

#### Equipment Slots
- **Weapon**: One equipped (attack boost)
- **Armor**: One equipped (defense boost)
- **Gadget**: One equipped (special bonus)
- **Consumables**: Inventory (one-time use)

#### Equipment Effects
- **Weapons**: Direct attack power increase
- **Armor**: Direct defense increase
- **Gadgets**: Percentage bonuses (XP%, Loot%, etc.)
- **Consumables**: Temporary buffs or instant effects

---

### 7. Progression System

#### Leveling
- **XP Sources**: All activities
- **XP Curve**: Exponential (each level requires more XP)
- **Level Benefits**:
  - Unlock new contracts
  - Unlock new outposts
  - Increase max Charge/Adrenal
  - Increase crew size limit
  - Unlock equipment tiers

#### Rank System
- **Ranks**: Based on level milestones
- **Examples**: Shadow Enforcer, Void Runner, etc.
- **Purpose**: Prestige, unlocks

#### Power Level
- **Calculation**: Level + Equipment + Crew bonuses
- **Purpose**: Skirmish matchmaking, contract difficulty

---

### 8. Daily Systems

#### Daily Missions
- **Reset**: Every 24 hours
- **Types**:
  - Complete X contracts
  - Win X skirmishes
  - Collect outpost income
  - Recruit crew members
- **Rewards**: Credits, XP, sometimes Alloy
- **Purpose**: Encourage daily engagement

#### Login Streaks
- **Mechanic**: Consecutive daily logins
- **Rewards**: Increase with streak length
- **Milestones**: 3, 7, 10, 15, 30 days
- **Reset**: Lose streak if miss a day

#### Limited-Time Offers
- **Frequency**: Daily or weekly
- **Content**: Equipment bundles, resource packs
- **Discount**: 20-40% off
- **Purpose**: Monetization, urgency

#### Syndicate Directives
- **Type**: Community-wide events
- **Mechanic**: All players contribute to shared goal
- **Rewards**: Based on participation
- **Duration**: 2-7 days
- **Purpose**: Social engagement, community building

---

## Balance & Economy

### Resource Flow
```
Credits Flow:
Earn → Contracts, Skirmishes, Outposts, Missions
Spend → Outposts, Crew, Upgrades

Alloy Flow:
Earn → Purchases, Events
Spend → Convenience, Premium Items

Energy Flow:
Regenerate → Time-based
Consume → Activities
Refill → Alloy purchase
```

### Time Gates
- **Charge Regeneration**: ~8 hours for full refill
- **Adrenal Regeneration**: ~5 hours for full refill
- **Outpost Income**: Collect every 4-8 hours
- **Daily Reset**: 24 hours
- **Purpose**: Encourage return visits, prevent burnout

### Progression Pacing
- **Early Game** (Levels 1-10): Fast progression, tutorial
- **Mid Game** (Levels 11-25): Steady progression, systems unlock
- **Late Game** (Levels 26-40): Slower progression, optimization
- **End Game** (Level 40+): Prestige, competition, events

---

## Monetization Strategy

### Free-to-Play Elements
- All core gameplay accessible
- Energy regenerates naturally
- All content unlockable through play

### Premium Elements
- **Alloy Purchases**: Convenience (instant refills, healing)
- **Limited Offers**: Equipment bundles, resource packs
- **Premium Outposts**: Exclusive high-income properties
- **Cosmetics**: Future - skins, themes

### Balance Philosophy
- **Pay for Convenience**: Not pay-to-win
- **Time vs Money**: Players can progress with time or money
- **Fair Competition**: No exclusive PvP advantages from purchases

---

## Social Features (Future)

### Syndicates/Guilds
- Join or create syndicates
- Syndicate chat
- Shared goals and rewards
- Leaderboards

### Alliances
- Form alliances with other players
- Alliance wars
- Shared resources

### Leaderboards
- Global rankings
- Category rankings (Level, Credits, Power)
- Seasonal competitions

---

## Content Roadmap

### Phase 1: Core Systems (Current)
- ✅ Basic UI/UX
- ✅ Resource systems
- ✅ Contracts
- ✅ Skirmish
- ✅ Crew
- ✅ Outposts
- ✅ Loadout
- ✅ Medbay

### Phase 2: Backend Integration
- [ ] Database schema
- [ ] API endpoints
- [ ] Authentication
- [ ] Real-time updates
- [ ] Persistent state

### Phase 3: Advanced Features
- [ ] Leaderboards
- [ ] Events system
- [ ] Advanced combat
- [ ] Equipment crafting
- [ ] Story missions

### Phase 4: Social Features
- [ ] Syndicates
- [ ] Chat system
- [ ] Alliances
- [ ] Trading

---

## Design Principles

1. **Mobile-First**: Optimize for mobile devices
2. **Quick Sessions**: 5-15 minute play sessions
3. **Clear Feedback**: Visual rewards, animations
4. **Progressive Disclosure**: Unlock systems gradually
5. **Fair Economy**: Balance free and premium
6. **Engaging Loop**: Always something to do
7. **Social Elements**: Community engagement
8. **Regular Updates**: New content, events

---

**Last Updated**: [Current Date]

