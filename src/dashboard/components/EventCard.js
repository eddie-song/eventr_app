import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventImage from '../../components/eventImage';
import { getUserTimezone, formatDateInTimezone } from '../../utils/timezoneUtils';

const EventCard = ({ event, openEditEventModal, setDeleteEventModal, setSelectedEvent, setShowEventModal }) => {
  const navigate = useNavigate();
  const [userTimezone, setUserTimezone] = useState('UTC');

  useEffect(() => {
    const timezone = getUserTimezone();
    setUserTimezone(timezone);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return formatDateInTimezone(dateString, userTimezone, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return null;
    return formatDateInTimezone(dateString, userTimezone, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div
      className="event-card"
      onClick={() => {
        // Navigate to event detail page
        navigate(`/dashboard/event/${event.uuid}`);
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className="event-image-container">
        {event.image_url ? (
          <EventImage
            imageUrl={event.image_url}
            alt={event.event}
            className="event-image"
            onError={(e) => {
              const placeholder = e.target.parentElement.querySelector('.event-placeholder');
              if (placeholder) {
                placeholder.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div className="event-placeholder" style={{ display: event.image_url ? 'none' : 'flex' }}>
          <span className="event-icon">🎉</span>
        </div>
        {/* Rating badge */}
        <div className="event-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-number">{event.rating || 0.0}</span>
          <span className="rating-count">({event.review_count || 0})</span>
        </div>
        {/* Date badge */}
        <div className="event-date-badge">
          <div className="event-date">
            {event.scheduled_time ? formatDate(event.scheduled_time) : formatDate(event.created_at)}
          </div>
          <div className="event-time">
            {event.scheduled_time ? formatTime(event.scheduled_time) : 'Created'}
          </div>
        </div>
        {/* Price badge */}
        {event.price !== null && (
          <div className="event-price">
            <span className="price-text">
              {event.price === 0 || isNaN(event.price) ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`}
            </span>
          </div>
        )}
      </div>
      <div className="event-content">
        <div className="event-header">
          <h3 className="event-name">{event.event}</h3>
          <div className="event-header-details">
            <span className="event-type-badge">
              {event.event_type ? event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1) : 'General'}
            </span>
          </div>
        </div>
        {event.location && (
          <div className="event-location">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" style={{ color: 'currentColor' }}>
              <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
            </svg>
            <span className="location-name">{event.location}</span>
          </div>
        )}
        <p className="event-description">
          {event.description || 'No description available for this event.'}
        </p>
        <div className="event-footer">
          <div className="event-tags">
            {event.tags && event.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="event-tag">{tag}</span>
            ))}
            {event.tags && event.tags.length > 3 && (
              <span className="event-tag-more">+{event.tags.length - 3}</span>
            )}
          </div>
          {/* Capacity badge */}
          {event.capacity && (
            <div className="event-capacity">
              <span className="capacity-text">
                <span className="attendees-icon">👥</span>
                {event.attendeeCount || 0}/{event.capacity}
              </span>
            </div>
          )}
        </div>
        {/* Action buttons */}
        <div className="event-actions" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          {openEditEventModal && (
            <button
              className="edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                openEditEventModal(event);
              }}
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
          {setDeleteEventModal && (
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteEventModal({ open: true, eventUuid: event.uuid });
              }}
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
      </div>
    </div>
  );
};

export default EventCard; 