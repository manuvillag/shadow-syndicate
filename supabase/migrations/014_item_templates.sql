-- Item Templates Table for Marketplace
-- Similar to crew_templates, this stores predefined items players can purchase

CREATE TABLE IF NOT EXISTS item_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  type TEXT NOT NULL CHECK (type IN ('weapon', 'armor', 'gadget')),
  attack_boost INTEGER DEFAULT 0,
  defense_boost INTEGER DEFAULT 0,
  special_boost TEXT,
  price INTEGER NOT NULL,
  level_requirement INTEGER DEFAULT 1,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_item_templates_type ON item_templates(type);
CREATE INDEX IF NOT EXISTS idx_item_templates_rarity ON item_templates(rarity);
CREATE INDEX IF NOT EXISTS idx_item_templates_active ON item_templates(is_active);

-- Seed item templates from CONTENT_CATALOG.md

-- Weapons
INSERT INTO item_templates (name, rarity, type, attack_boost, special_boost, price, level_requirement, description) VALUES
('Standard Blaster', 'common', 'weapon', 35, NULL, 5000, 1, 'A basic energy weapon, reliable but unremarkable. Every operator starts with one, and many never upgrade. It gets the job done, but barely.'),
('Shock Blade', 'rare', 'weapon', 62, 'Stun effect', 15000, 5, 'An electrified melee weapon that delivers devastating shocks on impact. The blade crackles with energy, and a single hit can incapacitate most targets. Perfect for close-quarters combat.'),
('Plasma Rifle MK-7', 'epic', 'weapon', 85, '15% crit chance', 50000, 10, 'A high-energy plasma weapon favored by corporate security forces. The MK-7 model is reliable, powerful, and expensive. It fires bolts of superheated plasma that can melt through most armor.'),
('Photon Cannon', 'legendary', 'weapon', 120, '25% crit + AoE', 150000, 20, 'A massive energy weapon that fires focused photon beams. The cannon is heavy, slow to fire, but devastatingly powerful. A single shot can destroy multiple enemies at once.')
ON CONFLICT (name) DO NOTHING;

-- Armor
INSERT INTO item_templates (name, rarity, type, defense_boost, special_boost, price, level_requirement, description) VALUES
('Basic Vest', 'common', 'armor', 25, NULL, 3000, 1, 'A simple armored vest that provides minimal protection. Better than nothing, but not by much. Most operators upgrade as soon as they can afford it.'),
('Stealth Cloak', 'rare', 'armor', 55, 'Dodge +15%', 20000, 5, 'A lightweight suit with active camouflage technology. It doesn''t offer much protection, but it makes you harder to hit. Perfect for infiltration and hit-and-run tactics.'),
('Titanium Exosuit', 'epic', 'armor', 95, '20% damage reduction', 75000, 10, 'A full-body exosuit made of reinforced titanium. It''s heavy, but it can take a beating. The suit''s servos enhance your strength, and its armor plates can stop most small-arms fire.')
ON CONFLICT (name) DO NOTHING;

-- Gadgets
INSERT INTO item_templates (name, rarity, type, special_boost, price, level_requirement, description) VALUES
('Scanner Module', 'rare', 'gadget', 'Loot +20%', 25000, 5, 'A scanning device that helps you find valuable items and resources. It highlights lootable objects, identifies valuable materials, and increases your chances of finding rare items.'),
('EMP Generator', 'epic', 'gadget', 'Disable tech enemies', 60000, 10, 'A portable electromagnetic pulse device that can disable electronic systems. It''s illegal in most systems, but incredibly useful. One pulse can shut down an entire security system.'),
('Neural Implant X9', 'legendary', 'gadget', 'XP +30%', 200000, 15, 'An advanced neural interface that enhances your cognitive abilities. It processes information faster, learns from experience, and makes you more efficient at everything you do. The X9 model is the latest and greatest.')
ON CONFLICT (name) DO NOTHING;

