import React, { useState } from 'react';

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
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  onEdit,
  onDelete,
  onLike, 
  onComment
}) => {
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    // Handle card click - could open detail view or modal
    console.log('Card clicked:', recommendation.title);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${recommendation.title}`}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        {recommendation.image_url && !imageError ? (
          <img
            src={recommendation.image_url}
            alt={recommendation.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} viewBox="0 0 24 24" className="text-gray-400">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        )}
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" className="text-yellow-500">
            <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
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
        
        {/* Social Action Buttons */}
        {(onLike || onComment) && (
          <div className="flex items-center gap-6 pt-5 border-t border-gray-100">
            {onLike && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(recommendation.uuid);
                }}
                aria-label="Like this recommendation"
                className="flex items-center gap-2 bg-transparent border-none py-2 px-4 rounded-2xl cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span className="text-sm font-semibold">Like</span>
              </button>
            )}
            
            {onComment && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComment(recommendation.uuid);
                }}
                aria-label="Comment on this recommendation"
                className="flex items-center gap-2 bg-transparent border-none py-2 px-4 rounded-2xl cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.891 1 4.127L3 21l4.873-1c1.236.64 2.64 1 4.127 1"></path>
                </svg>
                <span className="text-sm font-semibold">Comment</span>
              </button>
            )}
          </div>
        )}
        
        {/* Edit/Delete Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 mt-4">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(recommendation);
                }}
                aria-label={`Edit ${recommendation.title}`}
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
                aria-label={`Delete ${recommendation.title}`}
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
