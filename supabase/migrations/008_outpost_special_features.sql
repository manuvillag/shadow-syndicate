-- Add special_features column to outpost_templates
-- This will store JSONB data with special feature definitions
ALTER TABLE outpost_templates 
  ADD COLUMN IF NOT EXISTS special_features JSONB DEFAULT '{}'::jsonb;

-- Update existing templates with their special features
UPDATE outpost_templates SET special_features = jsonb_build_object(
  'type', 'item_discount',
  'value', 5,
  'description', 'Small discount on item purchases (5% per level)'
) WHERE name = 'Trading Post Alpha';

UPDATE outpost_templates SET special_features = jsonb_build_object(
  'type', 'alloy_generation',
  'value', 10,
  'description', 'Generates alloy resources passively (10/hour per level)'
) WHERE name = 'Mining Station Beta';

UPDATE outpost_templates SET special_features = jsonb_build_object(
  'type', 'rare_item_chance',
  'value', 2,
  'description', 'Chance to unlock rare gadgets/boosters (2% per level)'
) WHERE name = 'Research Lab Gamma';

UPDATE outpost_templates SET special_features = jsonb_build_object(
  'type', 'alloy_conversion',
  'value', 10,
  'description', 'Converts alloy into credits passively (1:10 ratio per level)'
) WHERE name = 'Manufacturing Hub';

UPDATE outpost_templates SET special_features = jsonb_build_object(
  'type', 'contract_bonus',
  'value', 10,
  'description', 'Boosts contract payouts (+10% per level) and hack-type missions'
) WHERE name = 'Data Center Delta';

UPDATE outpost_templates SET special_features = jsonb_build_object(
  'type', 'smuggling_bonus',
  'value', 25,
  'description', 'Bonus income when running smuggling contracts (+25% per level)'
) WHERE name = 'Smuggler''s Dock "Midnight Pier"';

UPDATE outpost_templates SET special_features = jsonb_build_object(
  'type', 'health_regeneration',
  'value', 1,
  'description', 'Passive health regeneration (+1 HP/hour per level) and reduced arrest/heat chance'
) WHERE name = 'Syndicate Safehouse "Obsidian Nest"';

UPDATE outpost_templates SET special_features = jsonb_build_object(
  'type', 'corp_contracts',
  'value', 0,
  'description', 'Unlocks special corp-side contracts'
) WHERE name = 'Corpus Tower Annex';

UPDATE outpost_templates SET special_features = jsonb_build_object(
  'type', 'item_generation',
  'value', 1,
  'description', 'Generates random items/components (1 per day per level)'
) WHERE name = 'Junkworld Salvage Yard';

UPDATE outpost_templates SET special_features = jsonb_build_object(
  'type', 'void_events',
  'value', 0,
  'description', 'Rare, high-risk events with unique rewards and penalties'
) WHERE name = 'Void Monastery';

UPDATE outpost_templates SET special_features = jsonb_build_object(
  'type', 'legendary_crafting',
  'value', 0,
  'description', 'Can craft legendary items and weapons'
) WHERE name = 'Quantum Forge Station';

-- Add index for querying by special feature type
CREATE INDEX IF NOT EXISTS idx_outpost_templates_special_features ON outpost_templates USING GIN (special_features);

