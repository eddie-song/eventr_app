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
--   review_count: INTEGER - Number of reviews (default: 0)
--   rating: NUMERIC(3,2) - Average rating (default: 0.00)
--   created_at: TIMESTAMP WITH TIME ZONE - Person creation time
--   contact_info: TEXT - Contact information for the person
--   description: TEXT - Detailed description of the person's services and expertise
--   hourly_rate: NUMERIC(10,2) - Hourly rate for the person
--   location: TEXT - Location of the person
--   service_type: TEXT (NOT NULL) - Category/type of service provided (e.g., 'photography', 'catering', 'music')

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
-- Junction table for business location tags (renamed from recommendation tags)

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
  SET search_path = public, pg_temp;
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
  SET search_path = public, pg_temp;
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
  SET search_path = public, pg_temp;
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
  SET search_path = public, pg_temp;
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
  SET search_path = public, pg_temp;
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
  SET search_path = public, pg_temp;
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
CREATE POLICY "Users can create business locations" ON business_locations FOR INSERT WITH CHECK (
  auth.uid() = created_by OR (created_by IS NULL AND auth.uid() IS NOT NULL)
);
CREATE POLICY "Users can update their own business locations" ON business_locations FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own business locations" ON business_locations FOR DELETE USING (auth.uid() = created_by);

-- Trigger to automatically set created_by when it's NULL
CREATE OR REPLACE FUNCTION set_business_location_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER business_locations_set_created_by
  BEFORE INSERT ON business_locations
  FOR EACH ROW
  EXECUTE FUNCTION set_business_location_created_by();

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
-- MESSAGING SYSTEM TABLES
-- ========================================

-- ========================================
-- CONVERSATIONS TABLE
-- ========================================
-- Table for storing conversation metadata
--
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique conversation identifier
--   created_at: TIMESTAMP WITH TIME ZONE - Conversation creation time
--   updated_at: TIMESTAMP WITH TIME ZONE - Last message time
--   conversation_type: TEXT - Type of conversation ('direct', 'group')
--   name: TEXT - Group name (for group conversations)
--   created_by: UUID - UUID of the user who created the conversation

CREATE TABLE IF NOT EXISTS conversations (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_type TEXT NOT NULL DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group')),
  name TEXT, -- Only for group conversations
  created_by UUID REFERENCES profiles(uuid) ON DELETE SET NULL,
  -- Add computed columns for direct conversation uniqueness
  user1_id UUID,
  user2_id UUID
);

-- Create partial unique index for direct conversations to prevent duplicates
CREATE UNIQUE INDEX unique_direct_conversation 
ON conversations (conversation_type, user1_id, user2_id) 
WHERE conversation_type = 'direct' AND user1_id IS NOT NULL AND user2_id IS NOT NULL;

-- Enable RLS for conversations
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO authenticated;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can view conversations they participate in" ON conversations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_participants.conversation_id = conversations.uuid 
    AND conversation_participants.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update conversations they created" ON conversations FOR UPDATE USING (auth.uid() = created_by);

-- ========================================
-- CONVERSATION_PARTICIPANTS TABLE
-- ========================================
-- Junction table for conversation participants
--
-- Columns:
--   conversation_id: UUID (NOT NULL) - UUID of the conversation
--   user_id: UUID (NOT NULL) - UUID of the participant
--   joined_at: TIMESTAMP WITH TIME ZONE - When the user joined
--   role: TEXT - User role in conversation ('member', 'admin')
--   PRIMARY KEY: (conversation_id, user_id)

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  PRIMARY KEY (conversation_id, user_id)
);

