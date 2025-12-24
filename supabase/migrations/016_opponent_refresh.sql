-- Add opponent refresh tracking to players table
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS last_opponent_refresh TIMESTAMPTZ;

-- Create table to track which opponents have been fought recently (for cooldowns)
CREATE TABLE IF NOT EXISTS opponent_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  opponent_id UUID REFERENCES opponents(id) ON DELETE CASCADE NOT NULL,
  fought_at TIMESTAMPTZ DEFAULT NOW(),
  cooldown_until TIMESTAMPTZ NOT NULL,
  UNIQUE(player_id, opponent_id)
);

CREATE INDEX IF NOT EXISTS idx_opponent_cooldowns_player ON opponent_cooldowns(player_id);
CREATE INDEX IF NOT EXISTS idx_opponent_cooldowns_opponent ON opponent_cooldowns(opponent_id);
CREATE INDEX IF NOT EXISTS idx_opponent_cooldowns_cooldown ON opponent_cooldowns(cooldown_until);

