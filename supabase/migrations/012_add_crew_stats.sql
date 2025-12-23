-- Add attack and defense stats to crew_members
-- Remove bonus_description (replaced by stats)

-- Add attack and defense columns
ALTER TABLE crew_members
ADD COLUMN IF NOT EXISTS attack INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS defense INTEGER DEFAULT 0;

-- Update existing crew members with random stats based on role
UPDATE crew_members
SET 
  attack = CASE 
    WHEN role = 'Enforcer' THEN 80 + FLOOR(RANDOM() * 60)::INTEGER  -- 80-140
    WHEN role = 'Hacker' THEN 50 + FLOOR(RANDOM() * 50)::INTEGER    -- 50-100
    WHEN role = 'Smuggler' THEN 60 + FLOOR(RANDOM() * 50)::INTEGER -- 60-110
    ELSE 50 + FLOOR(RANDOM() * 50)::INTEGER
  END,
  defense = CASE 
    WHEN role = 'Enforcer' THEN 60 + FLOOR(RANDOM() * 40)::INTEGER  -- 60-100
    WHEN role = 'Hacker' THEN 70 + FLOOR(RANDOM() * 50)::INTEGER    -- 70-120
    WHEN role = 'Smuggler' THEN 65 + FLOOR(RANDOM() * 45)::INTEGER -- 65-110
    ELSE 50 + FLOOR(RANDOM() * 50)::INTEGER
  END
WHERE attack = 0 OR defense = 0;

-- Remove bonus_description column (optional - can keep for now)
-- ALTER TABLE crew_members DROP COLUMN IF EXISTS bonus_description;

