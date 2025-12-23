# Next Steps: Backend Integration

You've set up GitHub and Supabase. Here's your step-by-step implementation plan.

## 🎯 Current Status
- ✅ Frontend UI complete (all pages)
- ✅ GitHub repository
- ✅ Supabase project created
- ⏭️ **Next: Backend integration**

---

## Step 1: Environment Setup

### 1.1 Install Supabase Client
```bash
pnpm add @supabase/supabase-js
pnpm add @supabase/ssr  # For Next.js SSR support
```

### 1.2 Create Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Server-side only (optional)
```

**Get these from:**
- Supabase Dashboard → Settings → API
- Copy "Project URL" and "publishable" key (this is the client-side key)
- "Service Role" key is only needed for admin operations that bypass RLS

### 1.3 Add to .gitignore
```gitignore
.env.local
.env*.local
```

---

## Step 2: Database Schema

### 2.1 Core Tables

Run these SQL migrations in Supabase SQL Editor:

#### Players Table
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  rank TEXT DEFAULT 'Initiate',
  syndicate TEXT DEFAULT 'Independent',
  
  -- Resources
  credits BIGINT DEFAULT 10000,
  alloy INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp_current BIGINT DEFAULT 0,
  xp_max BIGINT DEFAULT 1000,
  
  -- Energy
  charge INTEGER DEFAULT 100,
  charge_max INTEGER DEFAULT 100,
  adrenal INTEGER DEFAULT 50,
  adrenal_max INTEGER DEFAULT 50,
  health INTEGER DEFAULT 100,
  health_max INTEGER DEFAULT 100,
  
  -- Crew
  crew_size INTEGER DEFAULT 0,
  crew_max INTEGER DEFAULT 5,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_charge_regen TIMESTAMPTZ DEFAULT NOW(),
  last_adrenal_regen TIMESTAMPTZ DEFAULT NOW(),
  last_health_regen TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_handle ON players(handle);
```

#### Contracts Table
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'risky', 'elite', 'event')),
  energy_cost INTEGER NOT NULL,
  credits_reward INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  loot_chance INTEGER NOT NULL CHECK (loot_chance >= 0 AND loot_chance <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Contract Executions (History)
```sql
CREATE TABLE contract_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id),
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  credits_earned INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  loot_received TEXT,
  UNIQUE(player_id, contract_id, executed_at)
);

CREATE INDEX idx_contract_executions_player ON contract_executions(player_id);
```

#### Crew Members
```sql
CREATE TABLE crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Enforcer', 'Hacker', 'Smuggler')),
  level INTEGER DEFAULT 1,
  bonus_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, name)
);

CREATE INDEX idx_crew_members_player ON crew_members(player_id);
```

#### Outposts
```sql
CREATE TABLE outposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  income_rate INTEGER NOT NULL,
  last_collected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_outposts_player ON outposts(player_id);
```

#### Equipment/Items
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  type TEXT NOT NULL CHECK (type IN ('weapon', 'armor', 'gadget', 'consumable')),
  attack_boost INTEGER,
  defense_boost INTEGER,
  special_boost TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Player Inventory
```sql
CREATE TABLE player_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  quantity INTEGER DEFAULT 1,
  equipped BOOLEAN DEFAULT false,
  slot TEXT CHECK (slot IN ('weapon', 'armor', 'gadget')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, item_id, slot)
);

CREATE INDEX idx_player_inventory_player ON player_inventory(player_id);
```

#### Combat Logs
```sql
CREATE TABLE combat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  opponent_name TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('win', 'lose')),
  damage_dealt INTEGER NOT NULL,
  damage_taken INTEGER NOT NULL,
  credits_earned INTEGER DEFAULT 0,
  xp_gained INTEGER NOT NULL,
  loot_received TEXT,
  fought_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_combat_logs_player ON combat_logs(player_id);
CREATE INDEX idx_combat_logs_fought_at ON combat_logs(fought_at DESC);
```

### 2.2 Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE outposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE combat_logs ENABLE ROW LEVEL SECURITY;

-- Players can only see/update their own data
CREATE POLICY "Players can view own data"
  ON players FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Players can update own data"
  ON players FOR UPDATE
  USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Players can view own crew"
  ON crew_members FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM players WHERE id = crew_members.player_id));

CREATE POLICY "Players can manage own crew"
  ON crew_members FOR ALL
  USING (auth.uid() = (SELECT user_id FROM players WHERE id = crew_members.player_id));

-- Contracts are public (read-only for players)
CREATE POLICY "Contracts are public"
  ON contracts FOR SELECT
  USING (is_active = true);
```

---

## Step 3: Supabase Client Setup

### 3.1 Create Supabase Client

Create `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

Create `lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handle error
          }
        },
      },
    }
  )
}
```

### 3.2 Create Database Types

Create `lib/supabase/database.types.ts`:
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          user_id: string
          handle: string
          rank: string
          syndicate: string
          credits: number
          alloy: number
          level: number
          xp_current: number
          xp_max: number
          charge: number
          charge_max: number
          adrenal: number
          adrenal_max: number
          health: number
          health_max: number
          crew_size: number
          crew_max: number
          created_at: string
          updated_at: string
          last_charge_regen: string
          last_adrenal_regen: string
          last_health_regen: string
        }
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['players']['Insert']>
      }
      // Add other tables...
    }
  }
}
```

---

## Step 4: Authentication Setup

### 4.1 Create Auth Context

Create `lib/auth.ts`:
```typescript
import { createClient } from '@/lib/supabase/client'

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string, handle: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  
  if (error) return { error }
  
  // Create player record
  // (You'll need an API route or database trigger for this)
  return { data, error: null }
}

