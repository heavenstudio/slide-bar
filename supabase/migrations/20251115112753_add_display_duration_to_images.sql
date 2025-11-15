-- Add display_duration column to images table
-- Default value: 5000ms (5 seconds) to maintain current behavior
ALTER TABLE images ADD COLUMN display_duration INTEGER DEFAULT 5000 NOT NULL;

-- Update existing images to have the default duration
-- (This is technically redundant due to the DEFAULT, but makes migration explicit)
UPDATE images SET display_duration = 5000 WHERE display_duration IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN images.display_duration IS 'Duration in milliseconds that this image should be displayed in the slideshow (default: 5000ms)';
