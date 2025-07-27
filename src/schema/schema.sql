-- ========================================
-- DATABASE SCHEMA REFERENCE
-- ========================================

-- ========================================
-- PROFILES TABLE
-- ========================================
-- Primary table for user accounts and profiles
-- 
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique user identifier
--   created_at: TIMESTAMP WITH TIME ZONE - Account creation time
--   username: TEXT (UNIQUE, NOT NULL) - Username for login
--   email: TEXT (UNIQUE, NOT NULL) - User's email address
--   display_name: TEXT - User's display name
--   phone: TEXT - User's phone number
--   bio: TEXT - User's biography/description
--   avatar_url: TEXT - URL to user's profile picture
--   updated_at: TIMESTAMP WITH TIME ZONE - Last profile update time

-- ========================================
-- INTERESTS TABLE
-- ========================================
-- Table for storing interest categories
--
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique interest identifier
--   interest: TEXT (NOT NULL) - Name of the interest

-- ========================================
-- EVENTS TABLE
-- ========================================
-- Table for storing event information
--
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique event identifier
--   event: TEXT (NOT NULL) - Event name/description
--   location: TEXT - Event location
--   review_count: INTEGER - Number of reviews (default: 0)
--   rating: NUMERIC(3,2) - Average rating (default: 0.00)

-- ========================================
-- LOCATION TABLE
-- ========================================
-- Table for storing location information
--
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique location identifier
--   location: TEXT (NOT NULL) - Location name/address
--   longitude: NUMERIC(9,6) - Longitude coordinate
--   latitude: NUMERIC(9,6) - Latitude coordinate
--   review_count: INTEGER - Number of reviews (default: 0)
--   rating: NUMERIC(3,2) - Average rating (default: 0.00)

-- ========================================
-- PERSON TABLE
-- ========================================
-- Table for storing person/service provider information
--
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique person identifier
--   user_id: UUID - Associated user UUID
--   service: TEXT (NOT NULL) - Type of service provided
--   review_count: INTEGER - Number of reviews (default: 0)
--   rating: NUMERIC(3,2) - Average rating (default: 0.00)
--   created_at: TIMESTAMP WITH TIME ZONE - Person creation time
--   contact_info: TEXT - Contact information for the person
--   description: TEXT - Description of the person
--   hourly_rate: NUMERIC(10,2) - Hourly rate for the person
--   location: TEXT - Location of the person
--   service_type: TEXT - Type of service provided

-- ========================================
-- POSTS TABLE
-- ========================================
-- Table for storing social media posts
--
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique post identifier
--   created_at: TIMESTAMP WITH TIME ZONE - Post creation time
--   user_id: UUID (NOT NULL) - UUID of the user who created the post
--   like_count: INTEGER - Number of likes on the post (default: 0)
--   comment_count: INTEGER - Number of comments on the post (default: 0)
--   image_url: TEXT - URL to post image
--   post_body_text: TEXT - Text content of the post
--   location: TEXT - Location associated with the post

-- ========================================
-- RECOMMENDATIONS TABLE
-- ========================================
-- Table for storing user recommendations (places, events, services, etc.)
--
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique recommendation identifier
--   created_at: TIMESTAMP WITH TIME ZONE - Recommendation creation time
--   user_id: UUID (NOT NULL) - UUID of the user who created the recommendation
--   image_url: TEXT - URL to recommendation image
--   title: TEXT (NOT NULL) - Title of the recommendation
--   description: TEXT (NOT NULL) - Description of the recommendation
--   location: TEXT - Location associated with the recommendation
--   type: TEXT - Type/category (e.g., place, event, service, other)
--   rating: NUMERIC(3,2) - Optional rating (0.00-5.00)

