-- Allow anonymous players to insert their own player record
-- This is needed for the setup page to work without authentication

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Players can insert own data" ON players;

-- Create a new policy that allows inserts for anonymous users
-- Anonymous users can insert if user_id is NULL
-- Authenticated users can insert if user_id matches their auth.uid()
CREATE POLICY "Players can insert own data"
  ON players FOR INSERT
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL) OR
    (auth.uid() = user_id)
  );

-- Also allow anonymous users to view players (for the GET endpoint)
-- This allows fetching the most recent player for anonymous users
DROP POLICY IF EXISTS "Players can view own data" ON players;

CREATE POLICY "Players can view own data"
  ON players FOR SELECT
  USING (
    auth.uid() IS NULL OR
    auth.uid() = user_id
  );


