-- Add price field to events table
ALTER TABLE events ADD COLUMN price DECIMAL(10,2) DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN events.price IS 'Event price in dollars (NULL for free events)'; 