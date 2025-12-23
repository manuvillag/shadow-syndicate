-- Add level_requirement column to contracts table
-- This will gate contracts behind level progression

ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS level_requirement INTEGER DEFAULT 1;

-- Update existing contracts with level requirements based on difficulty
UPDATE contracts
SET level_requirement = CASE
  WHEN difficulty = 'easy' THEN 1
  WHEN difficulty = 'risky' THEN 5
  WHEN difficulty = 'elite' THEN 15
  WHEN difficulty = 'event' THEN 10
  ELSE 1
END
WHERE level_requirement IS NULL OR level_requirement = 1;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_contracts_level_requirement ON contracts(level_requirement);
CREATE INDEX IF NOT EXISTS idx_contracts_difficulty_level ON contracts(difficulty, level_requirement);

