-- Create location table if it doesn't exist
CREATE TABLE IF NOT EXISTS location (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  longitude NUMERIC(9,6),
  latitude NUMERIC(9,6),
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Add unique constraint on location name
ALTER TABLE location ADD CONSTRAINT IF NOT EXISTS location_name_unique UNIQUE (location);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_location_name ON location(location);
CREATE INDEX IF NOT EXISTS idx_location_rating ON location(rating);
CREATE INDEX IF NOT EXISTS idx_location_created_at ON location(created_at);

-- Add RLS policies for location table
ALTER TABLE location ENABLE ROW LEVEL SECURITY;

-- Policy to allow all authenticated users to read locations
CREATE POLICY "Allow authenticated users to read locations" ON location
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to create locations
CREATE POLICY "Allow authenticated users to create locations" ON location
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow location creators to update their locations
DROP POLICY IF EXISTS "Allow location creators to update locations" ON location;
CREATE POLICY "Allow location creators to update locations" ON location
  FOR UPDATE USING (
    (auth.uid() = created_by) OR (EXISTS (SELECT 1 FROM profiles WHERE uuid = auth.uid() AND 'administrator' = ANY(roles)))
  );

-- Policy to allow location creators to delete their locations
DROP POLICY IF EXISTS "Allow location creators to delete locations" ON location;
CREATE POLICY "Allow location creators to delete locations" ON location
  FOR DELETE USING (
    (auth.uid() = created_by) OR (EXISTS (SELECT 1 FROM profiles WHERE uuid = auth.uid() AND 'administrator' = ANY(roles)))
  ); 