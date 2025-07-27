import React from 'react';

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  location: string;
  distance: string;
  image: string | null;
  timestamp: string;
  likes: number;
  comments: number;
  rating: number;
  tags: string[];
  category: string;
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="group bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/20 transition-all duration-300 cursor-pointer hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] hover:scale-[1.02] hover:bg-white/90">
      {/* Post Header */}
      <div className="flex justify-between items-center p-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg shadow-lg">
              {post.avatar}
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="font-semibold text-gray-900 text-base leading-tight">{post.author}</div>
            <div className="text-sm text-gray-500 font-medium">{post.timestamp}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-2xl border border-gray-100/50">
          <span className="text-yellow-500 text-sm">⭐</span>
          <span className="font-semibold text-gray-900 text-sm">{post.rating}</span>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-6 pb-4">
        <p className="text-gray-900 text-base leading-relaxed mb-4 font-medium">{post.content}</p>
        
        {post.image && (
          <div className="mb-4 overflow-hidden rounded-2xl bg-gray-50/50">
            <img 
              src={post.image} 
              alt={post.location}
              className="w-full h-56 object-cover transition-all duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-blue-50/50 backdrop-blur-sm rounded-2xl border border-blue-100/30">
          <span className="text-blue-500 text-lg">📍</span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-gray-900 text-sm">{post.location}</span>
            {post.distance && (
              <span className="text-xs text-gray-500 font-medium">{post.distance}</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span 
              key={index} 
              className="bg-gray-100/80 backdrop-blur-sm text-gray-700 px-3 py-2 rounded-2xl text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-200/80 hover:scale-105 border border-gray-200/50"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100/50 bg-gray-50/30 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 bg-transparent border-none py-2 px-4 rounded-2xl cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-300">
            <span className="text-xl transition-transform duration-200 hover:scale-110">❤️</span>
            <span className="text-sm font-semibold min-w-4 text-center">{post.likes}</span>
          </button>
          <button className="flex items-center gap-2 bg-transparent border-none py-2 px-4 rounded-2xl cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-300">
            <span className="text-xl transition-transform duration-200 hover:scale-110">💬</span>
            <span className="text-sm font-semibold min-w-4 text-center">{post.comments}</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-100/80 backdrop-blur-sm text-gray-600 hover:text-blue-500 hover:bg-blue-50/80 transition-all duration-200 group/btn border border-gray-200/50">
            <span className="text-lg group-hover/btn:scale-110 transition-transform duration-200">📤</span>
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-100/80 backdrop-blur-sm text-gray-600 hover:text-yellow-500 hover:bg-yellow-50/80 transition-all duration-200 group/btn border border-gray-200/50">
            <span className="text-lg group-hover/btn:scale-110 transition-transform duration-200">🔖</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