-- Enable RLS for conversation_participants
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_participants TO authenticated;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Policies for conversation_participants
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp2
    WHERE cp2.conversation_id = conversation_participants.conversation_id 
    AND cp2.user_id = auth.uid()
  )
);
CREATE POLICY "Users can add themselves to conversations" ON conversation_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove themselves from conversations" ON conversation_participants FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- MESSAGES TABLE
-- ========================================
-- Table for storing individual messages
--
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique message identifier
--   conversation_id: UUID (NOT NULL) - UUID of the conversation
--   sender_id: UUID (NOT NULL) - UUID of the message sender
--   content: TEXT (NOT NULL) - Message content
--   message_type: TEXT - Type of message ('text', 'image', 'file')
--   file_url: TEXT - URL to attached file
--   created_at: TIMESTAMP WITH TIME ZONE - Message creation time
--   updated_at: TIMESTAMP WITH TIME ZONE - Last edit time
--   is_edited: BOOLEAN - Whether message has been edited
--   reply_to: UUID - UUID of the message this is replying to

CREATE TABLE IF NOT EXISTS messages (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(uuid) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  reply_to UUID REFERENCES messages(uuid) ON DELETE SET NULL
);

-- Enable RLS for messages
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO authenticated;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_participants.conversation_id = messages.conversation_id 
    AND conversation_participants.user_id = auth.uid()
  )
);
CREATE POLICY "Users can send messages to their conversations" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_participants.conversation_id = messages.conversation_id 
    AND conversation_participants.user_id = auth.uid()
  )
);
CREATE POLICY "Users can edit their own messages" ON messages FOR UPDATE USING (auth.uid() = sender_id);
CREATE POLICY "Users can delete their own messages" ON messages FOR DELETE USING (auth.uid() = sender_id);

-- ========================================
-- MESSAGE_READS TABLE
-- ========================================
-- Table for tracking message read status
--
-- Columns:
--   message_id: UUID (NOT NULL) - UUID of the message
--   user_id: UUID (NOT NULL) - UUID of the user who read the message
--   read_at: TIMESTAMP WITH TIME ZONE - When the message was read
--   PRIMARY KEY: (message_id, user_id)

