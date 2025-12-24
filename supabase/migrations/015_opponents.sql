-- Create opponents table
CREATE TABLE IF NOT EXISTS opponents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  base_power INTEGER NOT NULL,
  base_credits INTEGER NOT NULL,
  base_xp INTEGER NOT NULL,
  adrenal_cost INTEGER NOT NULL DEFAULT 5,
  cooldown_minutes INTEGER DEFAULT 0,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'moderate', 'hard', 'extreme')),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed opponents with different power tiers
-- Power calculation: base_power represents the total combat power (like player power = level*50 + crew + equipment)
-- Opponents should scale relative to player power, not just level

INSERT INTO opponents (name, base_power, base_credits, base_xp, adrenal_cost, difficulty, description) VALUES
-- Easy tier (power 50-200, suitable for early game)
('Scarlet Viper', 50, 160, 6, 5, 'easy', 'A low-level street thug. Easy target for beginners.'),
('Neon Ghost', 75, 190, 7, 5, 'easy', 'A minor criminal with basic equipment.'),
('Void Hunter', 100, 250, 10, 5, 'easy', 'An inexperienced bounty hunter.'),
('Cyber Reaper', 150, 350, 15, 5, 'easy', 'A rookie mercenary with standard gear.'),

-- Moderate tier (power 200-500)
('Quantum Blade', 200, 500, 20, 5, 'moderate', 'A skilled operative with decent equipment.'),
('Shadow Flame', 250, 650, 25, 5, 'moderate', 'A veteran criminal with upgraded weapons.'),
('Dark Void', 300, 800, 30, 5, 'moderate', 'A dangerous assassin with advanced gear.'),
('Lightning Strike', 350, 950, 35, 5, 'moderate', 'A professional hitman with specialized equipment.'),

-- Hard tier (power 500-1000)
('Steel Edge', 500, 1500, 50, 10, 'hard', 'An elite enforcer with military-grade weapons.'),
('Phantom Mask', 600, 1800, 60, 10, 'hard', 'A legendary assassin with rare equipment.'),
('Crimson Blade', 700, 2100, 70, 10, 'hard', 'A feared syndicate leader with powerful gear.'),
('Void Walker', 800, 2400, 80, 10, 'hard', 'A shadow operative with experimental tech.'),

-- Extreme tier (power 1000+)
('Death Dealer', 1000, 3000, 100, 15, 'extreme', 'A legendary killer with legendary equipment.'),
('Soul Reaper', 1200, 3600, 120, 15, 'extreme', 'A mythic assassin feared across the galaxy.'),
('Void Master', 1500, 4500, 150, 15, 'extreme', 'The ultimate shadow warrior.'),
('Nexus Destroyer', 2000, 6000, 200, 20, 'extreme', 'A being of pure destruction.')
ON CONFLICT (name) DO UPDATE SET
  base_power = EXCLUDED.base_power,
  base_credits = EXCLUDED.base_credits,
  base_xp = EXCLUDED.base_xp,
  adrenal_cost = EXCLUDED.adrenal_cost,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Create index for active opponents
CREATE INDEX IF NOT EXISTS idx_opponents_active ON opponents(is_active) WHERE is_active = TRUE;

