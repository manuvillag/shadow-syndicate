-- Enable RLS on items table
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Items are public (anyone can read them - it's a catalog)
CREATE POLICY "Items are publicly readable"
  ON items FOR SELECT
  USING (true);

-- Only authenticated users can create items (via API)
CREATE POLICY "Authenticated users can create items"
  ON items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');


