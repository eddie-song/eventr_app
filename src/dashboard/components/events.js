import React, { useState, useEffect } from 'react';
import './events.css';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';
import { eventService } from '../../services/eventService';
import EventImage from '../../components/EventImage';
import { formatDateInTimezone, getUserTimezone, convertUTCToDatetimeLocal } from '../../utils/timezoneUtils';

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();
  const [events, setEvents] = useState([]);

  // Load events from database
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await eventService.getAllEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isPageLoaded) {
      loadEvents();
    }
  }, [isPageLoaded]);

  // Recommended events based on user preferences
  const recommendedEvents = [
    {
      id: 'rec1',
      name: 'Wellness Workshop Series',
      category: 'wellness',
      date: '2024-07-10',
      time: '6:30 PM',
      location: 'Zen Wellness Center',
      distance: '0.7 miles away',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      description: 'Weekly wellness workshops covering meditation, nutrition, and mindfulness. Perfect for your wellness journey.',
      price: '$20',
      attendees: 45,
      rating: 4.9,
      reviews: 28,
      tags: ['Wellness', 'Workshop', 'Meditation'],
      reason: 'Based on your interest in wellness activities'
    },
    {
      id: 'rec2',
      name: 'Tech Innovation Summit',
      category: 'networking',
      date: '2024-07-12',
      time: '9:00 AM',
      location: 'Tech Conference Center',
      distance: '1.4 miles away',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop',
      description: 'Annual tech summit featuring keynote speakers, networking sessions, and startup showcases.',
      price: '$75',
      attendees: 320,
      rating: 4.7,
      reviews: 45,
      tags: ['Tech', 'Networking', 'Innovation'],
      reason: 'Matches your professional interests'
    },
    {
      id: 'rec3',
      name: 'Sunset Jazz Concert',
      category: 'music',
      date: '2024-07-14',
      time: '7:00 PM',
      location: 'Riverside Amphitheater',
      distance: '1.1 miles away',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      description: 'Intimate jazz concert with local musicians. BYOB and picnic blankets welcome.',
      price: '$25',
      attendees: 120,
      rating: 4.6,
      reviews: 19,
      tags: ['Jazz', 'Music', 'Outdoor'],
      reason: 'Similar to events you\'ve attended'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Events', icon: '📅' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'networking', name: 'Networking', icon: '🤝' },
    { id: 'wellness', name: 'Wellness', icon: '🧘‍♀️' },
    { id: 'culture', name: 'Arts & Culture', icon: '🎨' },
    { id: 'food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'community', name: 'Community', icon: '👥' },
    { id: 'outdoor', name: 'Outdoor', icon: '🌳' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎭' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = (event.event || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    // For now, we'll show all events since we don't have categories in the database yet
    const matchesCategory = selectedCategory === 'all';
    return matchesSearch && matchesCategory;
  });

  // Check if page is already loaded
  useEffect(() => {
    if (isPageLoaded('events')) {
      setIsLoading(false);
    } else {
      // Simulate loading time
      const loadingTime = Math.random() * 1000 + 1000; // Random time between 1-2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        markPageAsLoaded('events');
      }, loadingTime);
      return () => clearTimeout(timer);
    }
  }, [isPageLoaded, markPageAsLoaded]);

  const [userTimezone, setUserTimezone] = useState('UTC');

  // Get user's timezone on component mount
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

  const EventCard = ({ event }) => (
    <div className="event-card">
      <div className="event-image-container">
        {event.image_url ? (
          <EventImage 
            imageUrl={event.image_url}
            alt={event.event}
            className="event-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="event-placeholder" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#f0f0f0',
            height: '100%',
            fontSize: '48px'
          }}>
            🎉
          </div>
        )}
        <div className="event-date-badge">
          <div className="event-date">
            {event.scheduled_time ? formatDate(event.scheduled_time) : formatDate(event.created_at)}
          </div>
          <div className="event-time">
            {event.scheduled_time ? formatTime(event.scheduled_time) : 'Created'}
          </div>
        </div>
        <div className="event-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-number">{event.rating || 0.0}</span>
          <span className="rating-count">({event.review_count || 0})</span>
        </div>
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
          <span className="event-distance">{event.attendeeCount || 0} attendees</span>
        </div>
        {event.location && (
          <div className="event-location">
            <span className="location-icon">📍</span>
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
          <div className="event-attendees">
            <span className="attendees-icon">👥</span>
            <span className="attendees-count">{event.attendeeCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const RecommendedEventCard = ({ event }) => (
    <div className="recommended-event-card">
      <div className="event-image-container">
        <img 
          src={event.image} 
          alt={event.name}
          className="event-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="event-date-badge">
          <div className="event-date">{formatDate(event.date)}</div>
          <div className="event-time">{event.time}</div>
        </div>
        <div className="event-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-number">{event.rating}</span>
          <span className="rating-count">({event.reviews})</span>
        </div>
        <div className="event-price">
          <span className="price-text">{event.price}</span>
        </div>
      </div>
      <div className="event-content">
        <div className="event-header">
          <div className="event-name-container">
            <h3 className="event-name">{event.name}</h3>
            <div className="recommended-badge">
              <span>⭐</span>
            </div>
          </div>
          <span className="event-distance">{event.distance}</span>
        </div>
        <div className="event-location">
          <span className="location-icon">📍</span>
          <span className="location-name">{event.location}</span>
        </div>
        <p className="event-description">{event.description}</p>
        <div className="recommendation-reason">
          <span className="reason-text">{event.reason}</span>
        </div>
        <div className="event-footer">
          <div className="event-tags">
            {event.tags.map((tag, index) => (
              <span key={index} className="event-tag">{tag}</span>
            ))}
          </div>
          <div className="event-attendees">
            <span className="attendees-icon">👥</span>
            <span className="attendees-count">{event.attendees}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen message="Loading Events For You . . ." />;
  }

  return (
    <div id="events-page-container">
      <div className="events-header">
        <h1>Explore Events</h1>
        <p>Discover exciting events happening near you</p>
      </div>

      <div className="search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="categories-section">
        <div className="categories-container">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="recommended-section">
        <div className="recommended-header">
          <h2>Recommended For You</h2>
          <span className="recommended-count">{recommendedEvents.length} personalized picks</span>
        </div>
        
        <div className="recommended-grid">
          {recommendedEvents.map(event => (
            <RecommendedEventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      <div className="events-section">
        <div className="events-header-section">
          <h2>{selectedCategory === 'all' ? 'All Events' : categories.find(c => c.id === selectedCategory)?.name}</h2>
          <span className="events-count">{filteredEvents.length} events found</span>
        </div>
        
        <div className="events-grid">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No events found</h3>
            <p>Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events; 