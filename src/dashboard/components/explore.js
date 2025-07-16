import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './explore.css';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';

function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();
  const [places, setPlaces] = useState([
    {
      id: 1,
      name: 'Downtown Coffee Co.',
      category: 'food',
      rating: 4.8,
      distance: '0.3 miles',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
      description: 'Artisanal coffee shop with locally roasted beans and fresh pastries.',
      tags: ['Coffee', 'Breakfast', 'WiFi']
    },
    {
      id: 2,
      name: 'Riverside Park',
      category: 'outdoor',
      rating: 4.6,
      distance: '0.8 miles',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
      description: 'Beautiful park with walking trails, playground, and river views.',
      tags: ['Park', 'Walking', 'Family-friendly']
    },
    {
      id: 3,
      name: 'The Art Gallery',
      category: 'culture',
      rating: 4.7,
      distance: '1.2 miles',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      description: 'Contemporary art gallery featuring local and international artists.',
      tags: ['Art', 'Gallery', 'Exhibitions']
    },
    {
      id: 4,
      name: 'Fitness Studio',
      category: 'fitness',
      rating: 4.5,
      distance: '1.5 miles',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      description: 'Modern fitness studio with yoga, pilates, and strength training classes.',
      tags: ['Fitness', 'Yoga', 'Classes']
    },
    {
      id: 5,
      name: 'Local Brewery',
      category: 'food',
      rating: 4.4,
      distance: '2.1 miles',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
      description: 'Craft brewery with tasting room and food trucks on weekends.',
      tags: ['Brewery', 'Beer', 'Food Trucks']
    },
    {
      id: 6,
      name: 'Community Center',
      category: 'community',
      rating: 4.3,
      distance: '1.8 miles',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      description: 'Multi-purpose community center with events, classes, and meeting spaces.',
      tags: ['Community', 'Events', 'Classes']
    }
  ]);

  // Recommended places based on user preferences
  const recommendedPlaces = [
    {
      id: 'rec1',
      name: 'Zen Garden Cafe',
      category: 'food',
      rating: 4.9,
      distance: '0.5 miles',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
      description: 'Peaceful cafe with organic food and meditation space. Perfect for your wellness routine.',
      tags: ['Organic', 'Wellness', 'Meditation'],
      reason: 'Based on your interest in wellness'
    },
    {
      id: 'rec2',
      name: 'Tech Hub Co-working',
      category: 'community',
      rating: 4.7,
      distance: '1.1 miles',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
      description: 'Modern co-working space with high-speed internet and networking events.',
      tags: ['Co-working', 'Networking', 'Tech'],
      reason: 'Matches your professional interests'
    },
    {
      id: 'rec3',
      name: 'Sunset Rooftop Lounge',
      category: 'food',
      rating: 4.6,
      distance: '0.9 miles',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
      description: 'Elegant rooftop bar with craft cocktails and stunning city views.',
      tags: ['Cocktails', 'Rooftop', 'Views'],
      reason: 'Similar to places you\'ve visited'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Places', icon: '📍' },
    { id: 'food', name: 'Food & Drink', icon: '🍽️' },
    { id: 'outdoor', name: 'Outdoor', icon: '🌳' },
    { id: 'culture', name: 'Arts & Culture', icon: '🎨' },
    { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'community', name: 'Community', icon: '👥' }
  ];

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Check if page is already loaded
  useEffect(() => {
    if (isPageLoaded('explore')) {
      setIsLoading(false);
    } else {
      // Simulate loading time
      const loadingTime = Math.random() * 1000 + 1000; // Random time between 1-2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        markPageAsLoaded('explore');
      }, loadingTime);
      return () => clearTimeout(timer);
    }
  }, [isPageLoaded, markPageAsLoaded]);

  const PlaceCard = ({ place }) => (
    <div className="place-card">
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
          <h3 className="place-name">{place.name}</h3>
          <span className="place-distance">{place.distance}</span>
        </div>
        <p className="place-description">{place.description}</p>
        <div className="place-tags">
          {place.tags.map((tag, index) => (
            <span key={index} className="place-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );

  const RecommendedPlaceCard = ({ place }) => (
    <div className="recommended-place-card">
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
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="recommended-section">
        <div className="recommended-header">
          <h2>Recommended For You</h2>
          <span className="recommended-count">{recommendedPlaces.length} personalized picks</span>
        </div>
        
        <div className="recommended-grid">
          {recommendedPlaces.map(place => (
            <RecommendedPlaceCard key={place.id} place={place} />
          ))}
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
            <p>Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;