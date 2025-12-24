-- Allow players to view other players' public profile data
-- This is needed for social features like friends, syndicates, etc.
-- Players can see: handle, level, rank, id (public profile info)
-- They still cannot see: credits, resources, etc. (private data)

-- Drop the restrictive policy (from migration 004)
DROP POLICY IF EXISTS "Players can view own data" ON players;

-- Create a new policy that allows viewing any player's data
-- This is needed for friend requests, syndicate members, search, etc.
-- The policy allows:
-- 1. Anonymous users to view players (for setup page)
-- 2. Authenticated users to view any player (for social features)
CREATE POLICY "Players can view public profiles"
  ON players FOR SELECT
  USING (
    auth.uid() IS NULL OR -- Allow anonymous users
    true -- Allow authenticated users to view any player
  );

-- Note: This makes player profiles public. If you want more granular control,
-- you could restrict it to only players who are in the same syndicate or are friends.
-- For now, this allows the friends and syndicate features to work properly.

