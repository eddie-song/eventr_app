-- ========================================
-- EVENTR DATABASE SETUP
-- ========================================
-- Run this script in your Supabase SQL editor to set up all tables

-- ========================================
-- PROFILES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = uuid);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = uuid);

-- ========================================
-- INTERESTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS interests (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for interests
GRANT SELECT, INSERT, UPDATE, DELETE ON interests TO authenticated;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read interests" ON interests FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage interests" ON interests FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- EVENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS events (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  location TEXT,
  description TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  event_type TEXT,
  price NUMERIC(10,2),
  capacity INTEGER,
  image_url TEXT,
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(uuid) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for events
GRANT SELECT, INSERT, UPDATE, DELETE ON events TO authenticated;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own events" ON events FOR DELETE USING (auth.uid() = created_by);

-- ========================================
-- LOCATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS locations (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  description TEXT,
  longitude NUMERIC(9,6),
  latitude NUMERIC(9,6),
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(uuid) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for locations
GRANT SELECT, INSERT, UPDATE, DELETE ON locations TO authenticated;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Users can create locations" ON locations FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own locations" ON locations FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own locations" ON locations FOR DELETE USING (auth.uid() = created_by);

-- ========================================
-- PERSONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS persons (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(uuid) ON DELETE SET NULL,
  service TEXT NOT NULL,
  description TEXT,
  contact_info TEXT,
  hourly_rate NUMERIC(10,2),
  location TEXT,
  service_type TEXT,
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for persons
GRANT SELECT, INSERT, UPDATE, DELETE ON persons TO authenticated;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read persons" ON persons FOR SELECT USING (true);
CREATE POLICY "Users can create persons" ON persons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own persons" ON persons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own persons" ON persons FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- POSTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS posts (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  image_url TEXT,
  post_body_text TEXT,
  location TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for posts
GRANT SELECT, INSERT, UPDATE, DELETE ON posts TO authenticated;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- COMMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS comments (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(uuid) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(uuid) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for comments
GRANT SELECT, INSERT, UPDATE, DELETE ON comments TO authenticated;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create their own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- POST_LIKES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS post_likes (
  post_id UUID NOT NULL REFERENCES posts(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Enable RLS for post_likes
GRANT SELECT, INSERT, UPDATE, DELETE ON post_likes TO authenticated;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read post likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own post likes" ON post_likes FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- COMMENT_LIKES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id UUID NOT NULL REFERENCES comments(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

-- Enable RLS for comment_likes
GRANT SELECT, INSERT, UPDATE, DELETE ON comment_likes TO authenticated;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read comment likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own comment likes" ON comment_likes FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- USER_FOLLOWS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id) -- Prevent self-following
);

-- Enable RLS for user_follows
GRANT SELECT, INSERT, UPDATE, DELETE ON user_follows TO authenticated;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all follow relationships" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can create their own follow relationships" ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follow relationships" ON user_follows FOR DELETE USING (auth.uid() = follower_id);

-- ========================================
-- USER_INTERESTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS user_interests (
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES interests(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, interest_id)
);

-- Enable RLS for user_interests
GRANT SELECT, INSERT, UPDATE, DELETE ON user_interests TO authenticated;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read user interests" ON user_interests FOR SELECT USING (true);
CREATE POLICY "Users can manage their own interests" ON user_interests FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- USER_LOCATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS user_locations (
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, location_name)
);

-- Enable RLS for user_locations
GRANT SELECT, INSERT, UPDATE, DELETE ON user_locations TO authenticated;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read user locations" ON user_locations FOR SELECT USING (true);
CREATE POLICY "Users can manage their own locations" ON user_locations FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- EVENT_TAGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS event_tags (
  event_id UUID NOT NULL REFERENCES events(uuid) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (event_id, tag)
);

-- Enable RLS for event_tags
GRANT SELECT, INSERT, UPDATE, DELETE ON event_tags TO authenticated;
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read event tags" ON event_tags FOR SELECT USING (true);
CREATE POLICY "Users can manage their own event tags" ON event_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.uuid = event_tags.event_id AND events.created_by = auth.uid())
);

-- ========================================
-- EVENT_HOSTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS event_hosts (
  event_id UUID NOT NULL REFERENCES events(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- Enable RLS for event_hosts
GRANT SELECT, INSERT, UPDATE, DELETE ON event_hosts TO authenticated;
ALTER TABLE event_hosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read event hosts" ON event_hosts FOR SELECT USING (true);
CREATE POLICY "Users can manage their own event hosts" ON event_hosts FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.uuid = event_hosts.event_id AND events.created_by = auth.uid())
);

-- ========================================
-- EVENT_ATTENDEES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS event_attendees (
  event_id UUID NOT NULL REFERENCES events(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- Enable RLS for event_attendees
GRANT SELECT, INSERT, UPDATE, DELETE ON event_attendees TO authenticated;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read event attendees" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can manage their own event attendance" ON event_attendees FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- LOCATION_EVENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS location_events (
  location_id UUID NOT NULL REFERENCES locations(uuid) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (location_id, event_id)
);

-- Enable RLS for location_events
GRANT SELECT, INSERT, UPDATE, DELETE ON location_events TO authenticated;
ALTER TABLE location_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read location events" ON location_events FOR SELECT USING (true);
CREATE POLICY "Users can manage their own location events" ON location_events FOR ALL USING (
  EXISTS (SELECT 1 FROM locations WHERE locations.uuid = location_events.location_id AND locations.created_by = auth.uid())
);

-- ========================================
-- POST_TAGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID NOT NULL REFERENCES posts(uuid) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, tag)
);

-- Enable RLS for post_tags
GRANT SELECT, INSERT, UPDATE, DELETE ON post_tags TO authenticated;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read post tags" ON post_tags FOR SELECT USING (true);
CREATE POLICY "Users can manage their own post tags" ON post_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM posts WHERE posts.uuid = post_tags.post_id AND posts.user_id = auth.uid())
);

-- ========================================
-- USER_SAVES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS user_saves (
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, item_type, item_id)
);

-- Enable RLS for user_saves
GRANT SELECT, INSERT, UPDATE, DELETE ON user_saves TO authenticated;
ALTER TABLE user_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read user saves" ON user_saves FOR SELECT USING (true);
CREATE POLICY "Users can manage their own saves" ON user_saves FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- RECOMMENDATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS recommendations (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  image_url TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  type TEXT DEFAULT 'place',
  rating NUMERIC(3,2) DEFAULT NULL
);

-- Enable Row Level Security and policies for recommendations
GRANT SELECT, INSERT, UPDATE, DELETE ON recommendations TO authenticated;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read recommendations" ON recommendations FOR SELECT USING (true);
CREATE POLICY "Users can create their own recommendations" ON recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recommendations" ON recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recommendations" ON recommendations FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- RECOMMENDATION_TAGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS recommendation_tags (
  recommendation_id UUID NOT NULL REFERENCES recommendations(uuid) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (recommendation_id, tag)
);

-- Enable RLS for recommendation_tags
GRANT SELECT, INSERT, UPDATE, DELETE ON recommendation_tags TO authenticated;
ALTER TABLE recommendation_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read recommendation tags" ON recommendation_tags FOR SELECT USING (true);
CREATE POLICY "Users can manage their own recommendation tags" ON recommendation_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM recommendations WHERE recommendations.uuid = recommendation_tags.recommendation_id AND recommendations.user_id = auth.uid())
);

