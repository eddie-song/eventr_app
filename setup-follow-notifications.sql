-- ========================================
-- FOLLOW NOTIFICATIONS SETUP
-- ========================================
-- This script sets up the real-time follow notifications system
-- Run this in your Supabase SQL editor

-- ========================================
-- 1. CREATE NOTIFICATIONS TABLE
-- ========================================
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

-- ========================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ========================================
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ========================================
-- 4. CREATE TRIGGER FUNCTION FOR UPDATED_AT
-- ========================================
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
-- 5. CREATE FOLLOW NOTIFICATION FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION create_follow_notification(follower_uuid UUID, following_uuid UUID)
RETURNS UUID AS $$
DECLARE
  follower_profile RECORD;
  notification_id UUID;
BEGIN
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

-- ========================================
-- 6. CREATE HELPER FUNCTIONS
-- ========================================

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS BIGINT AS $$
BEGIN
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
  UPDATE notifications 
  SET is_read = TRUE, updated_at = NOW()
  WHERE user_id = user_uuid AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. CREATE FOLLOW NOTIFICATION TRIGGER
-- ========================================
CREATE OR REPLACE FUNCTION trigger_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_follow_notification(NEW.follower_id, NEW.following_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user_follows table
CREATE TRIGGER create_follow_notification_trigger
  AFTER INSERT ON user_follows
  FOR EACH ROW
  EXECUTE FUNCTION trigger_follow_notification();

-- ========================================
-- 8. ENABLE REAL-TIME FOR NOTIFICATIONS
-- ========================================
-- This enables real-time subscriptions for the notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ========================================
-- 9. VERIFICATION QUERIES
-- ========================================
-- Run these to verify everything is set up correctly:

-- Check if notifications table exists
-- SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications');

-- Check if trigger exists
-- SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'create_follow_notification_trigger';

-- Check if real-time is enabled
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications';

-- ========================================
-- 10. TEST THE SYSTEM
-- ========================================
-- To test the follow notification system:

-- 1. Create a follow relationship (this will trigger the notification):
-- INSERT INTO user_follows (follower_id, following_id) VALUES ('follower-uuid', 'following-uuid');

-- 2. Check if notification was created:
-- SELECT * FROM notifications WHERE type = 'follow' ORDER BY created_at DESC LIMIT 5;

-- 3. Mark notification as read:
-- SELECT mark_notification_as_read('notification-uuid', 'user-uuid');

-- 4. Get unread count:
-- SELECT get_unread_notification_count('user-uuid'); 