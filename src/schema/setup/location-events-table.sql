-- Create location_events junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS location_events (
  location_id UUID NOT NULL REFERENCES location(uuid) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (location_id, event_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_location_events_location_id ON location_events(location_id);
CREATE INDEX IF NOT EXISTS idx_location_events_event_id ON location_events(event_id);
CREATE INDEX IF NOT EXISTS idx_location_events_created_at ON location_events(created_at);

-- Add RLS policies for location_events table
ALTER TABLE location_events ENABLE ROW LEVEL SECURITY;

-- Policy to allow all authenticated users to read location_events
CREATE POLICY "Allow authenticated users to read location_events" ON location_events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow event creators to link their events to locations
CREATE POLICY "Allow event creators to link events to locations" ON location_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_hosts 
      WHERE event_hosts.event_id = location_events.event_id 
      AND event_hosts.user_id = auth.uid()
    )
  );

-- Policy to allow event creators to unlink their events from locations
CREATE POLICY "Allow event creators to unlink events from locations" ON location_events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM event_hosts 
      WHERE event_hosts.event_id = location_events.event_id 
      AND event_hosts.user_id = auth.uid()
    )
  ); 