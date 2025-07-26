import React from 'react';
import ProfileAvatar from '../ProfileAvatar';

const RecommendationModal = ({ recommendation, onClose, userProfile }) => {
  if (!recommendation) return null;
  const createdDate = recommendation.created_at ? new Date(recommendation.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'Recently';
  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-container" onClick={e => e.stopPropagation()}>
        {/* Header with close button */}
        <div className="event-modal-header">
          <button className="event-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {/* Hero section with image and gradient */}
        <div className="event-modal-hero">
          <div className="event-modal-image">
            {recommendation.image ? (
              <img
                src={recommendation.image}
                alt={recommendation.title}
                className="event-modal-hero-image"
                onError={e => (e.target.style.display = 'none')}
              />
            ) : null}
            <div className="event-modal-placeholder" style={{ display: recommendation.image ? 'none' : 'flex' }}>
              <span className="event-modal-icon">⭐</span>
            </div>
            <div className="event-modal-gradient"></div>
          </div>
          {/* Title overlay */}
          <div className="event-modal-title-section">
            <h1 className="event-modal-title">{recommendation.title}</h1>
            {recommendation.location && (
              <div className="event-modal-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{recommendation.location}</span>
              </div>
            )}
            <div className="event-modal-time">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{createdDate}</span>
            </div>
            {recommendation.rating !== null && recommendation.rating !== undefined ? (
              <div style={{ fontWeight: 500, fontSize: 15, color: '#fff', marginTop: 8 }}>{recommendation.rating} / 5</div>
            ) : (
              <div style={{ fontWeight: 500, fontSize: 15, color: '#86868b', marginTop: 8 }}>No rating</div>
            )}
          </div>
        </div>
        {/* Content section */}
        <div className="event-modal-content">
          {/* Author info */}
          <div className="event-modal-author">
            <div className="event-modal-avatar">
              <ProfileAvatar avatarPath={userProfile?.avatar_url} />
            </div>
            <div className="event-modal-author-info">
              <div className="event-modal-author-name">
                {userProfile?.display_name || userProfile?.username || 'User'}
              </div>
              <div className="event-modal-date">
                {createdDate}
              </div>
            </div>
          </div>
          {/* Tags */}
          {recommendation.tags && recommendation.tags.length > 0 && (
            <div className="event-modal-tags">
              {recommendation.tags.map((tag, index) => (
                <span key={index} className="event-modal-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* Description */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Description</div>
            <div style={{ fontSize: 15, color: '#1d1d1f' }}>{recommendation.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationModal; 