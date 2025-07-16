-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  uuid UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  phone TEXT,
  bio TEXT,
  user_interests UUID[],
  locations TEXT[],
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  posted_events UUID[],
  saved_events UUID[],
  posted_locations UUID[],
  saved_locations UUID[],
  posted_person UUID[],
  saved_person UUID[],
  posts UUID[],
  liked_posts UUID[],
  saved_posts UUID[],
  comments UUID[],
  following UUID[],
  followers UUID[]
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
  interest TEXT NOT NULL,
  popular_events UUID[]
);

-- Enable Row Level Security and policies for interests
grant select on interests to authenticated;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read interests" ON interests FOR SELECT USING (true);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  uuid UUID PRIMARY KEY,
  event TEXT NOT NULL,
  tags TEXT[],
  hosts UUID[],
  attendees UUID[],
  location TEXT,
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00
);

-- Enable Row Level Security and policies for events
grant select on events to authenticated;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read events" ON events FOR SELECT USING (true);
-- Example: Only allow event hosts to update/delete (assuming hosts contains auth.uid())
CREATE POLICY "Hosts can update their events" ON events FOR UPDATE USING (auth.uid() = ANY(hosts));
CREATE POLICY "Hosts can delete their events" ON events FOR DELETE USING (auth.uid() = ANY(hosts));

-- Create location table
CREATE TABLE IF NOT EXISTS location (
  uuid UUID PRIMARY KEY,
  location TEXT NOT NULL,
  longitude NUMERIC(9,6),
  latitude NUMERIC(9,6),
  events UUID[],
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00
);

-- Enable Row Level Security and policies for location
grant select on location to authenticated;
ALTER TABLE location ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read locations" ON location FOR SELECT USING (true);
-- Example: Only allow event creators to update/delete location if you have a user_id column

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
  likes UUID[] DEFAULT '{}',
  comments UUID[] DEFAULT '{}',
  image_url TEXT,
  post_body_text TEXT,
  location TEXT,
  tags TEXT[] DEFAULT '{}'
);

-- Enable Row Level Security and policies for posts
grant select, insert, update, delete on posts to authenticated;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (auth.uid() = user_id); 