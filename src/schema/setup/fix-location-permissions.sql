-- Fix location table permissions to allow authenticated users to insert
GRANT INSERT, UPDATE, DELETE ON location TO authenticated;

-- Update location table policies to allow authenticated users to create locations
DROP POLICY IF EXISTS "Allow all to read locations" ON location;
CREATE POLICY "Allow all to read locations" ON location FOR SELECT USING (true);

-- Add policy to allow authenticated users to create locations
CREATE POLICY "Allow authenticated users to create locations" ON location 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add policy to allow authenticated users to update locations
CREATE POLICY "Allow authenticated users to update locations" ON location 
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Add policy to allow authenticated users to delete locations
CREATE POLICY "Allow authenticated users to delete locations" ON location 
  FOR DELETE USING (auth.role() = 'authenticated');

-- Fix location_events table permissions
GRANT INSERT, UPDATE, DELETE ON location_events TO authenticated;

-- Update location_events table policies
DROP POLICY IF EXISTS "Allow all to read location events" ON location_events;
CREATE POLICY "Allow all to read location events" ON location_events FOR SELECT USING (true);

-- Add policy to allow authenticated users to create location_events
CREATE POLICY "Allow authenticated users to create location_events" ON location_events 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add policy to allow authenticated users to delete location_events
CREATE POLICY "Allow authenticated users to delete location_events" ON location_events 
  FOR DELETE USING (auth.role() = 'authenticated'); 