-- Migration to fix tradesperson_id in leads table
-- Currently some leads might have tradesperson_id as User ID instead of Profile ID.
-- This script updates them to use the correct Profile ID.

UPDATE leads l
JOIN tradesperson_profiles tp ON l.tradesperson_id = tp.user_id
SET l.tradesperson_id = tp.id
WHERE l.tradesperson_id NOT IN (SELECT id FROM (SELECT id FROM tradesperson_profiles) as tmp);
