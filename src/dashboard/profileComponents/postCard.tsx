import React, { useState, useCallback } from 'react';

interface Post {
  uuid: string;
  content: string;
  image?: string;
  location?: string;
  distance?: string;
  tags: string[];
  timestamp: string;
  like_count?: number;
  comments?: number;
}

interface UserProfile {
  uuid: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

interface PostCardProps {
  post: Post;
  userProfile: UserProfile;
  onPostClick: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postUuid: string) => void;
  isDeleting: boolean;
  showPostMenu: string | null;
  setShowPostMenu: (postUuid: string | null) => void;
  useLikeState: (postUuid: string, initialLikeCount: number) => [
    { liked: boolean; likesCount: number },
    () => Promise<void>
  ];
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  userProfile,
  onPostClick,
  onEditPost,
  onDeletePost,
  isDeleting,
  showPostMenu,
  setShowPostMenu,
  useLikeState
}) => {
  const postUuid = post.uuid;
  const isMenuOpen = showPostMenu === post.uuid;
  const [likeState, handleLike] = useLikeState(postUuid, post.like_count || 0);
  const [imageError, setImageError] = useState(false);

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPostMenu(isMenuOpen ? null : post.uuid);
  }, [isMenuOpen, post.uuid, setShowPostMenu]);

  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleLike();
  }, [handleLike]);

  const handlePostClick = useCallback(() => {
    onPostClick(post);
  }, [post, onPostClick]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEditPost(post);
    setShowPostMenu(null);
  }, [post, onEditPost, setShowPostMenu]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDeletePost(post.uuid);
    setShowPostMenu(null);
  }, [post.uuid, onDeletePost, setShowPostMenu]);

  return (
    <div 
      className="bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.08)] border border-gray-100/50 transition-all duration-300 cursor-pointer mb-6 hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 active:translate-y-0"
      onClick={handlePostClick}
    >
      {/* Post Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg ring-2 ring-white/20">
            {userProfile.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt={`${userProfile.display_name || userProfile.username || 'User'}'s profile picture`}
                className="w-full h-full rounded-full object-cover ring-2 ring-white/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span role="img" aria-label={`${userProfile.display_name || userProfile.username || 'User'}'s profile avatar`}>
                👤
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-gray-900 text-lg tracking-tight">
              {userProfile.display_name || userProfile.username || 'User'}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {post.timestamp}
            </div>
          </div>
        </div>
        
        {/* Menu Button */}
        <div className="relative">
          <button 
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border-none text-lg text-gray-600 cursor-pointer rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
            onClick={handleMenuClick}
          >
            ⋯
          </button>
          
          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white/95 border border-gray-200/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-10 min-w-48 py-2 overflow-hidden">
              <button
                className="w-full bg-transparent border-none py-3 px-4 text-left cursor-pointer text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
                onClick={handleEditClick}
              >
                <span className="text-lg">✏️</span>
                Edit Post
              </button>
              <button
                className="w-full bg-transparent border-none py-3 px-4 text-left cursor-pointer text-sm text-red-500 font-medium hover:bg-red-50 transition-colors duration-200 flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isDeleting}
                onClick={handleDeleteClick}
              >
                <span className="text-lg">🗑️</span>
                Delete Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-5">
        <p className="text-base leading-relaxed text-gray-800 mb-4 font-medium">
          {post.content}
        </p>
        
        {/* Post Image */}
        {post.image && (
          <div className="my-4 rounded-2xl overflow-hidden bg-gray-50 shadow-inner">
            {!imageError ? (
              <img
                src={post.image}
                alt={post.location || 'Post image'}
                className="w-full h-72 object-cover block transition-transform duration-500 cursor-pointer hover:scale-[1.02]"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-72 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-gray-500 text-sm font-medium">Image unavailable</p>
                  <p className="text-gray-400 text-xs mt-1">Failed to load image</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Location */}
        {post.location && (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" className="text-blue-500">
              <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
            </svg>
            <div className="flex-1">
              <span className="font-semibold text-gray-900 text-sm">
                {post.location}
              </span>
              {post.distance && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {post.distance} away
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-6 pt-5 border-t border-gray-100">
        <button 
          className={`flex items-center gap-2 bg-transparent border-none py-2 px-4 rounded-2xl cursor-pointer transition-all duration-300 ${
            likeState.liked 
              ? 'text-red-500 hover:bg-red-50' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
          }`}
          onClick={handleLikeClick}
        >
          {likeState.liked ? (
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )}
          <span className="text-sm font-semibold min-w-4 text-center">
            {likeState.likesCount}
          </span>
        </button>
        
        <button className="flex items-center gap-2 bg-transparent border-none py-2 px-4 rounded-2xl cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.891 1 4.127L3 21l4.873-1c1.236.64 2.64 1 4.127 1"></path>
          </svg>
          <span className="text-sm font-semibold min-w-4 text-center">
            {post.comments || 0}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
