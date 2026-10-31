-- Migration: Add visit_type column to attendances table
-- Run this in your Supabase SQL Editor if you want dedicated column storage in Postgres

ALTER TABLE attendances 
ADD COLUMN IF NOT EXISTS visit_type text DEFAULT 'clinic';

-- Comment on column for documentation
COMMENT ON COLUMN attendances.visit_type IS 'Visit type: clinic or home';

