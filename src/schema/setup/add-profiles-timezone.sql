-- Add timezone column to profiles table
-- This stores the user's preferred timezone for event scheduling and display

ALTER TABLE profiles 
ADD COLUMN timezone TEXT DEFAULT 'UTC';

-- Add a comment to document the column
COMMENT ON COLUMN profiles.timezone IS 'User''s preferred timezone (e.g., America/New_York, Europe/London)';

-- Update existing profiles to have UTC as default timezone
UPDATE profiles SET timezone = 'UTC' WHERE timezone IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE profiles 
ALTER COLUMN timezone SET NOT NULL; 