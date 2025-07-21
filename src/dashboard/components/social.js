import React, { useState, useEffect } from 'react';
import './social.css';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';

const Social = () => {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'reviews', 'recommendations'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();

  const socialPosts = [
    {
      id: 1,
      author: 'Jessica Park',
      avatar: '👩‍🎨',
      content: 'Just discovered this amazing rooftop bar in downtown! The sunset views are incredible and they have live jazz every Thursday. Perfect spot for date night! 🍸✨',
      location: 'Downtown Rooftop Bar',
      distance: '0.8 miles away',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop',
      timestamp: '2 hours ago',
      likes: 156,
      comments: 23,
      rating: 4.8,
      tags: ['#rooftop', '#jazz', '#datenight'],
      category: 'food'
    },
    {
      id: 2,
      author: 'Marcus Chen',
      avatar: '👨‍💻',
      content: 'Hidden gem alert! This family-owned Italian restaurant in the West End has the best homemade pasta I\'ve ever tasted. Authentic recipes passed down for generations. 🍝🇮🇹',
      location: 'Mama Rosa\'s Trattoria',
      distance: '2.1 miles away',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
      timestamp: '4 hours ago',
      likes: 89,
      comments: 15,
      rating: 4.9,
      tags: ['#italian', '#pasta', '#familyowned'],
      category: 'food'
    },
    {
      id: 3,
      author: 'Sophie Rodriguez',
      avatar: '👩‍🏫',
      content: 'Weekend farmers market is back! Fresh local produce, artisanal bread, and the cutest handmade crafts. Great way to support local businesses and get some fresh air. 🌱☀️',
      location: 'Central Park Farmers Market',
      distance: '1.3 miles away',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      timestamp: '6 hours ago',
      likes: 234,
      comments: 31,
      rating: 4.7,
      tags: ['#farmersmarket', '#local', '#freshproduce'],
      category: 'outdoor'
    },
    {
      id: 4,
      author: 'Alex Thompson',
      avatar: '👨‍🎤',
      content: 'New hiking trail opened in the state park! 3-mile loop with stunning lake views and a waterfall. Perfect for a morning workout or peaceful afternoon walk. 🏃‍♂️🌲',
      location: 'Riverside State Park',
      distance: '12.5 miles away',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop',
      timestamp: '8 hours ago',
      likes: 67,
      comments: 12,
      rating: 4.6,
      tags: ['#hiking', '#nature', '#workout'],
      category: 'outdoor'
    },
    {
      id: 5,
      author: 'Emma Davis',
      avatar: '👩‍🍳',
      content: 'Art gallery opening tonight! Local artists showcasing their work with live music and wine tasting. Free entry and great networking opportunity for creatives. 🎨🍷',
      location: 'Contemporary Arts Center',
      distance: '1.7 miles away',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop',
      timestamp: '1 day ago',
      likes: 203,
      comments: 31,
      rating: 4.5,
      tags: ['#art', '#gallery', '#networking'],
      category: 'culture'
    }
  ];

  const reviews = [
    {
      id: 1,
      author: 'David Kim',
      avatar: '👨‍🔬',
      placeName: 'Downtown Coffee Co.',
      rating: 5,
      content: 'Best coffee in the city! The baristas are incredibly friendly and the atmosphere is perfect for working. Their seasonal lattes are always creative and delicious.',
      timestamp: '1 day ago',
      likes: 45,
      category: 'food'
    },
    {
      id: 2,
      author: 'Maria Garcia',
      avatar: '👩‍🏫',
      placeName: 'Zen Yoga Studio',
      rating: 4,
      content: 'Great yoga studio with excellent instructors. The space is clean and peaceful. Classes are challenging but accessible for all levels. Highly recommend!',
      timestamp: '2 days ago',
      likes: 32,
      category: 'wellness'
    },
    {
      id: 3,
      author: 'James Wilson',
      avatar: '👨‍💻',
      placeName: 'Innovation Hub',
      rating: 5,
      content: 'Amazing coworking space! Fast internet, great coffee, and lots of networking opportunities. The community here is really supportive of startups.',
      timestamp: '3 days ago',
      likes: 28,
      category: 'work'
    },
    {
      id: 4,
      author: 'Lisa Wang',
      avatar: '👩‍🎨',
      placeName: 'Riverside Park',
      rating: 4,
      content: 'Beautiful park with great walking trails and picnic areas. Perfect for family outings or quiet walks. The sunset views are spectacular.',
      timestamp: '4 days ago',
      likes: 67,
      category: 'outdoor'
    }
  ];

  const recommendations = [
    {
      id: 1,
      author: 'Carlos Rodriguez',
      avatar: '👨‍🍳',
      type: 'place',
      title: 'Local Brewery',
      description: 'Craft brewery with amazing IPAs and food trucks on weekends. Great atmosphere and live music.',
      location: '2.3 miles away',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
      timestamp: '1 day ago',
      likes: 89,
      category: 'food'
    },
    {
      id: 2,
      author: 'Sarah Johnson',
      avatar: '👩‍💼',
      type: 'event',
      title: 'Tech Meetup',
      description: 'Monthly networking event for developers and entrepreneurs. Free pizza and great conversations.',
      location: '1.5 miles away',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop',
      timestamp: '2 days ago',
      likes: 56,
      category: 'networking'
    },
    {
      id: 3,
      author: 'Mike Anderson',
      avatar: '👨‍🎤',
      type: 'place',
      title: 'Jazz Club',
      description: 'Intimate jazz club with live performances every night. Perfect date night spot with excellent cocktails.',
      location: '0.9 miles away',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      timestamp: '3 days ago',
      likes: 123,
      category: 'entertainment'
    }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: '🌐' },
    { id: 'food', name: 'Food & Drink', icon: '🍽️' },
    { id: 'outdoor', name: 'Outdoor', icon: '🌳' },
    { id: 'culture', name: 'Arts & Culture', icon: '🎨' },
    { id: 'wellness', name: 'Wellness', icon: '🧘‍♀️' },
    { id: 'work', name: 'Work', icon: '💼' },
    { id: 'networking', name: 'Networking', icon: '🤝' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎭' }
  ];

  const filteredPosts = socialPosts.filter(post => {
    return selectedCategory === 'all' || post.category === selectedCategory;
  });

  const filteredReviews = reviews.filter(review => {
    return selectedCategory === 'all' || review.category === selectedCategory;
  });

  const filteredRecommendations = recommendations.filter(rec => {
    return selectedCategory === 'all' || rec.category === selectedCategory;
  });

  // Check if page is already loaded
  useEffect(() => {
    if (isPageLoaded('social')) {
      setIsLoading(false);
    } else {
      // Simulate loading time
      const loadingTime = Math.random() * 1000 + 1000; // Random time between 1-2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        markPageAsLoaded('social');
      }, loadingTime);
      return () => clearTimeout(timer);
    }
  }, [isPageLoaded, markPageAsLoaded]);

  const SocialPost = ({ post }) => (
    <div className="social-post">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">{post.avatar}</div>
          <div className="author-info">
            <div className="author-name">{post.author}</div>
            <div className="post-timestamp">{post.timestamp}</div>
          </div>
        </div>
        <div className="post-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-number">{post.rating}</span>
        </div>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
        {post.image && (
          <div className="post-image-container">
            <img 
              src={post.image} 
              alt={`${post.location}`}
              className="post-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="post-location">
          <span className="location-icon">📍</span>
          <span className="location-name">{post.location}</span>
          <span className="location-distance">{post.distance}</span>
        </div>
        <div className="post-tags">
          {post.tags.map((tag, index) => (
            <span key={index} className="post-tag">{tag}</span>
          ))}
        </div>
      </div>
      
      <div className="post-actions">
        <button className="action-btn">
          <span>❤️</span>
          <span className="action-count">{post.likes}</span>
        </button>
        <button className="action-btn">
          <span>💬</span>
          <span className="action-count">{post.comments}</span>
        </button>
        <button className="action-btn">
          <span>📤</span>
        </button>
        <button className="action-btn">
          <span>🔖</span>
        </button>
      </div>
    </div>
  );

  const ReviewCard = ({ review }) => (
    <div className="review-card">
      <div className="review-header">
        <div className="review-author">
          <div className="author-avatar">{review.avatar}</div>
          <div className="author-info">
            <div className="author-name">{review.author}</div>
            <div className="review-timestamp">{review.timestamp}</div>
          </div>
        </div>
        <div className="review-rating">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`star ${i < review.rating ? 'filled' : 'empty'}`}>
              {i < review.rating ? '⭐' : '☆'}
            </span>
          ))}
        </div>
      </div>
      
      <div className="review-content">
        <h4 className="review-place">{review.placeName}</h4>
        <p className="review-text">{review.content}</p>
      </div>
      
      <div className="review-actions">
        <button className="action-btn">
          <span>❤️</span>
          <span className="action-count">{review.likes}</span>
        </button>
        <button className="action-btn">
          <span>💬</span>
        </button>
        <button className="action-btn">
          <span>📤</span>
        </button>
      </div>
    </div>
  );

  const RecommendationCard = ({ rec }) => (
    <div className="recommendation-card">
      <div className="rec-image-container">
        <img 
          src={rec.image} 
          alt={rec.title}
          className="rec-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="rec-type-badge">
          <span className="type-icon">{rec.type === 'place' ? '📍' : '📅'}</span>
          <span className="type-text">{rec.type}</span>
        </div>
        <div className="rec-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-number">{rec.rating}</span>
        </div>
      </div>
      
      <div className="rec-content">
        <div className="rec-header">
          <h3 className="rec-title">{rec.title}</h3>
          <span className="rec-distance">{rec.location}</span>
        </div>
        
        <div className="rec-author">
          <span className="author-icon">👤</span>
          <span className="author-name">{rec.author}</span>
          <span className="rec-timestamp">{rec.timestamp}</span>
        </div>
        
        <p className="rec-description">{rec.description}</p>
        
        <div className="rec-actions">
          <button className="action-btn">
            <span>❤️</span>
            <span className="action-count">{rec.likes}</span>
          </button>
          <button className="action-btn">
            <span>💬</span>
          </button>
          <button className="action-btn">
            <span>📤</span>
          </button>
          <button className="action-btn">
            <span>🔖</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen message="Loading Social Feed . . ." />;
  }

  return (
    <div id="social-page-container">
      <div className="social-header">
        <h1>Social Discovery</h1>
        <p>Discover posts, reviews, and recommendations from the community</p>
      </div>

      <div className="tabs-section">
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <span className="tab-icon">📱</span>
            <span className="tab-name">Posts</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <span className="tab-icon">⭐</span>
            <span className="tab-name">Reviews</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            <span className="tab-icon">💡</span>
            <span className="tab-name">Recommendations</span>
          </button>
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

      <div className="content-section">
        {activeTab === 'posts' && (
          <div className="posts-section">
            <div className="section-header">
              <h2>Community Posts</h2>
              <span className="section-count">{filteredPosts.length} posts</span>
            </div>
            <div className="posts-grid">
              {filteredPosts.map(post => (
                <SocialPost key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-section">
            <div className="section-header">
              <h2>Community Reviews</h2>
              <span className="section-count">{filteredReviews.length} reviews</span>
            </div>
            <div className="reviews-grid">
              {filteredReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="recommendations-section">
            <div className="section-header">
              <h2>Community Recommendations</h2>
              <span className="section-count">{filteredRecommendations.length} recommendations</span>
            </div>
            <div className="recommendations-grid">
              {filteredRecommendations.map(rec => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Social; 