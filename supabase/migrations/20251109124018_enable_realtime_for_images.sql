-- Enable Realtime for images table
-- This allows clients to subscribe to INSERT, UPDATE, and DELETE events

-- Enable Realtime publication for the images table
ALTER PUBLICATION supabase_realtime ADD TABLE images;
