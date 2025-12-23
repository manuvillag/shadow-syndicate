-- Allow anonymous players by making user_id nullable
-- This allows creating players without authentication

ALTER TABLE players 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add a unique constraint on handle only (not user_id + handle)
-- This ensures handles are unique across all players
ALTER TABLE players
  DROP CONSTRAINT IF EXISTS players_user_id_key;

-- Note: user_id can still reference auth.users when present
-- But it's now optional for anonymous players


