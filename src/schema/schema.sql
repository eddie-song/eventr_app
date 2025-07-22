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