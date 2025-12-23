-- Link existing outposts to templates by name
UPDATE outposts o
SET outpost_template_id = (
  SELECT id 
  FROM outpost_templates t 
  WHERE t.name = o.name 
  LIMIT 1
)
WHERE outpost_template_id IS NULL;

-- Note: Outposts that don't match any template will remain with NULL template_id
-- This is fine for backward compatibility, but new purchases will always have a template_id

