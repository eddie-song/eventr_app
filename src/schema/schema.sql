-- users table schema
CREATE TABLE IF NOT EXISTS users (
  uuid UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  phone TEXT,
  bio TEXT,
  user_interests TEXT[],
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

-- interests table
CREATE TABLE IF NOT EXISTS interests (
  uuid UUID PRIMARY KEY,
  interest TEXT NOT NULL,
  popular_events UUID[]
);

-- events table
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

-- location table
CREATE TABLE IF NOT EXISTS location (
  uuid UUID PRIMARY KEY,
  location TEXT NOT NULL,
  longitude NUMERIC(9,6),
  latitude NUMERIC(9,6),
  events UUID[],
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00
);

-- person table
CREATE TABLE IF NOT EXISTS person (
  uuid UUID PRIMARY KEY,
  user_id UUID,
  service TEXT NOT NULL,
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00
); 