# Contract Gameplay Design

## Problem Statement

**Current Issues:**
- 90% success rate is too high (no real risk)
- No consequences for failure (still get rewards)
- No reason to do lower-tier contracts once you can afford elite ones
- Energy cost alone doesn't create meaningful choices

## Solution: Multi-Layered Risk/Reward System

### 1. **Success Rate Based on Difficulty & Level**

**Formula:**
```
Base Success Rate:
- Easy: 95%
- Risky: 75%
- Elite: 50%
- Event: 60% (but guaranteed rare loot)

Level Modifier:
- If player level < contract tier requirement: -20% per level below
- If player level >= contract tier requirement: +5% per level above (max +15%)

Final Success Rate = Base + Level Modifier (capped at 95%)
```

**Tier Requirements:**
- Easy contracts: Level 1+
- Risky contracts: Level 5+
- Elite contracts: Level 15+
- Event contracts: Level 10+

### 2. **Failure Consequences**

**On Contract Failure:**
- ❌ **Lose Energy Cost** (still consumed)
- ❌ **No Credits** (mission failed, no payout)
- ❌ **No XP** (or reduced XP - 25% of normal)
- ❌ **Potential Health Loss** (elite contracts: -5 to -15 HP)
- ❌ **Potential Credit Loss** (risky/elite: lose 10-25% of contract reward as "damages")
- ⚠️ **Cooldown** (can't retry same contract for X hours)

**Failure Severity by Difficulty:**
- **Easy**: Just lose energy, no other penalties
- **Risky**: Lose energy + 10% of reward as damages
- **Elite**: Lose energy + 25% of reward as damages + health loss (-5 to -15 HP)
- **Event**: Lose energy + 15% of reward, but shorter cooldown

### 3. **Level Requirements**

**Unlock System:**
- Contracts are **locked** until player reaches required level
- UI shows "Locked - Requires Level X"
- Prevents rushing to high-tier contracts

**Tier Level Requirements:**
- Tier 1 (Easy): Level 1
- Tier 2 (Risky): Level 5
- Tier 3 (Elite): Level 15
- Tier 4 (Legendary): Level 30

### 4. **Energy Efficiency**

**Why do lower contracts?**
- **Energy Efficiency Ratio**: Credits per Energy
  - Easy: 650 credits / 10 energy = 65 credits/energy
  - Risky: 2000 credits / 20 energy = 100 credits/energy
  - Elite: 5000 credits / 30 energy = 166 credits/energy (but 50% success = 83 effective)

- **Risk-Adjusted Returns**: 
  - Easy (95% success): 65 * 0.95 = **61.75 credits/energy**
  - Risky (75% success): 100 * 0.75 = **75 credits/energy**
  - Elite (50% success): 166 * 0.50 = **83 credits/energy** (but risk of losing 25% on failure)

### 5. **Cooldown System**

**Contract Cooldowns:**
- Easy: No cooldown (can repeat immediately)
- Risky: 30 minutes cooldown
- Elite: 2 hours cooldown
- Event: 1 hour cooldown

**Purpose:**
- Prevents spam farming
- Encourages variety
- Makes failures more costly (can't immediately retry)

### 6. **Progressive Unlocking**

**Contract Availability:**
- Start with only Tier 1 contracts
- Unlock Tier 2 at Level 5
- Unlock Tier 3 at Level 15
- Unlock Tier 4 at Level 30

**Benefits:**
- Natural progression
- Players learn mechanics on easier contracts
- Prevents rushing to endgame content

### 7. **Crew Requirements**

**Some contracts require specific crew:**
- "Corporate Espionage" requires 2+ Hackers
- "Station Takeover" requires 4+ Enforcers
- "Smuggling Run" requires 1+ Smuggler

**Failure if requirements not met:**
- Can't even attempt without required crew
- Encourages crew diversity

### 8. **Health System Integration**

**Elite contracts are dangerous:**
- Success: Full rewards
- Failure: Lose 5-15 HP (based on contract difficulty)
- If health drops to 0: Can't do contracts until healed

**Creates meaningful choice:**
- Do I risk my health for big rewards?
- Should I heal first or take the risk?

### 9. **Streak System**

**Consecutive Success Bonus:**
- 3 successful contracts in a row: +5% success rate (next contract)
- 5 successful contracts: +10% success rate
- 10 successful contracts: +15% success rate + bonus credits

**Consecutive Failure Penalty:**
- 3 failures in a row: -10% success rate (next contract)
- Encourages careful contract selection

### 10. **Daily Contract Limits**

**Optional: Prevent Over-Farming**
- Maximum 20 contracts per day
- Resets at midnight UTC
- Encourages strategic choices

## Implementation Priority

### Phase 1: Core Risk System (High Priority)
1. ✅ Difficulty-based success rates
2. ✅ Level requirements
3. ✅ Failure consequences (lose energy, no rewards)
4. ✅ Health loss on elite failures

### Phase 2: Progression Gates (Medium Priority)
5. ✅ Contract unlocking by level
6. ✅ Cooldown system
7. ✅ Crew requirements

### Phase 3: Advanced Features (Low Priority)
8. ⏳ Streak system
9. ⏳ Daily limits
10. ⏳ Failure penalties (credit loss)

## Example Scenarios

### Scenario 1: New Player (Level 1)
- **Available**: Only Easy contracts
- **Best Strategy**: Do "Package Delivery" (10 energy, 95% success)
- **Risk**: Low, but rewards are small
- **Goal**: Build up credits and level up

### Scenario 2: Mid-Game (Level 10)
- **Available**: Easy + Risky contracts
- **Best Strategy**: Mix of both
  - Do Easy when energy is low (safe, guaranteed)
  - Do Risky when energy is high (better efficiency, but 25% failure risk)
- **Risk**: Moderate - failures cost energy and 10% damages

### Scenario 3: End-Game (Level 30+)
- **Available**: All contracts
- **Best Strategy**: Elite contracts for maximum rewards
- **Risk**: High - 50% failure rate, lose 25% on failure, health damage
- **Challenge**: Manage health, choose when to risk it

## Balance Considerations

**Why not always do Elite?**
1. **Success Rate**: 50% means you fail half the time
2. **Failure Cost**: Lose 25% of reward + health damage
3. **Energy Efficiency**: When accounting for failures, Risky might be better
4. **Health Management**: Can't do contracts if health is too low
5. **Cooldowns**: Can't spam elite contracts

**Optimal Strategy:**
- Early game: Easy contracts (safe, guaranteed progress)
- Mid game: Mix of Easy + Risky (balance risk/reward)
- Late game: Elite contracts (high risk, high reward, but need health management)

