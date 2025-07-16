import React, { useState, useEffect } from 'react';
import './events.css';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();
  const [events, setEvents] = useState([
    {
      id: 1,
      name: 'Summer Music Festival',
      category: 'music',
      date: '2024-07-15',
      time: '6:00 PM',
      location: 'Central Park Amphitheater',
      distance: '1.2 miles away',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      description: 'Annual summer music festival featuring local bands and food trucks. Free entry, bring your own blanket!',
      price: 'Free',
      attendees: 245,
      rating: 4.7,
      reviews: 18,
      tags: ['Music', 'Outdoor', 'Free']
    },
    {
      id: 2,
      name: 'Tech Startup Meetup',
      category: 'networking',
      date: '2024-06-28',
      time: '7:30 PM',
      location: 'Innovation Hub',
      distance: '0.8 miles away',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop',
      description: 'Monthly networking event for tech entrepreneurs and developers. Pizza and drinks provided.',
      price: '$15',
      attendees: 89,
      rating: 4.5,
      reviews: 12,
      tags: ['Networking', 'Tech', 'Startups']
    },
    {
      id: 3,
      name: 'Yoga in the Park',
      category: 'wellness',
      date: '2024-06-30',
      time: '9:00 AM',
      location: 'Riverside Park',
      distance: '1.5 miles away',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      description: 'Beginner-friendly yoga session in the beautiful park setting. Mats provided, all levels welcome.',
      price: '$10',
      attendees: 34,
      rating: 4.8,
      reviews: 25,
      tags: ['Yoga', 'Wellness', 'Outdoor']
    },
    {
      id: 4,
      name: 'Art Gallery Opening',
      category: 'culture',
      date: '2024-07-02',
      time: '6:00 PM',
      location: 'Contemporary Arts Center',
      distance: '1.7 miles away',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      description: 'Opening night for the new contemporary art exhibition. Wine and cheese reception included.',
      price: '$25',
      attendees: 156,
      rating: 4.6,
      reviews: 31,
      tags: ['Art', 'Gallery', 'Wine']
    },
    {
      id: 5,
      name: 'Food Truck Festival',
      category: 'food',
      date: '2024-07-08',
      time: '12:00 PM',
      location: 'Downtown Plaza',
      distance: '0.5 miles away',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      description: 'Weekend food truck festival with over 20 trucks serving international cuisine. Live music and family activities.',
      price: 'Free Entry',
      attendees: 423,
      rating: 4.9,
      reviews: 67,
      tags: ['Food', 'Festival', 'Family']
    },
    {
      id: 6,
      name: 'Book Club Meeting',
      category: 'community',
      date: '2024-06-25',
      time: '7:00 PM',
      location: 'Local Library',
      distance: '2.1 miles away',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      description: 'Monthly book club discussing "The Midnight Library" by Matt Haig. New members always welcome!',
      price: 'Free',
      attendees: 23,
      rating: 4.4,
      reviews: 9,
      tags: ['Books', 'Discussion', 'Community']
    },
    {
      id: 7,
      name: 'Hiking Adventure',
      category: 'outdoor',
      date: '2024-07-06',
      time: '8:00 AM',
      location: 'Mountain Trail Park',
      distance: '15.3 miles away',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
      description: 'Guided hiking tour through scenic mountain trails. Moderate difficulty, bring water and snacks.',
      price: '$35',
      attendees: 18,
      rating: 4.7,
      reviews: 14,
      tags: ['Hiking', 'Nature', 'Guided']
    },
    {
      id: 8,
      name: 'Comedy Night',
      category: 'entertainment',
      date: '2024-06-29',
      time: '8:30 PM',
      location: 'Laugh Factory',
      distance: '1.3 miles away',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      description: 'Stand-up comedy night featuring local comedians. Two-drink minimum, 21+ only.',
      price: '$20',
      attendees: 67,
      rating: 4.3,
      reviews: 22,
      tags: ['Comedy', 'Entertainment', '21+']
    }
  ]);

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
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const EventCard = ({ event }) => (
    <div className="event-card">
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
          <h3 className="event-name">{event.name}</h3>
          <span className="event-distance">{event.distance}</span>
        </div>
        <div className="event-location">
          <span className="location-icon">📍</span>
          <span className="location-name">{event.location}</span>
        </div>
        <p className="event-description">{event.description}</p>
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