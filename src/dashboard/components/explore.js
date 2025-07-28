import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './explore.css';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';
import { businessLocationService } from '../../services/businessLocationService';

function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState(null);

  // Recommended places section - service coming soon
  const recommendedPlaces = [];

  const categories = [
    { id: 'all', name: 'All Places' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'outdoor', name: 'Outdoor' },
    { id: 'culture', name: 'Arts & Culture' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'community', name: 'Community' }
  ];

  // Transform business location data to match the expected format
  const transformBusinessLocation = (location) => {
    return {
      id: location.uuid,
      name: location.name,
      category: location.business_type || 'general',
      rating: location.rating || 0.0,
      distance: 'Distance not available', // Could be calculated later with geolocation
      image: location.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      description: location.description || 'No description available.',
      tags: location.tags || [],
      review_count: location.review_count || 0,
      address: location.address,
      city: location.city,
      state: location.state,
      phone: location.phone,
      website: location.website,
      hours_of_operation: location.hours_of_operation,
      price_range: location.price_range,
      amenities: location.amenities || []
    };
  };

  const filteredPlaces = places
    .map(transformBusinessLocation)
    .filter(place => {
      const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (place.description && place.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  // Fetch business locations from database
  useEffect(() => {
    const fetchBusinessLocations = async () => {
      try {
        const businessLocations = await businessLocationService.getAllBusinessLocations();
        setPlaces(businessLocations || []);
      } catch (err) {
        console.error('Error fetching business locations:', err);
        setError('Failed to load business locations');
        setPlaces([]);
      }
    };

    if (isPageLoaded('explore')) {
      setIsLoading(false);
      fetchBusinessLocations();
    } else {
      // Simulate loading time
      const loadingTime = Math.random() * 1000 + 1000; // Random time between 1-2 seconds
      const timer = setTimeout(async () => {
        await fetchBusinessLocations();
        setIsLoading(false);
        markPageAsLoaded('explore');
      }, loadingTime);
      return () => clearTimeout(timer);
    }
  }, [isPageLoaded, markPageAsLoaded]);

  const PlaceCard = ({ place }) => (
    <div 
      className="place-card" 
      onClick={() => navigate(`/dashboard/place/${place.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="place-image-container">
        <img 
          src={place.image} 
          alt={place.name}
          className="place-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="place-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-number">{place.rating}</span>
          <span className="rating-count">({place.review_count})</span>
        </div>
      </div>
      <div className="place-content">
        <div className="place-header">
          <h3 className="place-name">{place.name}</h3>
          <span className="place-distance">{place.distance}</span>
        </div>
        <div className="place-location">
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" style={{ color: 'currentColor', marginRight: '4px' }}>
            <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
          </svg>
          <span className="location-name">{place.city && place.state ? `${place.city}, ${place.state}` : place.address || 'Location not specified'}</span>
        </div>
        <p className="place-description">{place.description}</p>
        <div className="place-footer">
          <div className="place-tags">
            {place.tags && place.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="place-tag">{tag}</span>
            ))}
            {place.tags && place.tags.length > 3 && (
              <span className="place-tag-more">+{place.tags.length - 3}</span>
            )}
          </div>
          {place.price_range && (
            <div className="place-price-range">
              <span className="price-range-text">{place.price_range}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const RecommendedPlaceCard = ({ place }) => (
    <div 
      className="recommended-place-card"
      onClick={() => navigate(`/dashboard/place/${place.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="place-image-container">
        <img 
          src={place.image} 
          alt={place.name}
          className="place-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="place-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-number">{place.rating}</span>
        </div>
      </div>
      <div className="place-content">
        <div className="place-header">
          <div className="place-name-container">
            <h3 className="place-name">{place.name}</h3>
            <div className="recommended-badge">
              <span>⭐</span>
            </div>
          </div>
          <span className="place-distance">{place.distance}</span>
        </div>
        <p className="place-description">{place.description}</p>
        <div className="recommendation-reason">
          <span className="reason-text">{place.reason}</span>
        </div>
        <div className="place-tags">
          {place.tags.map((tag, index) => (
            <span key={index} className="place-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen message="Loading Places For You . . ." />;
  }
  
  return (
    <div id="explore-page-container">
      <div className="explore-header">
        <h1>Explore Places</h1>
        <p>Discover amazing places near you</p>
      </div>

      <div className="search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search places..."
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

      <div className="places-section">
        <div className="places-header">
          <h2>{selectedCategory === 'all' ? 'All Places' : categories.find(c => c.id === selectedCategory)?.name}</h2>
          <span className="places-count">{filteredPlaces.length} places found</span>
        </div>
        
        <div className="places-grid">
          {filteredPlaces.map(place => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>

        {filteredPlaces.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No places found</h3>
            <p>
              {places.length === 0 
                ? "No business locations have been added yet. Be the first to create a business listing!" 
                : "Try adjusting your search or category filter"
              }
            </p>
            {places.length === 0 && (
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
                Add Your First Business
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;