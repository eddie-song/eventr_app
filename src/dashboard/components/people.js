import React, { useState, useEffect } from 'react';
import './people.css';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';

const People = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();
  const [people, setPeople] = useState([
    {
      id: 1,
      name: 'Alex Chen',
      title: 'Drummer',
      category: 'music',
      location: 'Downtown',
      distance: '0.8 miles away',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      description: 'Professional drummer with 8+ years experience. Available for gigs, recording sessions, and lessons. Jazz, rock, and pop styles.',
      rate: '$50/hour',
      rating: 4.8,
      reviews: 23,
      tags: ['Drummer', 'Lessons', 'Gigs'],
      availability: 'Weekends'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      title: 'Tennis Partner',
      category: 'sports',
      location: 'West End',
      distance: '1.2 miles away',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      description: 'Intermediate tennis player looking for regular hitting partner. Available weekday evenings and weekends. Prefer 3.0-4.0 level.',
      rate: 'Free',
      rating: 4.6,
      reviews: 15,
      tags: ['Tennis', 'Intermediate', 'Weekends'],
      availability: 'Weekday Evenings'
    },
    {
      id: 3,
      name: 'Mike Rodriguez',
      title: 'Baseball Referee',
      category: 'sports',
      location: 'East Side',
      distance: '2.1 miles away',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop',
      description: 'Certified baseball umpire with 5 years experience. Available for youth leagues, adult leagues, and tournaments.',
      rate: '$75/game',
      rating: 4.9,
      reviews: 42,
      tags: ['Baseball', 'Umpire', 'Certified'],
      availability: 'Weekends'
    },
    {
      id: 4,
      name: 'Emma Davis',
      title: 'Guitar Teacher',
      category: 'music',
      location: 'North District',
      distance: '1.5 miles away',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      description: 'Classical and acoustic guitar instructor. 10+ years teaching experience. All skill levels welcome, from beginner to advanced.',
      rate: '$40/hour',
      rating: 4.7,
      reviews: 31,
      tags: ['Guitar', 'Lessons', 'Classical'],
      availability: 'Weekdays'
    },
    {
      id: 5,
      name: 'David Kim',
      title: 'Running Partner',
      category: 'fitness',
      location: 'Central Park Area',
      distance: '0.5 miles away',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
      description: 'Looking for running partner for morning jogs. 8-10 minute mile pace. Training for half marathon. 6-8 miles per run.',
      rate: 'Free',
      rating: 4.5,
      reviews: 8,
      tags: ['Running', 'Morning', 'Training'],
      availability: 'Early Mornings'
    },
    {
      id: 6,
      name: 'Lisa Wang',
      title: 'Spanish Tutor',
      category: 'education',
      location: 'University District',
      distance: '1.8 miles away',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      description: 'Native Spanish speaker offering conversational Spanish lessons. Focus on practical speaking skills and cultural context.',
      rate: '$35/hour',
      rating: 4.8,
      reviews: 19,
      tags: ['Spanish', 'Conversational', 'Native Speaker'],
      availability: 'Evenings'
    },
    {
      id: 7,
      name: 'James Wilson',
      title: 'Basketball Coach',
      category: 'sports',
      location: 'South Side',
      distance: '2.3 miles away',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      description: 'Former college basketball player offering coaching for youth and adults. Focus on fundamentals, shooting, and game strategy.',
      rate: '$60/hour',
      rating: 4.9,
      reviews: 28,
      tags: ['Basketball', 'Coaching', 'Youth'],
      availability: 'Weekends'
    },
    {
      id: 8,
      name: 'Maria Garcia',
      title: 'Yoga Instructor',
      category: 'wellness',
      location: 'Downtown',
      distance: '0.9 miles away',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      description: 'Certified yoga instructor specializing in vinyasa and restorative yoga. Private sessions and small group classes available.',
      rate: '$45/hour',
      rating: 4.7,
      reviews: 35,
      tags: ['Yoga', 'Vinyasa', 'Private Sessions'],
      availability: 'Flexible'
    },
    {
      id: 9,
      name: 'Tom Anderson',
      title: 'Chess Partner',
      category: 'games',
      location: 'Library District',
      distance: '1.1 miles away',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      description: 'Intermediate chess player (1500 rating) looking for regular games. Prefer in-person matches at local coffee shops.',
      rate: 'Free',
      rating: 4.4,
      reviews: 12,
      tags: ['Chess', 'Intermediate', 'In-Person'],
      availability: 'Weekends'
    },
    {
      id: 10,
      name: 'Sophie Brown',
      title: 'Photography Assistant',
      category: 'creative',
      location: 'Arts District',
      distance: '1.6 miles away',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      description: 'Experienced photography assistant available for weddings, events, and portrait sessions. Equipment and editing skills included.',
      rate: '$30/hour',
      rating: 4.6,
      reviews: 21,
      tags: ['Photography', 'Assistant', 'Events'],
      availability: 'Weekends'
    }
  ]);

  // Recommended people based on user preferences
  const recommendedPeople = [
    {
      id: 'rec1',
      name: 'Zen Master Li',
      title: 'Meditation Guide',
      category: 'wellness',
      location: 'Zen Center',
      distance: '0.6 miles away',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      description: 'Experienced meditation guide offering mindfulness sessions and stress relief techniques. Perfect for your wellness journey.',
      rate: '$40/hour',
      rating: 4.9,
      reviews: 38,
      tags: ['Meditation', 'Mindfulness', 'Stress Relief'],
      availability: 'Weekday Evenings',
      reason: 'Based on your interest in wellness activities'
    },
    {
      id: 'rec2',
      name: 'Tech Mentor Sarah',
      title: 'Programming Coach',
      category: 'education',
      location: 'Tech Hub',
      distance: '1.3 miles away',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop',
      description: 'Senior software engineer offering programming mentorship and career guidance. Specializes in React, Node.js, and system design.',
      rate: '$80/hour',
      rating: 4.8,
      reviews: 25,
      tags: ['Programming', 'Mentorship', 'Career'],
      availability: 'Weekends',
      reason: 'Matches your professional interests'
    },
    {
      id: 'rec3',
      name: 'Jazz Pianist Marcus',
      title: 'Jazz Musician',
      category: 'music',
      location: 'Jazz District',
      distance: '0.9 miles away',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      description: 'Professional jazz pianist available for gigs, recording sessions, and private lessons. 15+ years of performance experience.',
      rate: '$65/hour',
      rating: 4.7,
      reviews: 31,
      tags: ['Jazz', 'Piano', 'Performance'],
      availability: 'Flexible',
      reason: 'Similar to musicians you\'ve worked with'
    }
  ];

  const categories = [
    { id: 'all', name: 'All People', icon: '👥' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'wellness', name: 'Wellness', icon: '🧘‍♀️' },
    { id: 'games', name: 'Games', icon: '🎮' },
    { id: 'creative', name: 'Creative', icon: '🎨' }
  ];

  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         person.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         person.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || person.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Check if page is already loaded
  useEffect(() => {
    if (isPageLoaded('people')) {
      setIsLoading(false);
    } else {
      // Simulate loading time
      const loadingTime = Math.random() * 1000 + 1000; // Random time between 1-2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        markPageAsLoaded('people');
      }, loadingTime);
      return () => clearTimeout(timer);
    }
  }, [isPageLoaded, markPageAsLoaded]);

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
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="recommended-section">
        <div className="recommended-header">
          <h2>Recommended For You</h2>
          <span className="recommended-count">{recommendedPeople.length} personalized picks</span>
        </div>
        
        <div className="recommended-grid">
          {recommendedPeople.map(person => (
            <RecommendedPersonCard key={person.id} person={person} />
          ))}
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
            <p>Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default People; 