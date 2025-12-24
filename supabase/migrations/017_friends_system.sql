-- Friends System
-- Allows players to add friends and send friend requests

-- Friend Requests Table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_requester ON friend_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_recipient ON friend_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- Enable RLS
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friend_requests
-- Players can view their own friend requests (sent or received)
CREATE POLICY "Players can view own friend requests"
  ON friend_requests FOR SELECT
  USING (
    requester_id IN (SELECT id FROM players WHERE user_id = auth.uid()) OR
    recipient_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- Players can create friend requests (as requester)
CREATE POLICY "Players can create friend requests"
  ON friend_requests FOR INSERT
  WITH CHECK (
    requester_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- Players can update friend requests they received (accept/decline)
CREATE POLICY "Players can update received friend requests"
  ON friend_requests FOR UPDATE
  USING (
    recipient_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- Players can delete their own friend requests (cancel)
CREATE POLICY "Players can delete own friend requests"
  ON friend_requests FOR DELETE
  USING (
    requester_id IN (SELECT id FROM players WHERE user_id = auth.uid()) OR
    recipient_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

