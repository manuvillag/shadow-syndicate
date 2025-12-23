-- Seed all contracts from CONTENT_CATALOG.md
-- This adds all contracts from the content catalog

-- Add unique constraint on name if it doesn't exist (for ON CONFLICT to work)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contracts_name_unique'
  ) THEN
    ALTER TABLE contracts ADD CONSTRAINT contracts_name_unique UNIQUE (name);
  END IF;
END $$;

-- Insert all contracts from the content catalog
-- Using ON CONFLICT to update existing contracts or insert new ones
INSERT INTO contracts (name, description, difficulty, energy_cost, credits_reward, xp_reward, loot_chance, level_requirement) VALUES
  -- Tier 1: Simple Jobs (Level 1-5)
  ('Package Delivery', 'A simple courier job. Pick up a package from Point A, deliver it to Point B. No questions asked. The client pays well for discretion. Perfect for beginners looking to make their first credits.', 'easy', 10, 650, 32, 10, 1),
  ('Data Retrieval', 'Break into a low-security corporate terminal and download some files. The security is minimal, but the data is valuable. A good way to learn the basics of hacking and infiltration.', 'easy', 12, 750, 37, 15, 1),
  ('Debt Collection', 'Someone owes money, and you''re collecting it. Sometimes they pay willingly, sometimes they don''t. Either way, you get paid. A straightforward job with a bit of risk.', 'risky', 15, 1000, 50, 20, 5),
  
  -- Tier 2: Professional Contracts (Level 5-15)
  ('Sabotage Operation', 'Disable a competitor''s manufacturing line. Plant the charges, set the timers, and get out before the explosion. Corporate warfare at its finest. High risk, high reward.', 'risky', 20, 2000, 100, 25, 5),
  ('Assassination Contract', 'Eliminate a target. No witnesses, no evidence, no questions. The client wants them gone, and you''re the one making it happen. This is where things get serious.', 'elite', 25, 3250, 130, 30, 15),
  ('Smuggling Run', 'Move contraband through customs without getting caught. The cargo is valuable, the route is dangerous, and the payout is worth it. Perfect for those with outposts in smuggling-friendly locations.', 'risky', 18, 1600, 80, 20, 5),
  
  -- Tier 3: Elite Contracts (Level 15-30)
  ('Corporate Espionage', 'Infiltrate a high-security corporate facility and steal classified information. The security is tight, the stakes are high, and the rewards are massive. Not for the faint of heart.', 'elite', 30, 5000, 187, 35, 15),
  ('Station Takeover', 'Lead a coordinated assault on a rival syndicate''s station. This is a major operation requiring planning, resources, and a crew. Success means territory, failure means war.', 'elite', 40, 8000, 250, 40, 15),
  ('Void Artifact Recovery', 'Recover an artifact from a derelict ship drifting in the void. The ship is haunted, the artifact is dangerous, and the payout is legendary. High risk, legendary rewards.', 'elite', 35, 6500, 227, 45, 15),
  
  -- Tier 4: Legendary Contracts (Level 30+)
  ('Syndicate War', 'Participate in an all-out war between major syndicates. This is the big leagues. The rewards are massive, but so are the risks. Only for the most powerful operators.', 'elite', 50, 12500, 375, 50, 30),
  ('Corporate Assassination', 'Eliminate a high-ranking corporate executive. This will make you enemies, but it will also make you rich. The target is heavily guarded, and failure means death.', 'elite', 60, 20000, 500, 55, 30),
  ('Reality Breach', 'Close a breach in reality itself. The void is leaking into our dimension, and you''re the only one who can stop it. This is endgame content, and the rewards match the challenge.', 'elite', 75, 37500, 750, 60, 30)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  energy_cost = EXCLUDED.energy_cost,
  credits_reward = EXCLUDED.credits_reward,
  xp_reward = EXCLUDED.xp_reward,
  loot_chance = EXCLUDED.loot_chance,
  level_requirement = EXCLUDED.level_requirement,
  is_active = true;

-- Note: This migration adds all contracts from CONTENT_CATALOG.md
-- Existing contracts with different names will remain in the database
-- Contracts with matching names will be updated with catalog values

