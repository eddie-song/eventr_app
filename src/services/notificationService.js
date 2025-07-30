import { supabase } from '../lib/supabaseClient';

export const notificationService = {
  // Get all notifications for the current user
  async getNotifications(limit = 50, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  // Mark a notification as read
  async markAsRead(notificationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('mark_notification_as_read', {
        notification_uuid: notificationId,
        user_uuid: user.id
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('mark_all_notifications_as_read', {
        user_uuid: user.id
      });

      if (error) throw error;
      return { success: true, updatedCount: data };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Get notification count for the current user
  async getNotificationCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get unread notifications count
      const { data: unreadCount, error: unreadError } = await supabase.rpc('get_unread_notification_count', {
        user_uuid: user.id
      });

      if (unreadError) throw unreadError;

      // Get counts by type
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('type, is_read')
        .eq('user_id', user.id);

      if (notificationsError) throw notificationsError;

      // Calculate counts by type
      const counts = {
        total: unreadCount || 0,
        messages: 0,
        followers: 0,
        likes: 0,
        comments: 0
      };

      notifications.forEach(notification => {
        if (!notification.is_read) {
          switch (notification.type) {
            case 'message':
              counts.messages++;
              break;
            case 'follow':
              counts.followers++;
              break;
            case 'like':
              counts.likes++;
              break;
            case 'comment':
              counts.comments++;
              break;
          }
        }
      });

      return counts;
    } catch (error) {
      console.error('Error getting notification count:', error);
      throw error;
    }
  },

  // Subscribe to real-time notifications
  async subscribeToNotifications(callback) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('New notification received:', payload);
          callback(payload.new);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('Notification updated:', payload);
          callback(payload.new, 'UPDATE');
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('Notification deleted:', payload);
          callback(payload.old, 'DELETE');
        })
        .subscribe();
    } catch (error) {
      console.error('Error setting up notification subscription:', error);
      return null;
    }
  },

  // Unsubscribe from real-time notifications
  unsubscribeFromNotifications(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  },

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('uuid', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Get notification statistics
  async getNotificationStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Use database function to calculate statistics efficiently
      const { data, error } = await supabase.rpc('get_notification_stats', {
        user_uuid: user.id
      });

      if (error) throw error;

      // Return the statistics directly from the database
      return data;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}; 