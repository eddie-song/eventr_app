-- Remove rating and review_count columns from location table
ALTER TABLE location DROP COLUMN IF EXISTS rating;
ALTER TABLE location DROP COLUMN IF EXISTS review_count; 