CREATE TABLE IF NOT EXISTS message_reads (
  message_id UUID NOT NULL REFERENCES messages(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- Enable RLS for message_reads
GRANT SELECT, INSERT, UPDATE, DELETE ON message_reads TO authenticated;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- Policies for message_reads
CREATE POLICY "Users can view their own read status" ON message_reads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark messages as read" ON message_reads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- HELPER FUNCTIONS FOR MESSAGING
-- ========================================

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS BIGINT AS $$
BEGIN
  SET search_path = public, pg_temp;
  RETURN (
    SELECT COUNT(*)
    FROM messages m
    JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
    LEFT JOIN message_reads mr ON m.uuid = mr.message_id AND mr.user_id = user_uuid
    WHERE cp.user_id = user_uuid 
    AND m.sender_id != user_uuid
    AND mr.message_id IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation participants
CREATE OR REPLACE FUNCTION get_conversation_participants(conversation_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT,
  joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  SET search_path = public, pg_temp;
  RETURN QUERY
  SELECT 
    p.uuid,
    p.username,
    p.display_name,
    p.avatar_url,
    cp.role,
    cp.joined_at
  FROM conversation_participants cp
  JOIN profiles p ON cp.user_id = p.uuid
  WHERE cp.conversation_id = conversation_uuid
  ORDER BY cp.joined_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create or get direct conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(user1_uuid UUID, user2_uuid UUID)
RETURNS UUID AS $$
DECLARE
  existing_conversation_id UUID;
  new_conversation_id UUID;
  sorted_user1 UUID;
  sorted_user2 UUID;
BEGIN
  SET search_path = public, pg_temp;
  
  -- Sort user IDs to ensure consistent ordering for unique constraint
  IF user1_uuid < user2_uuid THEN
    sorted_user1 := user1_uuid;
    sorted_user2 := user2_uuid;
  ELSE
    sorted_user1 := user2_uuid;
    sorted_user2 := user1_uuid;
  END IF;
  
  -- Check if direct conversation already exists using the new columns
  SELECT c.uuid INTO existing_conversation_id
  FROM conversations c
  WHERE c.conversation_type = 'direct'
  AND c.user1_id = sorted_user1
  AND c.user2_id = sorted_user2
  LIMIT 1;

  IF existing_conversation_id IS NOT NULL THEN
    RETURN existing_conversation_id;
  END IF;

  -- Try to create new direct conversation with unique constraint
  BEGIN
    INSERT INTO conversations (conversation_type, created_by, user1_id, user2_id)
    VALUES ('direct', user1_uuid, sorted_user1, sorted_user2)
    RETURNING uuid INTO new_conversation_id;

    -- Temporarily disable RLS to allow inserting both participants
    PERFORM set_config('role', 'service_role', true);
    
    -- Add both users as participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
      (new_conversation_id, user1_uuid),
      (new_conversation_id, user2_uuid);
    
    -- Reset role back to authenticated user
    PERFORM set_config('role', 'authenticated', true);

    RETURN new_conversation_id;
  EXCEPTION
    WHEN unique_violation THEN
      -- Another process created the conversation, get the existing one
      SELECT c.uuid INTO existing_conversation_id
      FROM conversations c
      WHERE c.conversation_type = 'direct'
      AND c.user1_id = sorted_user1
      AND c.user2_id = sorted_user2
      LIMIT 1;
      
      RETURN existing_conversation_id;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS FOR MESSAGING
-- ========================================

-- Trigger to update conversation updated_at when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NEW.created_at 
  WHERE uuid = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- ========================================
-- NOTIFICATIONS TABLE
-- ========================================
-- Table for storing user notifications
--
-- Columns:
--   uuid: UUID (PRIMARY KEY) - Unique notification identifier
--   user_id: UUID (NOT NULL) - UUID of the user receiving the notification
--   type: TEXT (NOT NULL) - Type of notification ('follow', 'message', 'like', 'comment')
--   title: TEXT (NOT NULL) - Notification title
--   message: TEXT (NOT NULL) - Notification message
--   data: JSONB - Additional data for the notification
--   is_read: BOOLEAN - Whether the notification has been read
--   created_at: TIMESTAMP WITH TIME ZONE - When the notification was created
--   updated_at: TIMESTAMP WITH TIME ZONE - Last update time

CREATE TABLE IF NOT EXISTS notifications (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'message', 'like', 'comment')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notifications
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ========================================
-- TRIGGERS FOR NOTIFICATIONS
-- ========================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_update_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- ========================================
-- HELPER FUNCTIONS FOR NOTIFICATIONS
-- ========================================

-- Function to create a follow notification
CREATE OR REPLACE FUNCTION create_follow_notification(follower_uuid UUID, following_uuid UUID)
RETURNS UUID AS $$
DECLARE
  follower_profile RECORD;
  notification_id UUID;
BEGIN
  SET search_path = public, pg_temp;
  -- Get follower profile information
  SELECT username, display_name, avatar_url INTO follower_profile
  FROM profiles WHERE uuid = follower_uuid;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    following_uuid,
    'follow',
    'New Follower',
    COALESCE(follower_profile.display_name, follower_profile.username) || ' started following you',
    jsonb_build_object(
      'follower_id', follower_uuid,
      'follower_username', follower_profile.username,
      'follower_display_name', follower_profile.display_name,
      'follower_avatar_url', follower_profile.avatar_url
    )
  ) RETURNING uuid INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a like notification
CREATE OR REPLACE FUNCTION create_like_notification(liker_uuid UUID, post_uuid UUID)
RETURNS UUID AS $$
DECLARE
  liker_profile RECORD;
  post_owner_uuid UUID;
  post_content TEXT;
  notification_id UUID;
BEGIN
  SET search_path = public, pg_temp;
  -- Get liker profile information
  SELECT username, display_name, avatar_url INTO liker_profile
  FROM profiles WHERE uuid = liker_uuid;
  
  -- Get post information
  SELECT user_id, post_body_text INTO post_owner_uuid, post_content
  FROM posts WHERE uuid = post_uuid;
  
  -- Don't create notification if user likes their own post
  IF liker_uuid = post_owner_uuid THEN
    RETURN NULL;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    post_owner_uuid,
    'like',
    'New Like',
    COALESCE(liker_profile.display_name, liker_profile.username) || ' liked your post',
    jsonb_build_object(
      'liker_id', liker_uuid,
      'liker_username', liker_profile.username,
      'liker_display_name', liker_profile.display_name,
      'liker_avatar_url', liker_profile.avatar_url,
      'post_id', post_uuid,
      'post_content', post_content
    )
  ) RETURNING uuid INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a comment notification
CREATE OR REPLACE FUNCTION create_comment_notification(commenter_uuid UUID, comment_uuid UUID)
RETURNS UUID AS $$
DECLARE
  commenter_profile RECORD;
  comment_data RECORD;
  post_owner_uuid UUID;
  notification_id UUID;
BEGIN
  SET search_path = public, pg_temp;
  -- Get commenter profile information
  SELECT username, display_name, avatar_url INTO commenter_profile
  FROM profiles WHERE uuid = commenter_uuid;
  
  -- Get comment and post information
  SELECT c.comment_text, c.post_id, p.user_id, p.post_body_text 
  INTO comment_data
  FROM comments c
  JOIN posts p ON c.post_id = p.uuid
  WHERE c.uuid = comment_uuid;
  
  -- Don't create notification if user comments on their own post
  IF commenter_uuid = comment_data.user_id THEN
    RETURN NULL;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    comment_data.user_id,
    'comment',
    'New Comment',
    COALESCE(commenter_profile.display_name, commenter_profile.username) || ' commented on your post',
    jsonb_build_object(
      'commenter_id', commenter_uuid,
      'commenter_username', commenter_profile.username,
      'commenter_display_name', commenter_profile.display_name,
      'commenter_avatar_url', commenter_profile.avatar_url,
      'comment_id', comment_uuid,
      'comment_text', comment_data.comment_text,
      'post_id', comment_data.post_id,
      'post_content', comment_data.post_body_text
    )
  ) RETURNING uuid INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a message notification
CREATE OR REPLACE FUNCTION create_message_notification(sender_uuid UUID, conversation_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  sender_profile RECORD;
  notification_count INTEGER;
BEGIN
  SET search_path = public, pg_temp;
  -- Get sender profile information
  SELECT username, display_name, avatar_url INTO sender_profile
  FROM profiles WHERE uuid = sender_uuid;
  
  -- Create notifications for all conversation participants except the sender
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT 
    cp.user_id,
    'message',
    'New Message',
    'New message from ' || COALESCE(sender_profile.display_name, sender_profile.username),
    jsonb_build_object(
      'sender_id', sender_uuid,
      'sender_username', sender_profile.username,
      'sender_display_name', sender_profile.display_name,
      'sender_avatar_url', sender_profile.avatar_url,
      'conversation_id', conversation_uuid
    )
  FROM conversation_participants cp
  WHERE cp.conversation_id = conversation_uuid 
    AND cp.user_id != sender_uuid;
  
  GET DIAGNOSTICS notification_count = ROW_COUNT;
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS BIGINT AS $$
BEGIN
  SET search_path = public, pg_temp;
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = user_uuid AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  SET search_path = public, pg_temp;
  UPDATE notifications 
  SET is_read = TRUE, updated_at = NOW()
  WHERE uuid = notification_uuid AND user_id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  SET search_path = public, pg_temp;
  UPDATE notifications 
  SET is_read = TRUE, updated_at = NOW()
  WHERE user_id = user_uuid AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS TO AUTO-CREATE NOTIFICATIONS
-- ========================================

-- Trigger to create follow notification
CREATE OR REPLACE FUNCTION trigger_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_follow_notification(NEW.follower_id, NEW.following_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_follow_notification_trigger
  AFTER INSERT ON user_follows
  FOR EACH ROW
  EXECUTE FUNCTION trigger_follow_notification();

-- Trigger to create like notification
CREATE OR REPLACE FUNCTION trigger_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_like_notification(NEW.user_id, NEW.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_like_notification_trigger
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_like_notification();

-- Trigger to create comment notification
CREATE OR REPLACE FUNCTION trigger_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_comment_notification(NEW.user_id, NEW.uuid);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_comment_notification_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_comment_notification();

-- Trigger to create message notification
CREATE OR REPLACE FUNCTION trigger_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_message_notification(NEW.sender_id, NEW.conversation_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_message_notification_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_message_notification();

 