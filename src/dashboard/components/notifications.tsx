import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { followService } from '../../services/followService';
import { messagingService } from '../../services/messagingService';
import { notificationService } from '../../services/notificationService';

interface Notification {
  uuid: string;
  type: 'follow' | 'message' | 'like' | 'comment';
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  data: any;
}

interface User {
  uuid: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'follows' | 'messages' | 'likes'>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notificationCounts, setNotificationCounts] = useState({
    total: 0,
    messages: 0,
    followers: 0,
    likes: 0,
    comments: 0
  });
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const initializeComponent = async () => {
      await getCurrentUser();
      await fetchNotifications();
      await getNotificationCounts();
      await setupRealtimeSubscription();
    };

    initializeComponent();

    return () => {
      if (subscription) {
        notificationService.unsubscribeFromNotifications(subscription);
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      getNotificationCounts();
    }
  }, [currentUser]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('uuid, username, display_name, avatar_url')
          .eq('uuid', user.id)
          .single();
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const getNotificationCounts = async () => {
    try {
      const counts = await notificationService.getNotificationCount();
      setNotificationCounts(counts);
    } catch (error) {
      console.error('Error getting notification counts:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(50, 0);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = async () => {
    try {
      const sub = await notificationService.subscribeToNotifications((notification: Notification, eventType?: string) => {
        if (eventType === 'DELETE') {
          // Remove deleted notification
          setNotifications(prev => prev.filter(n => n.uuid !== notification.uuid));
        } else if (eventType === 'UPDATE') {
          // Update existing notification
          setNotifications(prev => 
            prev.map(n => n.uuid === notification.uuid ? notification : n)
          );
        } else {
          // Add new notification
          setNotifications(prev => [notification, ...prev]);
        }
        
        // Update counts
        getNotificationCounts();
      });
      
      if (sub) {
        setSubscription(sub);
      }
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  };

  const handleFollowResponse = async (followerId: string, accept: boolean) => {
    try {
      if (accept) {
        // Accept follow by creating mutual follow relationship
        await followService.followUser(followerId);
      }
      // Remove the notification
      setNotifications(prev => prev.filter(n => n.uuid !== `follow-${followerId}`));
    } catch (error) {
      console.error('Error handling follow response:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    setNotifications(prev => 
        prev.map(n => n.uuid === notificationId ? { ...n, is_read: true } : n)
      );
      await getNotificationCounts();
      } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      await getNotificationCounts();
      } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'like':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'follows') return notification.type === 'follow';
    if (activeTab === 'messages') return notification.type === 'message';
    if (activeTab === 'likes') return notification.type === 'like' || notification.type === 'comment';
    return false;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your latest activity</p>
        </div>
        <div className="flex space-x-2">
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="relative bg-gray-50/50 rounded-2xl p-1.5 mb-8 shadow-sm">
        <div className="flex relative">
          {[
            { key: 'all', label: 'All', count: notificationCounts.total },
            { key: 'follows', label: 'Follows', count: notificationCounts.followers },
            { key: 'messages', label: 'Messages', count: notificationCounts.messages },
            { key: 'likes', label: 'Likes', count: notificationCounts.likes + notificationCounts.comments }
          ].map((tab, index) => (
        <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`relative flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 ease-out border-0 ${
                index === 0 ? 'rounded-l-xl' : 
                index === 3 ? 'rounded-r-xl' : 
                'rounded-none'
              } ${
                activeTab === tab.key
                  ? 'text-gray-900 bg-white shadow-lg shadow-gray-200/50 transform scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="font-semibold">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
              {activeTab === tab.key && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white to-gray-50/50 -z-10"></div>
              )}
        </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'all' ? 'No notifications yet' : `No ${activeTab} notifications`}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'all' 
                ? 'When you receive notifications, they\'ll appear here'
                : `You don't have any ${activeTab} notifications at the moment`
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.uuid}
              className={`bg-white rounded-lg p-4 transition-all hover:shadow-md ${
                !notification.is_read ? 'bg-blue-50' : ''
              }`}
              onClick={() => markAsRead(notification.uuid)}
            >
              <div className="flex items-start space-x-4">
                {/* Avatar/Icon */}
                  {getNotificationIcon(notification.type)}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(notification.created_at)}
                    </span>
                </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>

                  {/* Action buttons for follow notifications */}
                  {notification.type === 'follow' && (
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowResponse(notification.data.follower_id, true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors border-none"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowResponse(notification.data.follower_id, false);
                        }}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300 transition-colors border-none"
                      >
                        Decline
                      </button>
              </div>
                  )}

                  {/* Preview for likes and comments */}
                  {(notification.type === 'like' || notification.type === 'comment') && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      "{notification.data.post_content?.substring(0, 100)}..."
                    </div>
                  )}
                </div>

                {/* Unread indicator */}
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredNotifications.length > 0 && (
        <div className="text-center mt-8">
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