CREATE TABLE IF NOT EXISTS recommendations (
  uuid UUID PRIMARY KEY,
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
-- Junction table for recommendation tags
--
-- Columns:
--   recommendation_id: UUID (NOT NULL) - UUID of the recommendation
--   tag: TEXT (NOT NULL) - Tag name
--   created_at: TIMESTAMP WITH TIME ZONE - When the tag was added
--   PRIMARY KEY: (recommendation_id, tag)

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
-- COMMENTS TABLE
-- ========================================
-- Table for storing comments on posts
--
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique comment identifier
--   created_at: TIMESTAMP WITH TIME ZONE - Comment creation time
--   user_id: UUID (NOT NULL) - UUID of the user who created the comment
--   post_id: UUID (NOT NULL) - UUID of the post this comment belongs to
--   parent_comment_id: UUID - UUID of the parent comment (for replies, NULL for top-level comments)
--   comment_text: TEXT (NOT NULL) - Text content of the comment
--   like_count: INTEGER - Number of likes on the comment (default: 0)
--   reply_count: INTEGER - Number of replies to this comment (default: 0)

-- ========================================
-- JUNCTION TABLES
-- ========================================

-- ========================================
-- USER_INTERESTS TABLE
-- ========================================
-- Junction table for user interests
--
-- Columns:
--   user_id: UUID (NOT NULL) - UUID of the user
--   interest_id: UUID (NOT NULL) - UUID of the interest
--   created_at: TIMESTAMP WITH TIME ZONE - When the interest was added
--   PRIMARY KEY: (user_id, interest_id)

-- ========================================
-- USER_LOCATIONS TABLE
-- ========================================
-- Junction table for user preferred locations
--
-- Columns:
--   user_id: UUID (NOT NULL) - UUID of the user
--   location_name: TEXT (NOT NULL) - Name of the location
--   created_at: TIMESTAMP WITH TIME ZONE - When the location was added
--   PRIMARY KEY: (user_id, location_name)

-- ========================================
-- EVENT_TAGS TABLE
-- ========================================
-- Junction table for event tags
--
-- Columns:
--   event_id: UUID (NOT NULL) - UUID of the event
--   tag: TEXT (NOT NULL) - Tag name
--   created_at: TIMESTAMP WITH TIME ZONE - When the tag was added
--   PRIMARY KEY: (event_id, tag)

-- ========================================
-- EVENT_HOSTS TABLE
-- ========================================
-- Junction table for event hosts
--
-- Columns:
--   event_id: UUID (NOT NULL) - UUID of the event
--   user_id: UUID (NOT NULL) - UUID of the host
--   created_at: TIMESTAMP WITH TIME ZONE - When the host was added
--   PRIMARY KEY: (event_id, user_id)

-- ========================================
-- EVENT_ATTENDEES TABLE
-- ========================================
-- Junction table for event attendees
--
-- Columns:
--   event_id: UUID (NOT NULL) - UUID of the event
--   user_id: UUID (NOT NULL) - UUID of the attendee
--   created_at: TIMESTAMP WITH TIME ZONE - When the user joined
--   PRIMARY KEY: (event_id, user_id)

-- ========================================
-- LOCATION_EVENTS TABLE
-- ========================================
-- Junction table for events at locations
--
-- Columns:
--   location_id: UUID (NOT NULL) - UUID of the location
--   event_id: UUID (NOT NULL) - UUID of the event
--   created_at: TIMESTAMP WITH TIME ZONE - When the event was added
--   PRIMARY KEY: (location_id, event_id)

-- ========================================
-- POST_TAGS TABLE
-- ========================================
-- Junction table for post tags
--
-- Columns:
--   post_id: UUID (NOT NULL) - UUID of the post
--   tag: TEXT (NOT NULL) - Tag name
--   created_at: TIMESTAMP WITH TIME ZONE - When the tag was added
--   PRIMARY KEY: (post_id, tag)

-- ========================================
-- POST_LIKES TABLE
-- ========================================
-- Junction table for tracking which users liked which posts
--
-- Columns:
--   post_id: UUID (NOT NULL) - UUID of the post that was liked
--   user_id: UUID (NOT NULL) - UUID of the user who liked the post
--   created_at: TIMESTAMP WITH TIME ZONE - When the like was created
--   PRIMARY KEY: (post_id, user_id) - Ensures a user can only like a post once

-- ========================================
-- COMMENT_LIKES TABLE
-- ========================================
-- Junction table for tracking which users liked which comments
--
-- Columns:
--   comment_id: UUID (NOT NULL) - UUID of the comment that was liked
--   user_id: UUID (NOT NULL) - UUID of the user who liked the comment
--   created_at: TIMESTAMP WITH TIME ZONE - When the like was created
--   PRIMARY KEY: (comment_id, user_id) - Ensures a user can only like a comment once

-- ========================================
-- USER_FOLLOWS TABLE
-- ========================================
-- Junction table for user following relationships
--
-- Columns:
--   follower_id: UUID (NOT NULL) - UUID of the user who is following
--   following_id: UUID (NOT NULL) - UUID of the user being followed
--   created_at: TIMESTAMP WITH TIME ZONE - When the follow relationship was created
--   PRIMARY KEY: (follower_id, following_id) - Ensures unique follow relationships

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

-- Policies for user_follows
CREATE POLICY "Users can view all follow relationships" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can create their own follow relationships" ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follow relationships" ON user_follows FOR DELETE USING (auth.uid() = follower_id);

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
-- USER_SAVES TABLE
-- ========================================
-- Junction table for user saved items (events, locations, posts, etc.)
--
-- Columns:
--   user_id: UUID (NOT NULL) - UUID of the user
--   item_type: TEXT (NOT NULL) - Type of saved item ('event', 'location', 'post', 'person')
--   item_id: UUID (NOT NULL) - UUID of the saved item
--   created_at: TIMESTAMP WITH TIME ZONE - When the item was saved
--   PRIMARY KEY: (user_id, item_type, item_id) - Ensures unique saves per user per item

-- ========================================
-- BUSINESS_LOCATIONS TABLE
-- ========================================
-- Table for storing detailed business location information
--
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique business location identifier
--   name: TEXT - Business name
--   description: TEXT - Business description
--   address: TEXT - Street address
--   city: TEXT - City name
--   state: TEXT - State/province
--   zip_code: TEXT - Postal/ZIP code
--   country: TEXT - Country name
--   longitude: NUMERIC(9,6) - Longitude coordinate
--   latitude: NUMERIC(9,6) - Latitude coordinate
--   phone: TEXT - Phone number
--   email: TEXT - Email address
--   website: TEXT - Website URL
--   business_type: TEXT - Type of business
--   hours_of_operation: TEXT - Operating hours
--   price_range: TEXT - Price range indicator
--   amenities: TEXT[] - Array of available amenities
--   image_url: TEXT - URL to business image
--   created_at: TIMESTAMP WITH TIME ZONE - When the business was added
--   created_by: UUID - UUID of the user who created the business
--   updated_at: TIMESTAMP WITH TIME ZONE - Last update time

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
-- Junction table for business location tags
--
-- Columns:
--   business_location_id: UUID (NOT NULL) - UUID of the business location
--   tag: TEXT (NOT NULL) - Tag name
--   created_at: TIMESTAMP WITH TIME ZONE - When the tag was added
--   PRIMARY KEY: (business_location_id, tag)

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
-- Table for storing user reviews of business locations
--
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique review identifier
--   business_location_id: UUID (NOT NULL) - UUID of the business location
--   user_id: UUID (NOT NULL) - UUID of the user who wrote the review
--   rating: INTEGER - Rating (1-5)
--   review_text: TEXT - Review content
--   created_at: TIMESTAMP WITH TIME ZONE - When the review was created
--   updated_at: TIMESTAMP WITH TIME ZONE - Last update time

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