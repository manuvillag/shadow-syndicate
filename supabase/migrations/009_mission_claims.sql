-- Create mission_claims table to track claimed daily missions
CREATE TABLE IF NOT EXISTS mission_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  claim_date DATE NOT NULL, -- The date the mission was for (UTC midnight)
  rewards_credits INTEGER NOT NULL,
  rewards_xp INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, mission_id, claim_date)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mission_claims_player_date ON mission_claims(player_id, claim_date);
CREATE INDEX IF NOT EXISTS idx_mission_claims_mission ON mission_claims(mission_id);

-- RLS policies
ALTER TABLE mission_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mission_claims_select" ON mission_claims;
CREATE POLICY "mission_claims_select" ON mission_claims
  FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM players WHERE id = player_id));

DROP POLICY IF EXISTS "mission_claims_insert" ON mission_claims;
CREATE POLICY "mission_claims_insert" ON mission_claims
  FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM players WHERE id = player_id));

