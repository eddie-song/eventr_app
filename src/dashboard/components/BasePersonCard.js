import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './people.css';

const BasePersonCard = ({ 
  person, 
  className = "person-card", 
  showRecommendedBadge = false, 
  recommendationReason = null,
  onClick = null 
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(person);
    } else {
      navigate(`/dashboard/person/${person.id}`);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const renderImage = () => {
    if (imageError) {
      return (
        <div className="person-image-fallback">
          <div className="fallback-avatar">
            <span className="fallback-text">
              {person.name ? person.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
        </div>
      );
    }

    return (
      <img 
        src={person.image} 
        alt={person.name}
        className="person-image"
        onError={handleImageError}
      />
    );
  };

  return (
    <div 
      className={className} 
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="person-image-container">
        {renderImage()}
        <div className="person-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-number">{person.rating}</span>
          <span className="rating-count">({person.reviews})</span>
        </div>
        <div className="person-rate">
          <span className="rate-text">{person.rate}</span>
        </div>
      </div>
      <div className="person-content">
        <div className="person-header">
          <div className="person-name-container">
            <h3 className="person-name">{person.name}</h3>
            {showRecommendedBadge && (
              <div className="recommended-badge">
                <span>⭐</span>
              </div>
            )}
          </div>
          <span className="person-distance">{person.distance}</span>
        </div>
        <div className="person-title">
          <span className="title-icon">💼</span>
          <span className="title-text">{person.title}</span>
        </div>
        <div className="person-location">
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" style={{ color: 'currentColor', marginRight: '4px' }}>
            <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
          </svg>
          {person.location || 'Location not specified'}
        </div>
        <p className="person-description">{person.description}</p>
        {recommendationReason && (
          <div className="recommendation-reason">
            <span className="reason-text">{recommendationReason}</span>
          </div>
        )}
        <div className="person-footer">
          <div className="person-tags">
            {(Array.isArray(person.tags) ? person.tags : []).map((tag, index) => (
              <span key={index} className="person-tag">{tag}</span>
            ))}
          </div>
          <div className="person-availability">
            <span className="availability-icon">📅</span>
            <span className="availability-text">{person.availability}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasePersonCard; 