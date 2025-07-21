-- Complete events table with all necessary fields
-- Add missing columns to events table if they don't exist

-- Add image_url column
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add scheduled_time column (if not already added)
ALTER TABLE events ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP WITH TIME ZONE;

-- Add price column (if not already added)
ALTER TABLE events ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT NULL;

-- Add created_at column (if not already added)
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add description column for event details
ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;

-- Add capacity column for event size limits
ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT NULL;

-- Add event_type column for categorization
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'general';

-- Add status column for event state
ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add comments
COMMENT ON COLUMN events.image_url IS 'URL to event image';
COMMENT ON COLUMN events.scheduled_time IS 'When the event is scheduled to take place';
COMMENT ON COLUMN events.price IS 'Event price in dollars (NULL for free events)';
COMMENT ON COLUMN events.created_at IS 'When the event was created';
COMMENT ON COLUMN events.description IS 'Detailed description of the event';
COMMENT ON COLUMN events.capacity IS 'Maximum number of attendees (NULL for unlimited)';
COMMENT ON COLUMN events.event_type IS 'Type/category of event (e.g., concert, workshop, party)';
COMMENT ON COLUMN events.status IS 'Event status (active, cancelled, completed, draft)';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_scheduled_time ON events(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

-- Update permissions to allow authenticated users to create events
GRANT INSERT, UPDATE, DELETE ON events TO authenticated;

-- Add RLS policies for events (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to create events" ON events;
DROP POLICY IF EXISTS "Allow event creators to update their events" ON events;
DROP POLICY IF EXISTS "Allow event creators to delete their events" ON events;

CREATE POLICY "Allow authenticated users to create events" ON events 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow event creators to update their events" ON events 
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Allow event creators to delete their events" ON events 
  FOR DELETE USING (auth.uid() = created_by); 