export async function signOut() {
  const supabase = createClient()
  return await supabase.auth.signOut()
}
```

### 4.2 Create Auth Pages

Create `app/auth/login/page.tsx` and `app/auth/signup/page.tsx`

---

## Step 5: API Routes

### 5.1 Player Data API

Create `app/api/player/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(player)
}
```

### 5.2 Contracts API

Create `app/api/contracts/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: contracts, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('is_active', true)
    .order('difficulty', { ascending: true })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(contracts)
}
```

### 5.3 Execute Contract API

Create `app/api/contracts/execute/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { contractId } = await request.json()
  
  // Get player data
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  // Get contract
  const { data: contract } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .single()
  
  // Check if player has enough charge
  if (player.charge < contract.energy_cost) {
    return NextResponse.json({ error: 'Insufficient charge' }, { status: 400 })
  }
  
  // Execute contract logic
  const success = Math.random() > 0.1 // 90% success rate
  const gotLoot = Math.random() * 100 < contract.loot_chance
  
  // Update player
  await supabase
    .from('players')
    .update({
      charge: player.charge - contract.energy_cost,
      credits: player.credits + contract.credits_reward,
      xp_current: player.xp_current + contract.xp_reward,
      updated_at: new Date().toISOString()
    })
    .eq('id', player.id)
  
  // Log execution
  await supabase
    .from('contract_executions')
    .insert({
      player_id: player.id,
      contract_id: contractId,
      success,
      credits_earned: contract.credits_reward,
      xp_earned: contract.xp_reward,
      loot_received: gotLoot ? 'Rare Tech Module' : null
    })
  
  return NextResponse.json({
    success,
    rewards: {
      credits: contract.credits_reward,
      xp: contract.xp_reward,
      loot: gotLoot ? 'Rare Tech Module' : undefined
    }
  })
}
```

---

## Step 6: Frontend Integration

### 6.1 Create Data Hooks

Create `hooks/use-player.ts`:
```typescript
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePlayer() {
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchPlayer() {
      const response = await fetch('/api/player')
      const data = await response.json()
      setPlayer(data)
      setLoading(false)
    }
    fetchPlayer()
  }, [])
  
  return { player, loading }
}
```

### 6.2 Update Pages

Replace mock data in pages with API calls:
```typescript
// app/page.tsx
import { usePlayer } from '@/hooks/use-player'

export default function Dashboard() {
  const { player, loading } = usePlayer()
  
  if (loading) return <div>Loading...</div>
  if (!player) return <div>Not logged in</div>
  
  // Use player data instead of mock
}
```

---

## Step 7: Energy Regeneration

### 7.1 Create Database Function

```sql
CREATE OR REPLACE FUNCTION regenerate_energy()
RETURNS void AS $$
BEGIN
  UPDATE players
  SET
    charge = LEAST(charge_max, charge + FLOOR(EXTRACT(EPOCH FROM (NOW() - last_charge_regen)) / 60)::INTEGER),
    adrenal = LEAST(adrenal_max, adrenal + FLOOR(EXTRACT(EPOCH FROM (NOW() - last_adrenal_regen)) / 120)::INTEGER),
    health = LEAST(health_max, health + FLOOR(EXTRACT(EPOCH FROM (NOW() - last_health_regen)) / 300)::INTEGER),
    last_charge_regen = NOW(),
    last_adrenal_regen = NOW(),
    last_health_regen = NOW()
  WHERE
    charge < charge_max OR
    adrenal < adrenal_max OR
    health < health_max;
END;
$$ LANGUAGE plpgsql;
```

### 7.2 Create Cron Job

Set up Supabase Edge Function or external cron to call this function every minute.

---

## Step 8: Testing

1. **Test Authentication**: Sign up, sign in, sign out
2. **Test Player Creation**: Verify player record created on signup
3. **Test API Routes**: Use Postman or browser to test endpoints
4. **Test Energy Regeneration**: Wait and verify regeneration works
5. **Test Contract Execution**: Execute contracts and verify updates

---

## Priority Order

1. ✅ **Environment setup** (Step 1)
2. ✅ **Database schema** (Step 2)
3. ✅ **Supabase client** (Step 3)
4. ✅ **Authentication** (Step 4)
5. ✅ **Player data API** (Step 5.1)
6. ✅ **Replace mock data** (Step 6)
7. ⏭️ **Contracts API** (Step 5.2-5.3)
8. ⏭️ **Energy regeneration** (Step 7)
9. ⏭️ **Combat system** (similar to contracts)
10. ⏭️ **Crew/Outposts** (similar pattern)

---

## Quick Start Commands

```bash
# Install Supabase
pnpm add @supabase/supabase-js @supabase/ssr

# Create .env.local (add your Supabase keys)

# Run SQL migrations in Supabase dashboard

# Start dev server
pnpm dev
```

---

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security

---

**Next**: Start with Step 1 (Environment Setup) and work through each step sequentially.

