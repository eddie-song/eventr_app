-- Complete person table with all necessary fields
-- Add missing columns to person table if they don't exist

-- Add created_at column (if not already added)
ALTER TABLE person ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add description column for service details
ALTER TABLE person ADD COLUMN IF NOT EXISTS description TEXT;

-- Add location column for service area
ALTER TABLE person ADD COLUMN IF NOT EXISTS location TEXT;

-- Add contact_info column for contact details
ALTER TABLE person ADD COLUMN IF NOT EXISTS contact_info TEXT;

-- Add service_type column for categorization
ALTER TABLE person ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'general';

-- Add status column for service state
ALTER TABLE person ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add hourly_rate column for pricing
ALTER TABLE person ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT NULL;

-- Add comments
COMMENT ON COLUMN person.created_at IS 'When the service was created';
COMMENT ON COLUMN person.description IS 'Detailed description of the service';
COMMENT ON COLUMN person.location IS 'Service area or location';
COMMENT ON COLUMN person.contact_info IS 'Contact information for the service provider';
COMMENT ON COLUMN person.service_type IS 'Type/category of service (e.g., professional, creative, technical)';
COMMENT ON COLUMN person.status IS 'Service status (active, inactive, suspended)';
COMMENT ON COLUMN person.hourly_rate IS 'Hourly rate in dollars (NULL for negotiable)';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_person_created_at ON person(created_at);
CREATE INDEX IF NOT EXISTS idx_person_service_type ON person(service_type);
CREATE INDEX IF NOT EXISTS idx_person_status ON person(status);
CREATE INDEX IF NOT EXISTS idx_person_user_id ON person(user_id);

-- Update permissions to allow authenticated users to manage their own person records
GRANT INSERT, UPDATE, DELETE ON person TO authenticated;

-- Add RLS policies for person (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to create person records" ON person;
DROP POLICY IF EXISTS "Allow users to update their own person records" ON person;
DROP POLICY IF EXISTS "Allow users to delete their own person records" ON person;

CREATE POLICY "Allow authenticated users to create person records" ON person 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own person records" ON person 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own person records" ON person 
  FOR DELETE USING (auth.uid() = user_id); 