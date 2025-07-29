-- Migration: Add image_url column to person table
-- This migration adds support for people service images

-- Add image_url column to person table
ALTER TABLE person 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN person.image_url IS 'URL to the service image for this person/service provider';