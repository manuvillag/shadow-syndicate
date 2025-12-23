-- Create outpost_templates table (master catalog)
CREATE TABLE IF NOT EXISTS outpost_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  base_income_rate INTEGER NOT NULL,
  base_price INTEGER NOT NULL,
  level_requirement INTEGER DEFAULT 1,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add outpost_template_id to outposts table
ALTER TABLE outposts 
  ADD COLUMN IF NOT EXISTS outpost_template_id UUID REFERENCES outpost_templates(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_outposts_template ON outposts(outpost_template_id);
CREATE INDEX IF NOT EXISTS idx_outposts_player_template ON outposts(player_id, outpost_template_id);

-- Insert initial outpost templates (all tiers from content catalog)
INSERT INTO outpost_templates (name, type, base_income_rate, base_price, level_requirement, description) VALUES
  -- Tier 1: Starter Outposts (Level 1-3)
  ('Trading Post Alpha', 'Trading Post', 500, 5000, 1, 'A bustling black-market bazaar orbiting a derelict moon. Smugglers, fixers, and rogue merchants trade everything from antique weapons to stolen corporate data. The station''s corridors echo with whispered deals and the clatter of credits changing hands. Perfect for establishing your first foothold in the syndicate network.'),
  ('Mining Station Beta', 'Mining Station', 750, 7500, 1, 'Automated drills chew through asteroid belts, guarded by underpaid security crews and overworked drones. The station''s hull is pockmarked with micrometeorite impacts, and the air smells of ozone and metal shavings. Perfect cover for siphoning rare alloys and running contraband through the ore shipments.'),
  ('Research Lab Gamma', 'Research Lab', 1000, 10000, 1, 'A sterile, high-security facility where fringe scientists test experimental tech and bio-mods far from regulators'' eyes. The lab''s white walls are occasionally stained with something that glows faintly in the dark. Unlock cutting-edge equipment and experimental modifications here.'),
  
  -- Tier 2: Mid-Game Outposts (Level 3-5)
  ('Manufacturing Hub', 'Manufacturing', 1500, 15000, 3, 'A sprawling orbital factory line stamping out drones, weapons, and counterfeit corporate gear 24/7. The constant hum of machinery never stops, and the workers are indistinguishable from the machines they operate. Control the means of production and flood the market with your own branded equipment.'),
  ('Data Center Delta', 'Data Center', 2000, 20000, 3, 'Racks of quantum servers humming in the dark, filled with corporate secrets, identity shards, and blackmail material. The air is cold and dry, and the only light comes from blinking server status indicators. Information is power, and this is where you store it.'),
  ('Smuggler''s Dock "Midnight Pier"', 'Dock / Port', 1200, 12000, 2, 'A shadowy section of a civilian station where ships dock with transponders off and manifests falsified. The dockmaster takes a cut of every shipment, but asks no questions. Perfect for moving contraband and avoiding customs inspections.'),
  
  -- Tier 3: Advanced Outposts (Level 5-7)
  ('Syndicate Safehouse "Obsidian Nest"', 'Safehouse', 1800, 18000, 5, 'Hidden bolt-hole laced with dead drops, armories, and emergency medical pods. The walls are reinforced, the exits are numerous, and the location is known only to trusted operatives. When things go wrong, this is where you disappear.'),
  ('Corpus Tower Annex', 'Corporate Front', 2500, 25000, 5, 'A "legitimate" corporate office controlled through shell companies, used to launder credits and influence officials. The building looks like any other corporate tower, but the top floors are reserved for syndicate business. Blend in with the suits and profit from the inside.'),
  ('Junkworld Salvage Yard', 'Scrap / Salvage', 1000, 10000, 4, 'Mountains of wrecked ships and drones piled under a toxic sky, where desperate crews strip anything of value. The yard is a maze of twisted metal and scavenger camps. One person''s trash is another''s treasure, and you''re the one making the profit.'),
  
  -- Tier 4: Elite Outposts (Level 7+)
  ('Void Monastery', 'Religious Enclave', 3000, 50000, 7, 'An ancient station occupied by "ascetics" who worship the void—and quietly deal in forbidden tech. The monastery''s halls are silent except for the hum of meditation chambers and the occasional sound of credits changing hands. Mystical and profitable.'),
  ('Quantum Forge Station', 'Advanced Manufacturing', 4000, 75000, 10, 'A cutting-edge facility that uses quantum entanglement to manufacture impossible weapons and equipment. The station''s core glows with contained singularities, and the products it creates shouldn''t exist according to known physics. But they do, and they''re yours.')
ON CONFLICT (name) DO NOTHING;

-- RLS policies for outpost_templates (public read access)
ALTER TABLE outpost_templates ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "outpost_templates_select" ON outpost_templates;

CREATE POLICY "outpost_templates_select" ON outpost_templates
  FOR SELECT
  USING (true);

