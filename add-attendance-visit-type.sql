-- Migration: Add visit_type and attendance_time columns to attendances table
-- Note: Already applied to your production Supabase database via Supabase MCP

ALTER TABLE attendances 
ADD COLUMN IF NOT EXISTS visit_type text DEFAULT 'clinic';

ALTER TABLE attendances 
ADD COLUMN IF NOT EXISTS attendance_time text;

-- Comments on columns for documentation
COMMENT ON COLUMN attendances.visit_type IS 'Visit type: clinic or home';
COMMENT ON COLUMN attendances.attendance_time IS 'Time when attendance was marked (e.g. 04:30 PM)';
