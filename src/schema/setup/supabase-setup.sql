-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  uuid UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = uuid);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = uuid);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = uuid);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called when a new user signs up
  -- The user profile will be created during onboarding instead
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 

-- Create interests table
CREATE TABLE IF NOT EXISTS interests (
  uuid UUID PRIMARY KEY,
  interest TEXT NOT NULL
);

-- Enable Row Level Security and policies for interests
grant select on interests to authenticated;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read interests" ON interests FOR SELECT USING (true);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  uuid UUID PRIMARY KEY,
  event TEXT NOT NULL,
  location TEXT,
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00
);

-- Enable Row Level Security and policies for events
grant select on events to authenticated;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read events" ON events FOR SELECT USING (true);

-- Create location table
CREATE TABLE IF NOT EXISTS location (
  uuid UUID PRIMARY KEY,
  location TEXT NOT NULL,
  longitude NUMERIC(9,6),
  latitude NUMERIC(9,6),
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00
);

-- Enable Row Level Security and policies for location
grant select on location to authenticated;
ALTER TABLE location ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read locations" ON location FOR SELECT USING (true);

-- Create person table
CREATE TABLE IF NOT EXISTS person (
  uuid UUID PRIMARY KEY,
  user_id UUID,
  service TEXT NOT NULL,
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00
);

-- Enable Row Level Security and policies for person
grant select on person to authenticated;
ALTER TABLE person ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read person" ON person FOR SELECT USING (true);
CREATE POLICY "Users can update their own person record" ON person FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own person record" ON person FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own person record" ON person FOR DELETE USING (auth.uid() = user_id);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  uuid UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  image_url TEXT,
  post_body_text TEXT,
  location TEXT
);

-- Enable Row Level Security and policies for posts
grant select, insert, update, delete on posts to authenticated;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (auth.uid() = user_id); 

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  uuid UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(uuid) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(uuid) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0
);

-- Enable Row Level Security and policies for comments
grant select, insert, update, delete on comments to authenticated;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create their own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Create junction tables

-- User interests junction table
CREATE TABLE IF NOT EXISTS user_interests (
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES interests(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, interest_id)
);

-- Enable RLS for user_interests
grant select, insert, update, delete on user_interests to authenticated;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own interests" ON user_interests FOR ALL USING (auth.uid() = user_id);

-- User locations junction table
CREATE TABLE IF NOT EXISTS user_locations (
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, location_name)
);

-- Enable RLS for user_locations
grant select, insert, update, delete on user_locations to authenticated;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own locations" ON user_locations FOR ALL USING (auth.uid() = user_id);

-- Event tags junction table
CREATE TABLE IF NOT EXISTS event_tags (
  event_id UUID NOT NULL REFERENCES events(uuid) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (event_id, tag)
);

-- Enable RLS for event_tags
grant select, insert, update, delete on event_tags to authenticated;
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read event tags" ON event_tags FOR SELECT USING (true);

-- Event hosts junction table
CREATE TABLE IF NOT EXISTS event_hosts (
  event_id UUID NOT NULL REFERENCES events(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- Enable RLS for event_hosts
grant select, insert, update, delete on event_hosts to authenticated;
ALTER TABLE event_hosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read event hosts" ON event_hosts FOR SELECT USING (true);
CREATE POLICY "Users can manage their own hosted events" ON event_hosts FOR ALL USING (auth.uid() = user_id);

-- Event attendees junction table
CREATE TABLE IF NOT EXISTS event_attendees (
  event_id UUID NOT NULL REFERENCES events(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- Enable RLS for event_attendees
grant select, insert, update, delete on event_attendees to authenticated;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read event attendees" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can manage their own event attendance" ON event_attendees FOR ALL USING (auth.uid() = user_id);

-- Location events junction table
CREATE TABLE IF NOT EXISTS location_events (
  location_id UUID NOT NULL REFERENCES location(uuid) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (location_id, event_id)
);

-- Enable RLS for location_events
grant select, insert, update, delete on location_events to authenticated;
ALTER TABLE location_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read location events" ON location_events FOR SELECT USING (true);

-- Post tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID NOT NULL REFERENCES posts(uuid) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, tag)
);

-- Indexes for post_tags
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_created_at ON post_tags(created_at);

-- Post likes junction table
CREATE TABLE IF NOT EXISTS post_likes (
  post_id UUID NOT NULL REFERENCES posts(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Indexes for post_likes
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON post_likes(created_at);

-- Comment likes junction table
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id UUID NOT NULL REFERENCES comments(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

-- Indexes for comment_likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_created_at ON comment_likes(created_at);

-- User follows junction table
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Indexes for user_follows
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at);

-- User saves junction table
CREATE TABLE IF NOT EXISTS user_saves (
  user_id UUID NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('event', 'location', 'post', 'person')),
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, item_type, item_id)
);

-- Enable RLS for user_saves
grant select, insert, update, delete on user_saves to authenticated;
ALTER TABLE user_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own saves" ON user_saves FOR ALL USING (auth.uid() = user_id); 

-- Add indexes for posts and comments main tables
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_location ON posts(location);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id); 

-- RPC function to increment comment_count on posts
CREATE OR REPLACE FUNCTION increment_post_comment_count(postid UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count + 1 WHERE uuid = postid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 