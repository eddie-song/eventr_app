import React, { useState, useEffect } from 'react';
import ProfileAvatar from './ProfileAvatar';
import EventImage from '../../components/eventImage';
import { getUserTimezone, formatDateInTimezone } from '../../utils/timezoneUtils';

const EventModal = ({ event, onClose, userProfile }) => {
  const [userTimezone, setUserTimezone] = useState('UTC');

  useEffect(() => {
    const timezone = getUserTimezone();
    setUserTimezone(timezone);
  }, []);

  if (!event) return null;

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
        {/* Hero section with event image and gradient */}
        <div className="event-modal-hero">
          <div className="event-modal-image">
            {event.image_url ? (
              <EventImage
                imageUrl={event.image_url}
                alt={event.event}
                className="event-modal-hero-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="event-modal-placeholder" style={{ display: event.image_url ? 'none' : 'flex' }}>
              <span className="event-modal-icon">🎉</span>
            </div>
            <div className="event-modal-gradient"></div>
          </div>
          {/* Event title overlay */}
          <div className="event-modal-title-section">
            <h1 className="event-modal-title">{event.event}</h1>
            {event.location && (
              <div className="event-modal-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{event.location}</span>
              </div>
            )}
            {event.scheduled_time && (
              <div className="event-modal-time">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{formatDateInTimezone(event.scheduled_time, userTimezone, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}</span>
              </div>
            )}
            {event.price !== null && (
              <div className="event-modal-price">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{event.price === 0 || isNaN(event.price) ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`}</span>
              </div>
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
                {event.created_at ? new Date(event.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Recently'}
              </div>
            </div>
          </div>
          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="event-modal-tags">
              {event.tags.map((tag, index) => (
                <span key={index} className="event-modal-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* Stats grid */}
          <div className="event-modal-stats">
            <div className="event-modal-stat">
              <div className="event-modal-stat-icon">👥</div>
              <div className="event-modal-stat-content">
                <div className="event-modal-stat-number">{event.attendeeCount || 0}</div>
                <div className="event-modal-stat-label">Attendees</div>
              </div>
            </div>
            <div className="event-modal-stat">
              <div className="event-modal-stat-icon">⭐</div>
              <div className="event-modal-stat-content">
                <div className="event-modal-stat-number">{event.rating || 0.0}</div>
                <div className="event-modal-stat-label">Rating</div>
              </div>
            </div>
            <div className="event-modal-stat">
              <div className="event-modal-stat-icon">💬</div>
              <div className="event-modal-stat-content">
                <div className="event-modal-stat-number">{event.review_count || 0}</div>
                <div className="event-modal-stat-label">Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal; 