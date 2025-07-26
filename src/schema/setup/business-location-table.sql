-- Create business_locations table
CREATE TABLE IF NOT EXISTS business_locations (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  longitude NUMERIC(9,6),
  latitude NUMERIC(9,6),
  phone TEXT,
  email TEXT,
  website TEXT,
  business_type TEXT DEFAULT 'general',
  hours_of_operation TEXT,
  price_range TEXT,
  amenities TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(uuid) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on business name and address combination
ALTER TABLE business_locations ADD CONSTRAINT IF NOT EXISTS business_location_unique UNIQUE (name, address, city);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_locations_name ON business_locations(name);
CREATE INDEX IF NOT EXISTS idx_business_locations_city ON business_locations(city);
CREATE INDEX IF NOT EXISTS idx_business_locations_business_type ON business_locations(business_type);
CREATE INDEX IF NOT EXISTS idx_business_locations_created_at ON business_locations(created_at);
CREATE INDEX IF NOT EXISTS idx_business_locations_created_by ON business_locations(created_by);

-- Add RLS policies for business_locations table
ALTER TABLE business_locations ENABLE ROW LEVEL SECURITY;

-- Policy to allow all authenticated users to read business locations
CREATE POLICY "Allow authenticated users to read business locations" ON business_locations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to create business locations
CREATE POLICY "Allow authenticated users to create business locations" ON business_locations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow business location creators to update their locations
CREATE POLICY "Allow business location creators to update locations" ON business_locations
  FOR UPDATE USING (
    (auth.uid() = created_by) OR (EXISTS (SELECT 1 FROM profiles WHERE uuid = auth.uid() AND 'administrator' = ANY(roles)))
  );

-- Policy to allow business location creators to delete their locations
CREATE POLICY "Allow business location creators to delete locations" ON business_locations
  FOR DELETE USING (
    (auth.uid() = created_by) OR (EXISTS (SELECT 1 FROM profiles WHERE uuid = auth.uid() AND 'administrator' = ANY(roles)))
  );

-- Create business_location_tags junction table
CREATE TABLE IF NOT EXISTS business_location_tags (
  business_location_id UUID NOT NULL REFERENCES business_locations(uuid) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (business_location_id, tag)
);

-- Add indexes for business_location_tags
CREATE INDEX IF NOT EXISTS idx_business_location_tags_tag ON business_location_tags(tag);
CREATE INDEX IF NOT EXISTS idx_business_location_tags_location_id ON business_location_tags(business_location_id);
CREATE INDEX IF NOT EXISTS idx_business_location_tags_created_at ON business_location_tags(created_at);

-- Add RLS policies for business_location_tags table
ALTER TABLE business_location_tags ENABLE ROW LEVEL SECURITY;

-- Policy to allow all authenticated users to read business location tags
CREATE POLICY "Allow authenticated users to read business location tags" ON business_location_tags
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow business location creators to manage their tags
CREATE POLICY "Allow business location creators to manage tags" ON business_location_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_locations 
      WHERE business_locations.uuid = business_location_tags.business_location_id 
      AND business_locations.created_by = auth.uid()
    )
  );

-- Create business_location_reviews junction table
CREATE TABLE IF NOT EXISTS business_location_reviews (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_location_id UUID NOT NULL REFERENCES business_locations(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_location_id, user_id)
);

-- Add indexes for business_location_reviews
CREATE INDEX IF NOT EXISTS idx_business_location_reviews_location_id ON business_location_reviews(business_location_id);
CREATE INDEX IF NOT EXISTS idx_business_location_reviews_user_id ON business_location_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_business_location_reviews_rating ON business_location_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_business_location_reviews_created_at ON business_location_reviews(created_at);

-- Add RLS policies for business_location_reviews table
ALTER TABLE business_location_reviews ENABLE ROW LEVEL SECURITY;

-- Policy to allow all authenticated users to read business location reviews
CREATE POLICY "Allow authenticated users to read business location reviews" ON business_location_reviews
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to create reviews
CREATE POLICY "Allow authenticated users to create business location reviews" ON business_location_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own reviews
CREATE POLICY "Allow users to update their own business location reviews" ON business_location_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete their own reviews
CREATE POLICY "Allow users to delete their own business location reviews" ON business_location_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update business location updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_location_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for business_locations updated_at
CREATE TRIGGER update_business_location_updated_at
  BEFORE UPDATE ON business_locations
  FOR EACH ROW EXECUTE FUNCTION update_business_location_updated_at();

-- Create function to update business location review updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_location_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for business_location_reviews updated_at
CREATE TRIGGER update_business_location_review_updated_at
  BEFORE UPDATE ON business_location_reviews
  FOR EACH ROW EXECUTE FUNCTION update_business_location_review_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON business_locations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON business_location_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON business_location_reviews TO authenticated; 