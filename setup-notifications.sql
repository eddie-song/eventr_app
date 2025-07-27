-- ========================================
-- NOTIFICATIONS SYSTEM SETUP
-- ========================================
-- Run this script in your Supabase SQL editor to set up the real-time notifications system

-- ========================================
-- NOTIFICATIONS TABLE
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

-- Enable RLS for notifications
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ========================================
-- TRIGGERS FOR NOTIFICATIONS
-- ========================================

-- Trigger function to update updated_at timestamp
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
-- HELPER FUNCTIONS FOR NOTIFICATIONS
-- ========================================

-- Function to create a follow notification
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

-- Function to create a like notification
CREATE OR REPLACE FUNCTION create_like_notification(liker_uuid UUID, post_uuid UUID)
RETURNS UUID AS $$
DECLARE
  liker_profile RECORD;
  post_owner_uuid UUID;
  post_content TEXT;
  notification_id UUID;
BEGIN
  -- Get liker profile information
  SELECT username, display_name, avatar_url INTO liker_profile
  FROM profiles WHERE uuid = liker_uuid;
  
  -- Get post information
  SELECT user_id, post_body_text INTO post_owner_uuid, post_content
  FROM posts WHERE uuid = post_uuid;
  
  -- Don't create notification if user likes their own post
  IF liker_uuid = post_owner_uuid THEN
    RETURN NULL;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    post_owner_uuid,
    'like',
    'New Like',
    COALESCE(liker_profile.display_name, liker_profile.username) || ' liked your post',
    jsonb_build_object(
      'liker_id', liker_uuid,
      'liker_username', liker_profile.username,
      'liker_display_name', liker_profile.display_name,
      'liker_avatar_url', liker_profile.avatar_url,
      'post_id', post_uuid,
      'post_content', post_content
    )
  ) RETURNING uuid INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a comment notification
CREATE OR REPLACE FUNCTION create_comment_notification(commenter_uuid UUID, comment_uuid UUID)
RETURNS UUID AS $$
DECLARE
  commenter_profile RECORD;
  comment_data RECORD;
  post_owner_uuid UUID;
  notification_id UUID;
BEGIN
  -- Get commenter profile information
  SELECT username, display_name, avatar_url INTO commenter_profile
  FROM profiles WHERE uuid = commenter_uuid;
  
  -- Get comment and post information
  SELECT c.comment_text, c.post_id, p.user_id, p.post_body_text 
  INTO comment_data
  FROM comments c
  JOIN posts p ON c.post_id = p.uuid
  WHERE c.uuid = comment_uuid;
  
  -- Don't create notification if user comments on their own post
  IF commenter_uuid = comment_data.user_id THEN
    RETURN NULL;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    comment_data.user_id,
    'comment',
    'New Comment',
    COALESCE(commenter_profile.display_name, commenter_profile.username) || ' commented on your post',
    jsonb_build_object(
      'commenter_id', commenter_uuid,
      'commenter_username', commenter_profile.username,
      'commenter_display_name', commenter_profile.display_name,
      'commenter_avatar_url', commenter_profile.avatar_url,
      'comment_id', comment_uuid,
      'comment_text', comment_data.comment_text,
      'post_id', comment_data.post_id,
      'post_content', comment_data.post_body_text
    )
  ) RETURNING uuid INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a message notification
CREATE OR REPLACE FUNCTION create_message_notification(sender_uuid UUID, conversation_uuid UUID)
RETURNS UUID AS $$
DECLARE
  sender_profile RECORD;
  recipient_uuid UUID;
  notification_id UUID;
BEGIN
  -- Get sender profile information
  SELECT username, display_name, avatar_url INTO sender_profile
  FROM profiles WHERE uuid = sender_uuid;
  
  -- Get recipient (other participant in conversation)
  SELECT user_id INTO recipient_uuid
  FROM conversation_participants
  WHERE conversation_id = conversation_uuid AND user_id != sender_uuid
  LIMIT 1;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    recipient_uuid,
    'message',
    'New Message',
    'New message from ' || COALESCE(sender_profile.display_name, sender_profile.username),
    jsonb_build_object(
      'sender_id', sender_uuid,
      'sender_username', sender_profile.username,
      'sender_display_name', sender_profile.display_name,
      'sender_avatar_url', sender_profile.avatar_url,
      'conversation_id', conversation_uuid
    )
  ) RETURNING uuid INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
-- TRIGGERS TO AUTO-CREATE NOTIFICATIONS
-- ========================================

-- Trigger to create follow notification
CREATE OR REPLACE FUNCTION trigger_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_follow_notification(NEW.follower_id, NEW.following_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_follow_notification_trigger
  AFTER INSERT ON user_follows
  FOR EACH ROW
  EXECUTE FUNCTION trigger_follow_notification();

-- Trigger to create like notification
CREATE OR REPLACE FUNCTION trigger_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_like_notification(NEW.user_id, NEW.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_like_notification_trigger
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_like_notification();

-- Trigger to create comment notification
CREATE OR REPLACE FUNCTION trigger_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_comment_notification(NEW.user_id, NEW.uuid);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_comment_notification_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_comment_notification();

-- Trigger to create message notification
CREATE OR REPLACE FUNCTION trigger_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_message_notification(NEW.sender_id, NEW.conversation_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_message_notification_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_message_notification();

-- ========================================
-- ENABLE REAL-TIME FOR NOTIFICATIONS
-- ========================================

-- Enable real-time for the notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications; 