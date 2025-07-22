import React from 'react';

const RecommendationCard = ({ rec, onEdit, onDelete }) => {
  return (
    <div className="event-card">
      <div className="event-image-container">
        {rec.image ? (
          <img
            src={rec.image}
            alt={rec.title}
            className="event-image"
            onError={e => (e.target.style.display = 'none')}
          />
        ) : (
          <div className="event-placeholder" style={{ display: 'flex' }}>
            <span className="event-icon">⭐</span>
          </div>
        )}
        {/* Rating badge */}
        <div className="event-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-number">{rec.rating || 0.0}</span>
        </div>
      </div>
      <div className="event-content">
        <div className="event-header">
          <h3 className="event-name">{rec.title}</h3>
          <div className="event-header-details">
            <span className="event-type-badge">
              {rec.type ? rec.type.charAt(0).toUpperCase() + rec.type.slice(1) : 'General'}
            </span>
          </div>
        </div>
        {rec.location && (
          <div className="event-location">
            <span className="location-icon">📍</span>
            <span className="location-name">{rec.location}</span>
          </div>
        )}
        <p className="event-description">
          {rec.description || 'No description available.'}
        </p>
        <div className="event-footer">
          <div className="event-tags">
            {rec.tags && rec.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="event-tag">{tag}</span>
            ))}
            {rec.tags && rec.tags.length > 3 && (
              <span className="event-tag-more">+{rec.tags.length - 3}</span>
            )}
          </div>
        </div>
        {/* Action buttons */}
        {(onEdit || onDelete) && (
          <div className="event-actions" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
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