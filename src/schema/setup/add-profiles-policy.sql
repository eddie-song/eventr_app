-- Add policy to allow authenticated users to view all profiles
-- This is needed for the social discovery feature

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create a new policy that allows viewing all profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Keep the existing update and insert policies
-- (These should already exist from the original setup) 