-- Fix location table permissions and RLS policies
-- Grant INSERT, UPDATE, DELETE permissions to authenticated users
GRANT INSERT, UPDATE, DELETE ON location TO authenticated;

-- Add INSERT policy for authenticated users
CREATE POLICY "Allow authenticated users to insert locations" ON location 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for authenticated users  
CREATE POLICY "Allow authenticated users to update locations" ON location 
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Add DELETE policy for authenticated users
CREATE POLICY "Allow authenticated users to delete locations" ON location 
  FOR DELETE USING (auth.role() = 'authenticated');

-- Fix location_events table permissions and policies
GRANT INSERT, UPDATE, DELETE ON location_events TO authenticated;

-- Add INSERT policy for location_events
CREATE POLICY "Allow authenticated users to insert location_events" ON location_events 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add DELETE policy for location_events
CREATE POLICY "Allow authenticated users to delete location_events" ON location_events 
  FOR DELETE USING (auth.role() = 'authenticated'); 