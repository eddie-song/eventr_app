# Real-Time Notifications System Setup

This guide will help you set up a comprehensive real-time notifications system for your Eventr application using Supabase.

## Overview

The notifications system includes:
- **Real-time notifications** for follows, likes, comments, and messages
- **Automatic notification creation** via database triggers
- **Real-time updates** using Supabase's real-time subscriptions
- **Notification management** (mark as read, delete, etc.)
- **Modern UI** with Apple-inspired design

## Database Setup

### 1. Run the SQL Script

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `setup-notifications.sql`
4. Run the script

This will create:
- `notifications` table with proper indexes and RLS policies
- Helper functions for creating notifications
- Database triggers to automatically create notifications
- Real-time subscription setup

### 2. Verify the Setup

After running the script, you should see:
- A new `notifications` table in your database
- Several new functions in your database functions list
- Triggers attached to `user_follows`, `post_likes`, `comments`, and `messages` tables

## Frontend Integration

### 1. Updated Files

The following files have been updated to support the new notification system:

- `src/services/notificationService.js` - Enhanced with real-time functionality
- `src/dashboard/components/notifications.tsx` - Updated to use the new database structure
- `src/schema/schema.sql` - Added notification system schema

### 2. Key Features

#### Real-Time Subscriptions
```javascript
// Subscribe to notifications
const subscription = notificationService.subscribeToNotifications((notification, eventType) => {
  // Handle new, updated, or deleted notifications
  console.log('Notification event:', eventType, notification);
});
```

#### Notification Management
```javascript
// Get notifications
const notifications = await notificationService.getNotifications(50, 0);

// Mark as read
await notificationService.markAsRead(notificationId);

// Mark all as read
await notificationService.markAllAsRead();

// Get counts
const counts = await notificationService.getNotificationCount();
```

## How It Works

### 1. Automatic Notification Creation

When users perform actions, notifications are automatically created:

- **Follow**: When someone follows a user
- **Like**: When someone likes a post (excluding own posts)
- **Comment**: When someone comments on a post (excluding own posts)
- **Message**: When someone sends a message

### 2. Real-Time Updates

The system uses Supabase's real-time subscriptions to:
- Instantly show new notifications
- Update notification counts in real-time
- Mark notifications as read across all connected clients

### 3. Data Structure

Each notification contains:
```json
{
  "uuid": "unique-id",
  "user_id": "recipient-user-id",
  "type": "follow|message|like|comment",
  "title": "Notification title",
  "message": "Notification message",
  "data": {
    // Additional context data
  },
  "is_read": false,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Testing the System

### 1. Test Follow Notifications
1. Create two test users
2. Have one user follow the other
3. Check that a notification appears in real-time

### 2. Test Like Notifications
1. Create a post with one user
2. Have another user like the post
3. Verify the notification appears instantly

### 3. Test Message Notifications
1. Start a conversation between two users
2. Send a message
3. Check that the recipient gets a real-time notification

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check that real-time is enabled for the notifications table
   - Verify RLS policies are correct
   - Check browser console for subscription errors

2. **Triggers not working**
   - Ensure the trigger functions exist
   - Check that triggers are attached to the correct tables
   - Verify function permissions

3. **Real-time not working**
   - Check Supabase real-time settings
   - Verify the publication includes the notifications table
   - Check network connectivity

### Debug Commands

```sql
-- Check if notifications table exists
SELECT * FROM information_schema.tables WHERE table_name = 'notifications';

-- Check triggers
SELECT * FROM information_schema.triggers WHERE trigger_name LIKE '%notification%';

-- Check functions
SELECT * FROM information_schema.routines WHERE routine_name LIKE '%notification%';

-- Test notification creation
SELECT create_follow_notification('user-uuid-1', 'user-uuid-2');
```

## Performance Considerations

### 1. Indexes
The system includes optimized indexes for:
- `user_id` - Fast user-specific queries
- `created_at` - Efficient sorting by time
- `is_read` - Quick unread count queries

### 2. Pagination
Notifications are paginated to prevent loading too many at once:
```javascript
const notifications = await notificationService.getNotifications(50, 0);
```

### 3. Real-Time Optimization
- Subscriptions are properly cleaned up on component unmount
- Only necessary data is transmitted in real-time
- Efficient filtering on the database level

## Security

### 1. Row Level Security (RLS)
- Users can only see their own notifications
- Users can only update/delete their own notifications
- All functions use `SECURITY DEFINER` for proper permissions

### 2. Data Validation
- Notification types are constrained to valid values
- User IDs are validated against the profiles table
- JSONB data is properly structured

## Future Enhancements

Potential improvements to consider:
- **Push notifications** for mobile devices
- **Email notifications** for important events
- **Notification preferences** (user can choose what to receive)
- **Notification grouping** (group similar notifications)
- **Advanced filtering** (by date, type, etc.)
- **Notification analytics** (track engagement, etc.)

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify the database setup is complete
3. Test with the provided debug commands
4. Check Supabase logs for any backend errors

The notification system is designed to be robust and scalable, providing a solid foundation for real-time user engagement features. 