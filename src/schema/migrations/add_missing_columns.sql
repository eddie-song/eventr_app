-- ========================================
-- MIGRATION: Add Missing Columns to Posts Table
-- ========================================
-- This migration adds the like_count and comment_count columns that are missing from the posts table

-- Add like_count column to posts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'like_count'
    ) THEN
        ALTER TABLE posts ADD COLUMN like_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add comment_count column to posts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'comment_count'
    ) THEN
        ALTER TABLE posts ADD COLUMN comment_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these queries to verify the columns have been added

-- Check posts table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;

-- Check if like_count and comment_count exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'like_count'
    ) THEN 'like_count EXISTS' ELSE 'like_count MISSING' END as like_count_status,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'comment_count'
    ) THEN 'comment_count EXISTS' ELSE 'comment_count MISSING' END as comment_count_status; 