-- Initial Database Schema for Shadow Syndicate
-- Run this in Supabase SQL Editor

-- Players Table
CREATE TABLE IF NOT EXISTS players (
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

CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_handle ON players(handle);

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
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

-- Contract Executions (History)
CREATE TABLE IF NOT EXISTS contract_executions (
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

CREATE INDEX IF NOT EXISTS idx_contract_executions_player ON contract_executions(player_id);

-- Crew Members
CREATE TABLE IF NOT EXISTS crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Enforcer', 'Hacker', 'Smuggler')),
  level INTEGER DEFAULT 1,
  bonus_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, name)
);

CREATE INDEX IF NOT EXISTS idx_crew_members_player ON crew_members(player_id);

-- Outposts
CREATE TABLE IF NOT EXISTS outposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  income_rate INTEGER NOT NULL,
  last_collected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outposts_player ON outposts(player_id);

-- Equipment/Items
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  type TEXT NOT NULL CHECK (type IN ('weapon', 'armor', 'gadget', 'consumable')),
  attack_boost INTEGER,
  defense_boost INTEGER,
  special_boost TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player Inventory
CREATE TABLE IF NOT EXISTS player_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  quantity INTEGER DEFAULT 1,
  equipped BOOLEAN DEFAULT false,
  slot TEXT CHECK (slot IN ('weapon', 'armor', 'gadget')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, item_id, slot)
);

CREATE INDEX IF NOT EXISTS idx_player_inventory_player ON player_inventory(player_id);

-- Combat Logs
CREATE TABLE IF NOT EXISTS combat_logs (
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

CREATE INDEX IF NOT EXISTS idx_combat_logs_player ON combat_logs(player_id);
CREATE INDEX IF NOT EXISTS idx_combat_logs_fought_at ON combat_logs(fought_at DESC);

-- Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE outposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE combat_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Players can only see/update their own data
CREATE POLICY "Players can view own data"
  ON players FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Players can update own data"
  ON players FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Players can insert own data"
  ON players FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Crew policies
CREATE POLICY "Players can view own crew"
  ON crew_members FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM players WHERE id = crew_members.player_id));

CREATE POLICY "Players can manage own crew"
  ON crew_members FOR ALL
  USING (auth.uid() = (SELECT user_id FROM players WHERE id = crew_members.player_id));

-- Outposts policies
CREATE POLICY "Players can view own outposts"
  ON outposts FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM players WHERE id = outposts.player_id));

CREATE POLICY "Players can manage own outposts"
  ON outposts FOR ALL
  USING (auth.uid() = (SELECT user_id FROM players WHERE id = outposts.player_id));

-- Inventory policies
CREATE POLICY "Players can view own inventory"
  ON player_inventory FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM players WHERE id = player_inventory.player_id));

CREATE POLICY "Players can manage own inventory"
  ON player_inventory FOR ALL
  USING (auth.uid() = (SELECT user_id FROM players WHERE id = player_inventory.player_id));

-- Contract executions policies
CREATE POLICY "Players can view own executions"
  ON contract_executions FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM players WHERE id = contract_executions.player_id));

CREATE POLICY "Players can insert own executions"
  ON contract_executions FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM players WHERE id = contract_executions.player_id));

-- Combat logs policies
CREATE POLICY "Players can view own combat logs"
  ON combat_logs FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM players WHERE id = combat_logs.player_id));

CREATE POLICY "Players can insert own combat logs"
  ON combat_logs FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM players WHERE id = combat_logs.player_id));

-- Contracts are public (read-only for players)
CREATE POLICY "Contracts are public"
  ON contracts FOR SELECT
  USING (is_active = true);

-- Energy Regeneration Function
CREATE OR REPLACE FUNCTION regenerate_energy()
RETURNS void AS $$
BEGIN
  UPDATE players
  SET
    charge = LEAST(charge_max, charge + FLOOR(EXTRACT(EPOCH FROM (NOW() - last_charge_regen)) / 60)::INTEGER),
    adrenal = LEAST(adrenal_max, adrenal + FLOOR(EXTRACT(EPOCH FROM (NOW() - last_adrenal_regen)) / 120)::INTEGER),
    health = LEAST(health_max, health + FLOOR(EXTRACT(EPOCH FROM (NOW() - last_health_regen)) / 300)::INTEGER),
    last_charge_regen = CASE WHEN charge < charge_max THEN NOW() ELSE last_charge_regen END,
    last_adrenal_regen = CASE WHEN adrenal < adrenal_max THEN NOW() ELSE last_adrenal_regen END,
    last_health_regen = CASE WHEN health < health_max THEN NOW() ELSE last_health_regen END,
    updated_at = NOW()
  WHERE
    charge < charge_max OR
    adrenal < adrenal_max OR
    health < health_max;
END;
$$ LANGUAGE plpgsql;

-- Insert some default contracts
INSERT INTO contracts (name, description, difficulty, energy_cost, credits_reward, xp_reward, loot_chance) VALUES
('Cargo Run: Proxima Station', 'Transport encrypted data packets to the outer rim. Low risk, standard payout.', 'easy', 15, 2500, 150, 25),
('Blackmarket Extraction', 'Extract rare tech from a rival syndicate''s vault. Guards expected.', 'risky', 30, 8500, 450, 55),
('Corporate Sabotage', 'Infiltrate megacorp HQ and plant malware. Heavy security, high reward.', 'elite', 50, 25000, 1200, 75),
('Supply Chain Raid', 'Hit an unguarded supply convoy. Quick in and out.', 'easy', 20, 3500, 200, 35),
('Sector Defense Breach', 'Disable orbital defenses for a client. Military response likely.', 'elite', 45, 18000, 950, 65)
ON CONFLICT DO NOTHING;


