import React, { useState, useEffect } from 'react';
import { followService } from '../../services/followService';

interface User {
  uuid: string;
  username: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserCardProps {
  user: User;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });

  // Check if current user is following this user on component mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const following = await followService.isFollowing(user.uuid);
        setIsFollowing(following);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    const getFollowCounts = async () => {
      try {
        const counts = await followService.getUserFollowCounts(user.uuid);
        setFollowCounts({
          followers: counts.followers_count || 0,
          following: counts.following_count || 0
        });
      } catch (error) {
        console.error('Error getting follow counts:', error);
      }
    };

    checkFollowStatus();
    getFollowCounts();
  }, [user.uuid]);

  const handleFollowToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(user.uuid);
        setIsFollowing(false);
        setFollowCounts(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
        onFollowChange?.(user.uuid, false);
      } else {
        await followService.followUser(user.uuid);
        setIsFollowing(true);
        setFollowCounts(prev => ({ ...prev, followers: prev.followers + 1 }));
        onFollowChange?.(user.uuid, true);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      
      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage === 'Already following this user') {
        setIsFollowing(true);
      } else if (errorMessage === 'No authenticated user found') {
        // Redirect to login or show login modal
        console.log('User not authenticated');
      } else {
        // Show generic error message
        console.log('Failed to update follow status');
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Generate avatar emoji based on display name or username
  const getAvatarEmoji = (name: string | null, username: string) => {
    const displayName = name || username;
    const firstChar = displayName.charAt(0).toLowerCase();
    
    // Simple emoji mapping based on first character
    const emojiMap: { [key: string]: string } = {
      'a': '👨‍💻', 'b': '👩‍🎨', 'c': '👨‍🍳', 'd': '👩‍🏫', 'e': '👨‍🎤',
      'f': '👩‍⚕️', 'g': '👨‍🔬', 'h': '👩‍💼', 'i': '👨', 'j': '👩‍🚀',
      'k': '👨‍🏭', 'l': '👩‍🌾', 'm': '👨', 'n': '👩‍🎓', 'o': '👨‍💼',
      'p': '👩‍🔧', 'q': '👨‍🎨', 'r': '👩‍🏭', 's': '👨‍⚕️', 't': '👩',
      'u': '👨‍🌾', 'v': '👩', 'w': '👨‍🚀', 'x': '👩‍💻', 'y': '👨‍🎓',
      'z': '👩‍🔬'
    };
    
    return emojiMap[firstChar] || '👤';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const avatarEmoji = getAvatarEmoji(user.display_name, user.username);
  const displayName = user.display_name || user.username;
  const userBio = user.bio || 'No bio available';
  const lastActive = formatDate(user.updated_at);

  return (
    <div className="group bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/20 transition-all duration-300 cursor-pointer hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] hover:scale-[1.02] hover:bg-white/90">
      {/* Header Section */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg">
              {avatarEmoji}
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">{displayName}</h3>
            </div>
            <p className="text-blue-500 font-medium text-sm mb-2">@{user.username}</p>
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-gray-400">📞</span>
                <span className="font-medium">{user.phone}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Account Info */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100/50">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">@{user.username}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Username</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">{followCounts.followers}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">{followCounts.following}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Following</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="px-6 pb-4">
        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2 font-medium">
          {userBio}
        </p>
        
        {/* Contact Info */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-gray-100/80 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold">
            📧 {user.email}
          </span>
          {user.phone && (
            <span className="bg-gray-100/80 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold">
              📞 {user.phone}
            </span>
          )}
        </div>
        
        {/* Account Status */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="font-medium">
            Account active • Updated {lastActive}
          </span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <button 
            onClick={handleFollowToggle}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 ${
              isFollowing 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="flex items-center justify-center">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{isLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}</span>
              )}
            </span>
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all duration-200 hover:bg-gray-200 hover:shadow-md hover:scale-105 active:scale-95">
            <span className="flex items-center justify-center">
              <span>Message</span>
            </span>
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all duration-200 hover:bg-gray-200 hover:shadow-md hover:scale-105 active:scale-95">
            <span className="flex items-center justify-center">
              <span>Profile</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
