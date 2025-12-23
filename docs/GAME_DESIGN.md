# Game Design Documentation

## Overview

**Shadow Syndicate** is a space-themed mafia wars clone - a browser-based incremental RPG where players manage a space crime syndicate, execute contracts, engage in combat, recruit crew members, and build an empire of outposts.

### Core Concept

Players take on the role of a space crime syndicate operator, building their reputation and power through:
- **Contracts**: Mission-based gameplay for resources and XP
- **Skirmish**: PvP-style combat against other operators
- **Crew Management**: Purchase and manage specialized crew members from marketplace
- **Outposts**: Passive income generation through property management
- **Equipment**: Loadout system for combat bonuses
- **Progression**: Level-based advancement with unlockable content

---

## Game Systems

### 1. Resources

#### Primary Resources
- **Credits**: Main currency, used for purchases, upgrades, and operations
- **Alloy**: Premium currency, used for instant actions and special items
- **Charge**: Energy system for contracts (regenerates over time)
- **Adrenal**: Combat energy for skirmishes (regenerates over time)

#### Secondary Resources
- **XP (Experience)**: Gained from all activities, levels up the player
- **Level**: Player progression indicator, unlocks content
- **Health**: Combat health, decreases in skirmishes, regenerates naturally

### 2. Contracts System

Contracts are mission-based activities that consume Charge and reward Credits, XP, and potential loot.

**Difficulty Tiers:**
- **Easy**: Low risk, standard rewards, 15-20 Charge cost
- **Risky**: Medium risk, better rewards, 30-45 Charge cost
- **Elite**: High risk, high rewards, 45-50 Charge cost
- **Event**: Limited-time special contracts with guaranteed rare loot

**Contract Properties:**
- `energyCost`: Charge required to execute
- `creditsReward`: Credits earned on completion
- `xpReward`: Experience points earned
- `lootChance`: Percentage chance for bonus loot (25-90%)

### 3. Skirmish (Combat) System

PvP-style combat against AI opponents or other players.

**Combat Mechanics:**
- Consumes Adrenal (5-20 based on opponent difficulty)
- Power Level determines success chance
- Rewards: Credits, XP, potential loot
- Cooldown system for repeated attacks
- Win/Loss affects rewards and health

**Power Calculation:**
- `Player Power = (Player Level × 50) + Total Crew Power`
- `Total Crew Power = Sum of all crew Attack + Defense stats`
- Higher power = better win chance and rewards

**Opponent Scaling:**
- Opponents have Power Levels (25-45+)
- Higher power = better rewards but harder to defeat
- Player's level and crew power influence combat calculations

### 4. Crew System

Crew members provide combat power directly through individual Attack and Defense stats. Total crew power directly impacts combat effectiveness in skirmishes.

**Crew Roles:**
- **Enforcer**: High Attack, Medium Defense (e.g., 85-200 Attack, 65-160 Defense)
- **Hacker**: Medium Attack, High Defense (e.g., 55-150 Attack, 75-190 Defense)
- **Smuggler**: Balanced stats (e.g., 65-160 Attack, 70-150 Defense)

**Crew Properties:**
- `name`: Predefined character name (e.g., "Street Thug", "Assassin", "Quantum Hacker")
- `role`: Enforcer, Hacker, or Smuggler
- `attack`: Individual attack stat (contributes to total crew power)
- `defense`: Individual defense stat (contributes to total crew power)
- `level`: Individual crew member level (starts at 1, can be leveled up)
- `crew_template_id`: Links to predefined crew template

**Crew Marketplace:**
- Predefined crew members available for purchase
- Each crew member has specific stats, price, and level requirement
- Purchase with Credits
- Tiered system (Level 1 → 5 → 10 → 15 → 20 → 30+)
- Higher tiers cost more but provide better stats

**Crew Power Calculation:**
- `totalAttack`: Sum of all crew members' attack stats
- `totalDefense`: Sum of all crew members' defense stats
- `totalPower`: Total Attack + Total Defense
- Used directly in combat calculations: `Player Power = (Player Level × 50) + Total Crew Power`

