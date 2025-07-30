import React from 'react';

const RecommendationCard = ({ rec, onEdit, onDelete }) => {
  return (
    <div className="rec-card">
      <div className="rec-image-container">
        {rec.image ? (
          <img
            src={rec.image}
            alt={rec.title}
            className="rec-image"
            onError={e => (e.target.style.display = 'none')}
          />
        ) : (
          <div className="rec-placeholder" style={{ display: 'flex' }}>
            <span className="rec-icon">⭐</span>
          </div>
        )}
        {/* Rating badge */}
        <div className="rec-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-number">{rec.rating || 0.0}</span>
        </div>
      </div>
      <div className="rec-content">
        <div className="rec-header">
          <h3 className="rec-name">{rec.title}</h3>
          <div className="rec-header-details">
            <span className="rec-type-badge">
              {rec.type ? rec.type.charAt(0).toUpperCase() + rec.type.slice(1) : 'General'}
            </span>
          </div>
        </div>
        {rec.location && (
          <div className="recommendation-location">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" style={{ color: 'currentColor', marginRight: '4px' }}>
              <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
            </svg>
            {rec.location || 'Location not specified'}
          </div>
        )}
        <p className="rec-description">
          {rec.description || 'No description available.'}
        </p>
        <div className="rec-footer">
          <div className="rec-tags">
            {rec.tags && rec.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="rec-tag">{tag}</span>
            ))}
            {rec.tags && rec.tags.length > 3 && (
              <span className="rec-tag-more">+{rec.tags.length - 3}</span>
            )}
          </div>
        </div>
        {/* Action buttons */}
        {(onEdit || onDelete) && (
          <div className="rec-actions" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            {onEdit && (
              <button
                className="edit-btn"
                onClick={e => { e.stopPropagation(); onEdit(rec); }}
                style={{
                  background: '#007AFF',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                className="delete-btn"
                onClick={e => { e.stopPropagation(); onDelete(rec); }}
                style={{
                  background: '#ff3b30',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  flex: 1
                }}
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