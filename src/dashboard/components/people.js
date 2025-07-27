import React, { useState, useEffect } from 'react';
import './people.css';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';
import { personService } from '../../services/personService';

const People = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [error, setError] = useState(null);
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();

  // Fetch people from database
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const peopleData = await personService.getAllPeople();
        // Handle null/undefined data gracefully
        setPeople(peopleData || []);
      } catch (err) {
        console.error('Error fetching people:', err);
        setError('Failed to load people');
        // Set empty array to prevent crashes
        setPeople([]);
      }
    };

    if (isPageLoaded('people')) {
      setIsLoading(false);
      fetchPeople();
    } else {
      // Simulate loading time
      const loadingTime = Math.random() * 1000 + 1000; // Random time between 1-2 seconds
      const timer = setTimeout(async () => {
        await fetchPeople();
        setIsLoading(false);
        markPageAsLoaded('people');
      }, loadingTime);
      return () => clearTimeout(timer);
    }
  }, [isPageLoaded, markPageAsLoaded]);

  // Recommended people section - service coming soon
  const recommendedPeople = [];

  const categories = [
    { id: 'all', name: 'All People' },
    { id: 'general', name: 'General' },
    { id: 'professional', name: 'Professional' },
    { id: 'creative', name: 'Creative' },
    { id: 'technical', name: 'Technical' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'education', name: 'Education' },
    { id: 'consulting', name: 'Consulting' },
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'transportation', name: 'Transportation' },
    { id: 'other', name: 'Other' }
  ];

  // Transform database people to match the expected format
  const transformPersonData = (person) => {
    // Handle null/undefined person data
    if (!person) return null;
    
    const profile = person.profiles || {};
    return {
      id: person.uuid || `person-${Math.random()}`,
      name: profile.display_name || profile.username || 'Anonymous',
      title: person.service || 'Service not specified',
      category: person.service_type || 'general',
      location: person.location || 'Location not specified',
      distance: 'Distance not available', // Could be calculated later with geolocation
      image: profile.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      description: person.description || 'No description available.',
      rate: person.hourly_rate ? `$${person.hourly_rate}/hour` : 'Rate not specified',
      rating: person.rating || 0.0,
      reviews: person.review_count || 0,
      tags: [person.service_type || 'General'],
      availability: 'Contact for availability',
      contactInfo: person.contact_info,
      serviceType: person.service_type,
    };
  };

  const filteredPeople = people
    .map(transformPersonData)
    .filter(person => person !== null) // Filter out null/undefined transformed data
    .filter(person => {
      const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           person.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           person.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || person.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  const PersonCard = ({ person }) => (
    <div className="person-card">
      <div className="person-image-container">
        <img 
          src={person.image} 
          alt={person.name}
          className="person-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
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
          <h3 className="person-name">{person.name}</h3>
          <span className="person-distance">{person.distance}</span>
        </div>
        <div className="person-title">
          <span className="title-icon">💼</span>
          <span className="title-text">{person.title}</span>
        </div>
        <div className="person-location">
          <span className="location-icon">📍</span>
          <span className="location-name">{person.location}</span>
        </div>
        <p className="person-description">{person.description}</p>
        <div className="person-footer">
          <div className="person-tags">
            {person.tags.map((tag, index) => (
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

  const RecommendedPersonCard = ({ person }) => (
    <div className="recommended-person-card">
      <div className="person-image-container">
        <img 
          src={person.image} 
          alt={person.name}
          className="person-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
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
            <div className="recommended-badge">
              <span>⭐</span>
            </div>
          </div>
          <span className="person-distance">{person.distance}</span>
        </div>
        <div className="person-title">
          <span className="title-icon">💼</span>
          <span className="title-text">{person.title}</span>
        </div>
        <div className="person-location">
          <span className="location-icon">📍</span>
          <span className="location-name">{person.location}</span>
        </div>
        <p className="person-description">{person.description}</p>
        <div className="recommendation-reason">
          <span className="reason-text">{person.reason}</span>
        </div>
        <div className="person-footer">
          <div className="person-tags">
            {person.tags.map((tag, index) => (
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

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen message="Loading People For You . . ." />;
  }

  // Show error state
  if (error) {
    return (
      <div id="people-page-container">
        <div className="people-header">
          <h1>Find People</h1>
          <p>Connect with people for activities, skills, and services</p>
        </div>
        <div className="error-message" style={{ textAlign: 'center', padding: '40px', color: '#ff3b30' }}>
          <h3>Error Loading People</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#007AFF',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="people-page-container">
      <div className="people-header">
        <h1>Find People</h1>
        <p>Connect with people for activities, skills, and services</p>
      </div>

      <div className="search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for skills, activities, or people..."
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
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="recommended-section">
        <div className="recommended-header">
          <h2>Recommended For You</h2>
          <span className="recommended-count">Service coming soon...</span>
        </div>
        
        <div className="recommended-grid">
          <div className="service-coming-soon">
            <div className="coming-soon-icon">🚀</div>
            <h3>Service Coming Soon...</h3>
            <p>We're working on personalized recommendations just for you!</p>
          </div>
        </div>
      </div>

      <div className="people-section">
        <div className="people-header-section">
          <h2>{selectedCategory === 'all' ? 'All People' : categories.find(c => c.id === selectedCategory)?.name}</h2>
          <span className="people-count">{filteredPeople.length} people found</span>
        </div>
        
        <div className="people-grid">
          {filteredPeople.map(person => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>

        {filteredPeople.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No people found</h3>
            <p>
              {people.length === 0 
                ? "No people have been added yet. Be the first to create a service listing!" 
                : "Try adjusting your search or category filter"
              }
            </p>
            {people.length === 0 && (
              <button 
                onClick={() => window.location.href = '/create'} 
                style={{
                  background: '#007AFF',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginTop: '16px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Create Your First Service
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default People; 