-- Fix health regeneration function
-- The issue: timestamps should be updated based on whether regeneration actually occurred
-- We need to update timestamps only if the value is still below max after regeneration

CREATE OR REPLACE FUNCTION regenerate_energy()
RETURNS void AS $$
BEGIN
  UPDATE players
  SET
    charge = LEAST(charge_max, charge + GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - last_charge_regen)) / 60))::INTEGER),
    adrenal = LEAST(adrenal_max, adrenal + GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - last_adrenal_regen)) / 120))::INTEGER),
    health = LEAST(health_max, health + GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - last_health_regen)) / 120))::INTEGER),
    -- Update timestamps: if old value was below max, update timestamp to NOW() (regeneration occurred)
    -- If old value was at max, keep old timestamp (no regeneration needed)
    last_charge_regen = CASE WHEN charge < charge_max THEN NOW() ELSE last_charge_regen END,
    last_adrenal_regen = CASE WHEN adrenal < adrenal_max THEN NOW() ELSE last_adrenal_regen END,
    last_health_regen = CASE WHEN health < health_max THEN NOW() ELSE last_health_regen END,
    updated_at = NOW()
  WHERE
    charge < charge_max OR
    adrenal < adrenal_max OR
    health < health_max;
END;
$$ LANGUAGE plpgsql;