-- ========================================
-- BUSINESS_LOCATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS business_locations (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  longitude NUMERIC(9,6),
  latitude NUMERIC(9,6),
  phone TEXT,
  email TEXT,
  website TEXT,
  business_type TEXT,
  hours_of_operation TEXT,
  price_range TEXT,
  amenities TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(uuid) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security and policies for business_locations
GRANT SELECT, INSERT, UPDATE, DELETE ON business_locations TO authenticated;
ALTER TABLE business_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read business locations" ON business_locations FOR SELECT USING (true);
CREATE POLICY "Users can create business locations" ON business_locations FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own business locations" ON business_locations FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own business locations" ON business_locations FOR DELETE USING (auth.uid() = created_by);

-- ========================================
-- BUSINESS_LOCATION_TAGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS business_location_tags (
  business_location_id UUID NOT NULL REFERENCES business_locations(uuid) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (business_location_id, tag)
);

-- Enable RLS for business_location_tags
GRANT SELECT, INSERT, UPDATE, DELETE ON business_location_tags TO authenticated;
ALTER TABLE business_location_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read business location tags" ON business_location_tags FOR SELECT USING (true);
CREATE POLICY "Users can manage their own business location tags" ON business_location_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM business_locations WHERE business_locations.uuid = business_location_tags.business_location_id AND business_locations.created_by = auth.uid())
);

-- ========================================
-- BUSINESS_LOCATION_REVIEWS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS business_location_reviews (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_location_id UUID NOT NULL REFERENCES business_locations(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_location_id, user_id) -- One review per user per business
);

-- Enable RLS for business_location_reviews
GRANT SELECT, INSERT, UPDATE, DELETE ON business_location_reviews TO authenticated;
ALTER TABLE business_location_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read business location reviews" ON business_location_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON business_location_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON business_location_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON business_location_reviews FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- HELPER FUNCTIONS FOR FOLLOWING/FRIENDS
-- ========================================

