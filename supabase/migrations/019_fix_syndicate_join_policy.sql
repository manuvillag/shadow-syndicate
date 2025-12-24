-- Fix RLS policy to allow players to join syndicates directly
-- The current policy only allows leaders/officers to add members, but players should be able to join themselves

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Leaders and officers can add members" ON syndicate_members;

-- Create two policies:
-- 1. Players can add themselves as members (for direct joins)
CREATE POLICY "Players can join syndicates"
  ON syndicate_members FOR INSERT
  WITH CHECK (
    player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- 2. Leaders and officers can add other members (for invitations)
CREATE POLICY "Leaders and officers can invite members"
  ON syndicate_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM syndicates s
      JOIN syndicate_members sm ON s.id = sm.syndicate_id
      WHERE s.id = syndicate_members.syndicate_id
      AND sm.player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
      AND sm.role IN ('leader', 'officer')
    )
    AND player_id != (SELECT id FROM players WHERE user_id = auth.uid())
  );

