-- Create crew_templates table for predefined crew members you can purchase
CREATE TABLE IF NOT EXISTS crew_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('Enforcer', 'Hacker', 'Smuggler')),
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  price INTEGER NOT NULL,
  level_requirement INTEGER DEFAULT 1,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add crew_template_id to crew_members to link purchased crew to template
ALTER TABLE crew_members
ADD COLUMN IF NOT EXISTS crew_template_id UUID REFERENCES crew_templates(id);

-- Seed initial crew members (Mafia Wars style - specific characters you can buy)
INSERT INTO crew_templates (name, role, attack, defense, price, level_requirement, description) VALUES
  -- Tier 1: Basic Crew (Level 1-5)
  ('Street Thug', 'Enforcer', 85, 65, 5000, 1, 'A basic enforcer. Cheap but reliable muscle.'),
  ('Script Kiddie', 'Hacker', 55, 75, 5000, 1, 'A beginner hacker. Not the best, but gets the job done.'),
  ('Small-Time Runner', 'Smuggler', 65, 70, 5000, 1, 'A low-level smuggler. Knows the back alleys.'),
  
  -- Tier 2: Professional Crew (Level 5-15)
  ('Veteran Enforcer', 'Enforcer', 120, 85, 15000, 5, 'Battle-hardened muscle. Has seen combat.'),
  ('Cyber Specialist', 'Hacker', 75, 110, 15000, 5, 'Expert at breaking corporate security.'),
  ('Freight Runner', 'Smuggler', 90, 95, 15000, 5, 'Moves cargo through dangerous routes.'),
  ('Heavy Gunner', 'Enforcer', 140, 100, 25000, 10, 'Heavy weapons specialist. Devastating firepower.'),
  ('Data Breaker', 'Hacker', 95, 130, 25000, 10, 'Can crack any system. Elite hacker.'),
  ('Shadow Broker', 'Smuggler', 105, 110, 25000, 10, 'Moves high-value contraband. Expert smuggler.'),
  
  -- Tier 3: Elite Crew (Level 15-30)
  ('Assassin', 'Enforcer', 160, 120, 50000, 15, 'Silent killer. Eliminates targets efficiently.'),
  ('Quantum Hacker', 'Hacker', 110, 150, 50000, 15, 'Uses quantum computing for impossible hacks.'),
  ('Void Smuggler', 'Smuggler', 120, 125, 50000, 15, 'Smuggles through the void itself. Legendary.'),
  ('War Veteran', 'Enforcer', 180, 140, 75000, 20, 'Survived multiple wars. Unstoppable.'),
  ('AI Whisperer', 'Hacker', 130, 170, 75000, 20, 'Can control AI systems. Master hacker.'),
  ('Phantom Runner', 'Smuggler', 140, 135, 75000, 20, 'Never caught. Perfect smuggling record.'),
  
  -- Tier 4: Legendary Crew (Level 30+)
  ('Death Dealer', 'Enforcer', 200, 160, 150000, 30, 'Legendary killer. Feared across the galaxy.'),
  ('Reality Hacker', 'Hacker', 150, 190, 150000, 30, 'Hacks reality itself. Beyond comprehension.'),
  ('Void Walker', 'Smuggler', 160, 150, 150000, 30, 'Moves through dimensions. Ultimate smuggler.')
ON CONFLICT (name) DO UPDATE SET
  role = EXCLUDED.role,
  attack = EXCLUDED.attack,
  defense = EXCLUDED.defense,
  price = EXCLUDED.price,
  level_requirement = EXCLUDED.level_requirement,
  description = EXCLUDED.description,
  is_active = true;

-- RLS Policies for crew_templates
ALTER TABLE crew_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active crew templates"
  ON crew_templates FOR SELECT
  USING (is_active = true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_crew_templates_role ON crew_templates(role);
CREATE INDEX IF NOT EXISTS idx_crew_templates_level ON crew_templates(level_requirement);

