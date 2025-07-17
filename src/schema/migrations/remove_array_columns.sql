-- ========================================
-- MIGRATION: Remove Array Columns
-- ========================================
-- This migration removes array columns that have been replaced with junction tables
-- Run this after creating the junction tables to avoid data loss

-- ========================================
-- STEP 1: Drop RLS Policies that depend on array columns
-- ========================================

-- Drop policies that depend on hosts column in events table
DROP POLICY IF EXISTS "Hosts can update their events" ON events;
DROP POLICY IF EXISTS "Hosts can delete their events" ON events;

-- Drop policies that depend on attendees column in events table
DROP POLICY IF EXISTS "Attendees can read events they're attending" ON events;

-- Drop policies that depend on following/followers columns in profiles table
DROP POLICY IF EXISTS "Users can view profiles they follow" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles following them" ON profiles;

-- ========================================
-- STEP 2: Remove Array Columns
-- ========================================

-- Remove likes array from posts table
ALTER TABLE posts DROP COLUMN IF EXISTS likes;

-- Remove liked_posts array from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS liked_posts;

-- Remove interests array from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS interests;

-- Remove location array from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS location;

-- Remove tags array from events table
ALTER TABLE events DROP COLUMN IF EXISTS tags;

-- Remove hosts array from events table
ALTER TABLE events DROP COLUMN IF EXISTS hosts;

-- Remove attendees array from events table
ALTER TABLE events DROP COLUMN IF EXISTS attendees;

-- Remove events array from location table
ALTER TABLE location DROP COLUMN IF EXISTS events;

-- Remove tags array from posts table
ALTER TABLE posts DROP COLUMN IF EXISTS tags;

-- Remove replies array from comments table
ALTER TABLE comments DROP COLUMN IF EXISTS replies;

-- Remove following array from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS following;

-- Remove followers array from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS followers;

-- Remove saved array from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS saved;

-- ========================================
-- STEP 3: Recreate RLS Policies for Junction Tables
-- ========================================

-- Note: The junction table policies are already created in supabase-setup.sql
-- These policies handle the relationships that were previously managed by arrays

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these queries to verify the columns have been removed

-- Check posts table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;

-- Check profiles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check events table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- Check location table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'location' 
ORDER BY ordinal_position;

-- Check comments table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comments' 
ORDER BY ordinal_position;

-- Check that junction tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN (
  'user_interests', 'user_locations', 'event_tags', 'event_hosts', 
  'event_attendees', 'location_events', 'post_tags', 'post_likes', 
  'comment_likes', 'user_follows', 'user_saves'
)
ORDER BY table_name; 