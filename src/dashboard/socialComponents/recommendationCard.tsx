import React from 'react';

interface Recommendation {
  uuid: string;
  created_at: string;
  user_id: string;
  image_url: string | null;
  title: string;
  description: string;
  location: string | null;
  type: string;
  rating: number | null;
  tags?: string[];
  // Additional fields for display
  author_name?: string;
  author_username?: string;
  author_avatar?: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onEdit?: (rec: Recommendation) => void;
  onDelete?: (rec: Recommendation) => void;
  onLike?: (uuid: string) => void;
  onComment?: (uuid: string) => void;
  onShare?: (uuid: string) => void;
  onSave?: (uuid: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  onEdit,
  onDelete,
  onLike, 
  onComment, 
  onShare, 
  onSave 
}) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02]">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        {recommendation.image_url ? (
          <img
            src={recommendation.image_url}
            alt={recommendation.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <span className="text-4xl text-gray-400">⭐</span>
          </div>
        )}
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <span className="text-yellow-500">⭐</span>
          <span>{recommendation.rating?.toFixed(1) || '0.0'}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-lg leading-tight flex-1">
            {recommendation.title}
          </h3>
          <div className="ml-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {recommendation.type ? recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1) : 'General'}
            </span>
          </div>
        </div>
        
        {/* Location */}
        {recommendation.location && (
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16">
              <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
            </svg>
            <span className="font-medium">{recommendation.location}</span>
          </div>
        )}
        
        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">
          {recommendation.description || 'No description available.'}
        </p>
        
        {/* Tags */}
        {recommendation.tags && recommendation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {recommendation.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                {tag}
              </span>
            ))}
            {recommendation.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-xs font-medium">
                +{recommendation.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 mt-4">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(recommendation);
                }}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-blue-600 hover:shadow-md active:scale-95"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(recommendation);
                }}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-red-600 hover:shadow-md active:scale-95"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;
