-- Syndicates (Groups) System
-- Allows players to create and join syndicates together

-- Syndicates Table
CREATE TABLE IF NOT EXISTS syndicates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  leader_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_syndicates_leader ON syndicates(leader_id);
CREATE INDEX IF NOT EXISTS idx_syndicates_name ON syndicates(name);

-- Syndicate Members Table
CREATE TABLE IF NOT EXISTS syndicate_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicate_id UUID REFERENCES syndicates(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('leader', 'officer', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(syndicate_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_syndicate_members_syndicate ON syndicate_members(syndicate_id);
CREATE INDEX IF NOT EXISTS idx_syndicate_members_player ON syndicate_members(player_id);

-- Syndicate Invitations Table
CREATE TABLE IF NOT EXISTS syndicate_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicate_id UUID REFERENCES syndicates(id) ON DELETE CASCADE NOT NULL,
  inviter_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  invitee_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(syndicate_id, invitee_id)
);

CREATE INDEX IF NOT EXISTS idx_syndicate_invitations_syndicate ON syndicate_invitations(syndicate_id);
CREATE INDEX IF NOT EXISTS idx_syndicate_invitations_invitee ON syndicate_invitations(invitee_id);

-- Add syndicate_id to players table (for quick lookup)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS syndicate_id UUID REFERENCES syndicates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_players_syndicate ON players(syndicate_id);

-- Enable RLS
ALTER TABLE syndicates ENABLE ROW LEVEL SECURITY;
ALTER TABLE syndicate_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE syndicate_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for syndicates
-- Anyone can view syndicates (public info)
CREATE POLICY "Anyone can view syndicates"
  ON syndicates FOR SELECT
  USING (true);

-- Players can create syndicates
CREATE POLICY "Players can create syndicates"
  ON syndicates FOR INSERT
  WITH CHECK (
    leader_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- Leaders can update their syndicates
CREATE POLICY "Leaders can update their syndicates"
  ON syndicates FOR UPDATE
  USING (
    leader_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- Leaders can delete their syndicates
CREATE POLICY "Leaders can delete their syndicates"
  ON syndicates FOR DELETE
  USING (
    leader_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- RLS Policies for syndicate_members
-- Anyone can view syndicate members (public info)
CREATE POLICY "Anyone can view syndicate members"
  ON syndicate_members FOR SELECT
  USING (true);

-- Leaders and officers can add members
CREATE POLICY "Leaders and officers can add members"
  ON syndicate_members FOR INSERT
  WITH CHECK (
    syndicate_id IN (
      SELECT s.id FROM syndicates s
      JOIN syndicate_members sm ON s.id = sm.syndicate_id
      WHERE sm.player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
      AND sm.role IN ('leader', 'officer')
    )
  );

-- Leaders can update member roles
CREATE POLICY "Leaders can update member roles"
  ON syndicate_members FOR UPDATE
  USING (
    syndicate_id IN (
      SELECT s.id FROM syndicates s
      WHERE s.leader_id IN (SELECT id FROM players WHERE user_id = auth.uid())
    )
  );

-- Members can leave, leaders can remove members
CREATE POLICY "Members can leave or be removed"
  ON syndicate_members FOR DELETE
  USING (
    player_id IN (SELECT id FROM players WHERE user_id = auth.uid()) OR
    syndicate_id IN (
      SELECT s.id FROM syndicates s
      WHERE s.leader_id IN (SELECT id FROM players WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for syndicate_invitations
-- Players can view invitations sent to them or by them
CREATE POLICY "Players can view own invitations"
  ON syndicate_invitations FOR SELECT
  USING (
    inviter_id IN (SELECT id FROM players WHERE user_id = auth.uid()) OR
    invitee_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- Leaders and officers can create invitations
CREATE POLICY "Leaders and officers can create invitations"
  ON syndicate_invitations FOR INSERT
  WITH CHECK (
    syndicate_id IN (
      SELECT s.id FROM syndicates s
      JOIN syndicate_members sm ON s.id = sm.syndicate_id
      WHERE sm.player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
      AND sm.role IN ('leader', 'officer')
    )
    AND inviter_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- Invitees can update their invitations (accept/decline)
CREATE POLICY "Invitees can update invitations"
  ON syndicate_invitations FOR UPDATE
  USING (
    invitee_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