-- Function to get users that a specific user is following
CREATE OR REPLACE FUNCTION get_following_users(user_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  followed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.uuid,
    p.username,
    p.display_name,
    p.avatar_url,
    uf.created_at as followed_at
  FROM user_follows uf
  JOIN profiles p ON uf.following_id = p.uuid
  WHERE uf.follower_id = user_uuid
  ORDER BY uf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get users that are following a specific user
CREATE OR REPLACE FUNCTION get_followers(user_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  followed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.uuid,
    p.username,
    p.display_name,
    p.avatar_url,
    uf.created_at as followed_at
  FROM user_follows uf
  JOIN profiles p ON uf.follower_id = p.uuid
  WHERE uf.following_id = user_uuid
  ORDER BY uf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get mutual friends (users that both follow each other)
CREATE OR REPLACE FUNCTION get_mutual_friends(user_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  friendship_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.uuid,
    p.username,
    p.display_name,
    p.avatar_url,
    GREATEST(uf1.created_at, uf2.created_at) as friendship_created_at
  FROM user_follows uf1
  JOIN user_follows uf2 ON uf1.follower_id = uf2.following_id AND uf1.following_id = uf2.follower_id
  JOIN profiles p ON uf1.following_id = p.uuid
  WHERE uf1.follower_id = user_uuid
  ORDER BY friendship_created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if two users are friends (mutual follows)
CREATE OR REPLACE FUNCTION are_friends(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_follows uf1
    JOIN user_follows uf2 ON uf1.follower_id = uf2.following_id AND uf1.following_id = uf2.follower_id
    WHERE uf1.follower_id = user1_uuid AND uf1.following_id = user2_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if one user is following another
CREATE OR REPLACE FUNCTION is_following(follower_uuid UUID, following_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_follows 
    WHERE follower_id = follower_uuid AND following_id = following_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get follow counts for a user
CREATE OR REPLACE FUNCTION get_follow_counts(user_uuid UUID)
RETURNS TABLE (
  following_count BIGINT,
  followers_count BIGINT,
  friends_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM user_follows WHERE follower_id = user_uuid) as following_count,
    (SELECT COUNT(*) FROM user_follows WHERE following_id = user_uuid) as followers_count,
    (SELECT COUNT(*) FROM get_mutual_friends(user_uuid)) as friends_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS FOR LIKE AND COMMENT COUNTS
-- ========================================

-- Trigger function to increment like_count on posts
CREATE OR REPLACE FUNCTION increment_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET like_count = like_count + 1 WHERE uuid = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to decrement like_count on posts
CREATE OR REPLACE FUNCTION decrement_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE uuid = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to increment comment_count on posts
CREATE OR REPLACE FUNCTION increment_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count + 1 WHERE uuid = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to decrement comment_count on posts
CREATE OR REPLACE FUNCTION decrement_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE uuid = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for post_likes
CREATE TRIGGER post_likes_after_insert
AFTER INSERT ON post_likes
FOR EACH ROW EXECUTE FUNCTION increment_post_like_count();

CREATE TRIGGER post_likes_after_delete
AFTER DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION decrement_post_like_count();

-- Create triggers for comments
CREATE TRIGGER comments_after_insert
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION increment_post_comment_count();

CREATE TRIGGER comments_after_delete
AFTER DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION decrement_post_comment_count();

-- ========================================
-- UPDATE RECOMMENDATION_TAGS TABLE
-- ========================================
-- Update the existing recommendation_tags table to reference business_locations
-- This allows recommendations to be linked to specific business locations

-- Drop existing foreign key constraint if it exists
ALTER TABLE recommendation_tags DROP CONSTRAINT IF EXISTS recommendation_tags_recommendation_id_fkey;

-- Add new foreign key constraint to reference business_locations
ALTER TABLE recommendation_tags ADD CONSTRAINT recommendation_tags_recommendation_id_fkey 
  FOREIGN KEY (recommendation_id) REFERENCES business_locations(uuid) ON DELETE CASCADE;

-- Update the policy to work with business_locations
DROP POLICY IF EXISTS "Users can manage their own recommendation tags" ON recommendation_tags;
CREATE POLICY "Users can manage their own recommendation tags" ON recommendation_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM business_locations WHERE business_locations.uuid = recommendation_tags.recommendation_id AND business_locations.created_by = auth.uid())
);

-- ========================================
-- SAMPLE DATA (OPTIONAL)
-- ========================================

-- Insert some sample interests
INSERT INTO interests (interest) VALUES 
  ('Technology'),
  ('Music'),
  ('Sports'),
  ('Food'),
  ('Travel'),
  ('Art'),
  ('Fitness'),
  ('Reading'),
  ('Gaming'),
  ('Photography')
ON CONFLICT (interest) DO NOTHING;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================
-- All tables have been created successfully!
-- You can now use the Eventr application with the complete database schema. 