**Crew Limits:**
- `crewSize`: Current number of crew members
- `crewMax`: Maximum crew capacity (increases with level/upgrades)
- Cannot purchase duplicate crew members (one per template)

### 5. Outposts System

Passive income generation through property ownership.

**Outpost Types:**
- Mining Facility
- Black Market
- Weapons Cache
- Entertainment (Casino)
- Resource Processing (Refinery)
- Command Center

**Outpost Properties:**
- `level`: Upgrade level (1-5+)
- `incomeRate`: Credits per hour
- `availableIncome`: Accumulated income ready to collect
- `upgradeAvailable`: Whether outpost can be upgraded

**Marketplace:**
- Purchase new outposts with Credits
- Level requirements for advanced outposts
- Quantity requirements (e.g., "5 Outposts" for Command Center)

### 6. Loadout System

Equipment management for combat bonuses.

**Item Types:**
- **Weapons**: Attack boost, special effects (crit chance, stun, AoE)
- **Armor**: Defense boost, damage reduction, dodge chance
- **Gadgets**: Special bonuses (XP gain, loot chance, tech effects)
- **Consumables**: Temporary boosts or resource restoration

**Rarity Tiers:**
- **Common**: Basic stats
- **Rare**: Moderate stats + special effect
- **Epic**: High stats + strong special effect
- **Legendary**: Maximum stats + powerful special effect

**Equipment Slots:**
- One weapon (equipped)
- One armor (equipped)
- One gadget (equipped)
- Consumables inventory (use when needed)

### 7. Medbay (Health System)

Health management and recovery.

**Health Mechanics:**
- Health decreases when losing skirmishes
- Natural regeneration over time (offline included)
- Instant healing with Alloy (premium currency)
- Combat logs track recent battles

**Recovery Options:**
- **Free**: Natural regeneration (takes time)
- **Instant**: Alloy cost for immediate full heal

### 8. Progression System

**Leveling:**
- Gain XP from all activities
- Each level requires more XP than previous
- Level unlocks new content (outposts, contracts, equipment)

**Daily Missions:**
- Reset daily
- Track progress (e.g., "Complete 3 Contracts")
- Reward Credits and XP on completion

**Streak System:**
- Daily login streaks
- Rewards at milestones (e.g., 10 days)
- Tracks current and longest streak

### 9. Events & Special Content

**Limited-Time Offers:**
- Equipment bundles
- Resource packs
- Discounted premium items
- Time-limited availability

**Syndicate Directives:**
- Community-wide goals
- Track participation
- Shared rewards for milestones
- Types: Defense, Recruitment, etc.

**Event Contracts:**
- Special contracts during events
- Guaranteed rare loot
- Higher rewards

---

## Player Identity

**Player Properties:**
- `handle`: Player username (e.g., "VOID_RUNNER_X")
- `rank`: Title/rank (e.g., "Shadow Enforcer")
- `syndicate`: Syndicate name (e.g., "Eclipse Cartel")

---

## Game Balance Notes

### Energy Systems
- **Charge**: Regenerates over time, used for contracts
- **Adrenal**: Regenerates over time, used for combat
- Both systems encourage regular check-ins

### Economy
- Credits: Primary currency, earned from all activities
- Alloy: Premium currency, used for convenience (instant actions)
- Balance ensures both free and premium play styles viable

### Progression Curve
- Early levels: Fast progression, frequent unlocks
- Mid levels: Steady progression, strategic decisions
- High levels: Slower progression, prestige systems

---

## Theme & Aesthetic

**Visual Style:**
- Neon-noir cyberpunk aesthetic
- Dark backgrounds with purple/cyan accents
- Space-themed with crime syndicate narrative
- Futuristic UI with monospace fonts for technical feel

**Naming Conventions:**
- Handles: UPPERCASE_WITH_UNDERSCORES
- Locations: Descriptive space names (Nebula Station, Void Trade Hub)
- Equipment: Technical names (Plasma Rifle MK-7, Neural Implant X9)

