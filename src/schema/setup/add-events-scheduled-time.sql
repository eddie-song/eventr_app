-- Add scheduled_time column to events table
-- This allows events to have a scheduled date and time

ALTER TABLE events 
ADD COLUMN scheduled_time TIMESTAMP WITH TIME ZONE;

-- Add a comment to document the column
COMMENT ON COLUMN events.scheduled_time IS 'When the event is scheduled to take place (optional)'; 