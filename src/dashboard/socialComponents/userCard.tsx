import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { followService } from '../../services/followService';
import { getAvatarEmoji, formatDate } from '../utils/userHelpers';

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
  const navigate = useNavigate();
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
        // Redirect to login page when user is not authenticated
        navigate('/login');
      } else {
        // Show generic error message
        console.error('Failed to update follow status:', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };



  const avatarEmoji = getAvatarEmoji(user.display_name, user.username);
  const displayName = user.display_name || user.username;
  const userBio = user.bio || 'No bio available';
  const lastActive = formatDate(user.updated_at);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 overflow-hidden">
      {/* Header with Avatar and Basic Info */}
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-medium shadow-lg ring-2 ring-white/20 overflow-hidden">
              {user.avatar_url && user.avatar_url.startsWith('http') ? (
                <img
                  src={user.avatar_url}
                  alt={`${displayName}'s avatar`}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    // Show fallback text when image fails to load
                    const fallback = target.parentElement?.querySelector('.avatar-fallback');
                    if (fallback) {
                      fallback.classList.remove('hidden');
                    }
                  }}
                />
              ) : null}
              <span className={`avatar-fallback ${user.avatar_url && user.avatar_url.startsWith('http') ? 'hidden' : ''}`}>
                {avatarEmoji}
              </span>
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{displayName}</h3>
              <span className="text-sm font-medium text-blue-600">@{user.username}</span>
            </div>
            
            {/* Bio */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{userBio}</p>
            
            {/* Stats */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{followCounts.followers} followers</span>
              <span>{followCounts.following} following</span>
              <span>Active {lastActive}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6">
        <div className="flex space-x-3">
          <button 
            onClick={handleFollowToggle}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
              isFollowing 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            )}
          </button>
          
          <button className="flex-1 py-2.5 px-4 rounded-xl font-medium text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-200">
            Message
          </button>
          
          <button 
            onClick={() => navigate(`/dashboard/user/${user.uuid}`)}
            className="flex-1 py-2.5 px-4 rounded-xl font-medium text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
