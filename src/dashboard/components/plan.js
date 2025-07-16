import React, { useState, useEffect } from 'react';
import './plan.css';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';

const Plan = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedPlanType, setSelectedPlanType] = useState('day');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();

  // Sample recommended plans from system and users
  const recommendedPlans = [
    {
      id: 1,
      title: "Perfect Day in Downtown",
      creator: "Travel Expert Sarah",
      location: "Downtown",
      duration: "1 day",
      rating: 4.8,
      saves: 1247,
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
      description: "A curated day exploring the best of downtown - from morning coffee to evening cocktails.",
      activities: [
        { time: "9:00 AM", activity: "Coffee at Downtown Coffee Co.", type: "food" },
        { time: "10:30 AM", activity: "Art Gallery Visit", type: "culture" },
        { time: "12:30 PM", activity: "Lunch at Local Brewery", type: "food" },
        { time: "2:00 PM", activity: "Riverside Park Walk", type: "outdoor" },
        { time: "4:00 PM", activity: "Shopping & Street Art", type: "culture" },
        { time: "7:00 PM", activity: "Dinner at Rooftop Lounge", type: "food" }
      ],
      tags: ["Downtown", "Culture", "Food", "Outdoor"],
      isSystem: true
    },
    {
      id: 2,
      title: "Weekend Adventure",
      creator: "Mike Johnson",
      location: "City & Surroundings",
      duration: "2 days",
      rating: 4.6,
      saves: 892,
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop",
      description: "Explore the city and nearby nature spots for an adventurous weekend getaway.",
      activities: [
        { time: "Day 1", activity: "City exploration and museums", type: "culture" },
        { time: "Day 2", activity: "Hiking and outdoor activities", type: "outdoor" }
      ],
      tags: ["Weekend", "Adventure", "Nature", "Culture"],
      isSystem: false
    },
    {
      id: 3,
      title: "Foodie's Paradise",
      creator: "Emma Davis",
      location: "Various Districts",
      duration: "1 day",
      rating: 4.9,
      saves: 2156,
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
      description: "A culinary journey through the city's best restaurants and food spots.",
      activities: [
        { time: "10:00 AM", activity: "Farmers Market Breakfast", type: "food" },
        { time: "12:00 PM", activity: "Food Truck Festival", type: "food" },
        { time: "3:00 PM", activity: "Wine Tasting", type: "food" },
        { time: "7:00 PM", activity: "Fine Dining Experience", type: "food" }
      ],
      tags: ["Food", "Culinary", "Local", "Gourmet"],
      isSystem: false
    },
    {
      id: 4,
      title: "Family Fun Day",
      creator: "System",
      location: "Family-Friendly Areas",
      duration: "1 day",
      rating: 4.7,
      saves: 1567,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      description: "Perfect activities for families with kids of all ages.",
      activities: [
        { time: "9:30 AM", activity: "Science Museum", type: "family" },
        { time: "12:00 PM", activity: "Family Lunch", type: "food" },
        { time: "2:00 PM", activity: "Park & Playground", type: "family" },
        { time: "4:30 PM", activity: "Ice Cream & Treats", type: "food" }
      ],
      tags: ["Family", "Kids", "Educational", "Fun"],
      isSystem: true
    }
  ];

  // Sample user-created plans
  const userPlans = [
    {
      id: 5,
      title: "My First Visit",
      creator: "You",
      location: "Downtown",
      duration: "1 day",
      rating: 4.5,
      saves: 23,
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
      description: "My personal itinerary for exploring the city for the first time.",
      activities: [
        { time: "10:00 AM", activity: "Coffee & Planning", type: "food" },
        { time: "11:00 AM", activity: "Walking Tour", type: "culture" },
        { time: "1:00 PM", activity: "Local Lunch", type: "food" },
        { time: "3:00 PM", activity: "Shopping", type: "culture" }
      ],
      tags: ["Personal", "First Time", "Exploration"],
      isSystem: false
    }
  ];

  const filteredPlans = [...recommendedPlans, ...userPlans].filter(plan =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Check if page is already loaded
  useEffect(() => {
    if (isPageLoaded('plan')) {
      setIsLoading(false);
    } else {
      // Simulate loading time
      const loadingTime = Math.random() * 1000 + 1000; // Random time between 1-2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        markPageAsLoaded('plan');
      }, loadingTime);
      return () => clearTimeout(timer);
    }
  }, [isPageLoaded, markPageAsLoaded]);

  const PlanCard = ({ plan }) => (
    <div className="plan-card">
      <div className="plan-image-container">
        <img 
          src={plan.image} 
          alt={plan.title}
          className="plan-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="plan-badge">
          {plan.isSystem ? '🌟 System' : '👤 User'}
        </div>
        <div className="plan-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-number">{plan.rating}</span>
        </div>
      </div>
      <div className="plan-content">
        <div className="plan-header">
          <h3 className="plan-title">{plan.title}</h3>
          <div className="plan-meta">
            <span className="plan-creator">by {plan.creator}</span>
            <span className="plan-saves">💾 {plan.saves}</span>
          </div>
        </div>
        <p className="plan-description">{plan.description}</p>
        <div className="plan-details">
          <span className="plan-location">📍 {plan.location}</span>
          <span className="plan-duration">⏱️ {plan.duration}</span>
        </div>
        <div className="plan-activities">
          <h4>Activities:</h4>
          <div className="activities-list">
            {plan.activities.slice(0, 3).map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-time">{activity.time}</span>
                <span className="activity-name">{activity.activity}</span>
              </div>
            ))}
            {plan.activities.length > 3 && (
              <div className="more-activities">
                +{plan.activities.length - 3} more activities
              </div>
            )}
          </div>
        </div>
        <div className="plan-tags">
          {plan.tags.map((tag, index) => (
            <span key={index} className="plan-tag">{tag}</span>
          ))}
        </div>
        <div className="plan-actions">
          <button className="plan-action-btn primary">Use This Plan</button>
          <button className="plan-action-btn secondary">Save</button>
          <button className="plan-action-btn secondary">Share</button>
        </div>
      </div>
    </div>
  );

  const CreatePlanForm = () => (
    <div className="create-plan-form">
      <div className="form-section">
        <h3>Plan Details</h3>
        <div className="form-section-row">
          <div className="form-group">
            <label>Plan Type</label>
            <div className="plan-type-toggle">
              <button 
                className={`type-btn ${selectedPlanType === 'day' ? 'active' : ''}`}
                onClick={() => setSelectedPlanType('day')}
              >
                📅 Day Trip
              </button>
              <button 
                className={`type-btn ${selectedPlanType === 'weekend' ? 'active' : ''}`}
                onClick={() => setSelectedPlanType('weekend')}
              >
                🏖️ Weekend
              </button>
              <button 
                className={`type-btn ${selectedPlanType === 'week' ? 'active' : ''}`}
                onClick={() => setSelectedPlanType('week')}
              >
                📆 Week
              </button>
            </div>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Location</label>
            <input 
              type="text" 
              placeholder="Enter city, state, or area..."
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Plan Title</label>
          <input 
            type="text" 
            placeholder="Give your plan a catchy title..."
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea 
            placeholder="Describe what this plan is about..."
            className="form-textarea"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Interests & Preferences</label>
          <div className="interests-grid">
            {['Food & Dining', 'Culture & Arts', 'Outdoor Activities', 'Shopping', 'Nightlife', 'Family Fun', 'Adventure', 'Relaxation'].map(interest => (
              <button key={interest} className="interest-tag">
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button className="create-btn">Create Plan</button>
          <button className="ai-suggest-btn">🤖 Get AI Suggestions</button>
        </div>
      </div>
    </div>
  );

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen message="Loading Plans For You . . ." />;
  }

  return (
    <div className="plan-page-container">
      <div className="plan-header">
        <h1>Plan Your Adventure</h1>
        <p>Create custom itineraries or discover amazing plans from our community</p>
      </div>

      <div className="plan-tabs">
        <button 
          className={`plan-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ✏️ Create Plan
        </button>
        <button 
          className={`plan-tab ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          🔍 Discover Plans
        </button>
        <button 
          className={`plan-tab ${activeTab === 'my-plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-plans')}
        >
          📋 My Plans
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="tab-content">
          <CreatePlanForm />
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="tab-content">
          <div className="discover-header">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search plans by location, interests, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-buttons">
              <button className="filter-btn active">All Plans</button>
              <button className="filter-btn">🌟 System</button>
              <button className="filter-btn">👤 Community</button>
            </div>
          </div>

          <div className="plans-grid">
            {filteredPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          {filteredPlans.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No plans found</h3>
              <p>Try adjusting your search or create your own plan</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-plans' && (
        <div className="tab-content">
          <div className="my-plans-header">
            <h2>My Created Plans</h2>
            <button className="create-new-btn">+ Create New Plan</button>
          </div>
          
          <div className="plans-grid">
            {userPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          {userPlans.length === 0 && (
            <div className="no-plans">
              <div className="no-plans-icon">📋</div>
              <h3>No plans yet</h3>
              <p>Create your first plan to start organizing your adventures</p>
              <button className="create-first-btn">Create Your First Plan</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Plan; 