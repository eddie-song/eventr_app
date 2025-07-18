import React, { useState, useEffect } from 'react';
import './home.css';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';
import { userService } from '../../services/userService';
import { postService } from '../../services/postService';
import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { likeService } from '../../services/likeService';

const Home = () => {
  const [activeSection, setActiveSection] = useState('all'); // 'all', 'friends', or 'following'
  const [selectedPost, setSelectedPost] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState('all');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    location: '',
    tags: '',
    imageUrl: ''
  });
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();

  const showNotification = (message, type = 'success') => {
    setNotification({ open: true, message, type });
    setTimeout(() => setNotification({ open: false, message: '', type: '' }), 2500);
  };

  const stories = [
    { id: 1, author: 'Sarah Chen', avatar: '👩‍💻', isViewed: false },
    { id: 2, author: 'Mike Johnson', avatar: '👨‍🎨', isViewed: true },
    { id: 3, author: 'Emma Davis', avatar: '👩‍🍳', isViewed: false },
    { id: 4, author: 'Alex Thompson', avatar: '👨‍💼', isViewed: true },
    { id: 5, author: 'Lisa Wang', avatar: '👩‍🎤', isViewed: false },
    { id: 6, author: 'David Kim', avatar: '👨‍🔬', isViewed: false },
    { id: 7, author: 'Maria Garcia', avatar: '👩‍🏫', isViewed: true },
    { id: 8, author: 'James Wilson', avatar: '👨‍💻', isViewed: false }
  ];

  const friendsPosts = [
    {
      id: 1,
      author: 'Sarah Chen',
      avatar: '👩‍💻',
      content: 'Just discovered this amazing rooftop bar in downtown! The sunset views are incredible and they have live jazz every Thursday. Perfect spot for date night! 🍸✨',
      location: 'Downtown Rooftop Bar',
      distance: '0.8 miles away',
      activityType: 'Nightlife',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      tags: ['#rooftop', '#jazz', '#datenight'],
      source: 'friends'
    },
    {
      id: 2,
      author: 'Mike Johnson',
      avatar: '👨‍🎨',
      content: 'Hidden gem alert! This family-owned Italian restaurant in the West End has the best homemade pasta I\'ve ever tasted. Authentic recipes passed down for generations. 🍝🇮🇹',
      location: 'Mama Rosa\'s Trattoria',
      distance: '2.1 miles away',
      activityType: 'Food & Dining',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
      timestamp: '4 hours ago',
      likes: 156,
      comments: 23,
      tags: ['#italian', '#pasta', '#familyowned'],
      source: 'friends'
    },
    {
      id: 3,
      author: 'Emma Davis',
      avatar: '👩‍🍳',
      content: 'Weekend farmers market is back! Fresh local produce, artisanal bread, and the cutest handmade crafts. Great way to support local businesses and get some fresh air. 🌱☀️',
      location: 'Central Park Farmers Market',
      distance: '1.3 miles away',
      activityType: 'Outdoor',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      timestamp: '6 hours ago',
      likes: 89,
      comments: 15,
      tags: ['#farmersmarket', '#local', '#freshproduce'],
      source: 'friends'
    },
    {
      id: 4,
      author: 'Alex Thompson',
      avatar: '👨‍💼',
      content: 'New hiking trail opened in the state park! 3-mile loop with stunning lake views and a waterfall. Perfect for a morning workout or peaceful afternoon walk. 🏃‍♂️🌲',
      location: 'Riverside State Park',
      distance: '12.5 miles away',
      activityType: 'Outdoor',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop',
      timestamp: '8 hours ago',
      likes: 67,
      comments: 12,
      tags: ['#hiking', '#nature', '#workout'],
      source: 'friends'
    },
    {
      id: 5,
      author: 'Lisa Wang',
      avatar: '👩‍🎤',
      content: 'Art gallery opening tonight! Local artists showcasing their work with live music and wine tasting. Free entry and great networking opportunity for creatives. 🎨🍷',
      location: 'Contemporary Arts Center',
      distance: '1.7 miles away',
      activityType: 'Arts & Culture',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop',
      timestamp: '1 day ago',
      likes: 203,
      comments: 31,
      tags: ['#art', '#gallery', '#networking'],
      source: 'friends'
    }
  ];

  const followingPosts = [
    {
      id: 6,
      author: 'David Kim',
      avatar: '👨‍🔬',
      content: 'Science museum has a new interactive exhibit about space exploration! Kids loved the VR Mars experience and the planetarium show. Educational and fun for all ages. 🚀🔬',
      location: 'City Science Museum',
      distance: '3.2 miles away',
      activityType: 'Family',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      timestamp: '1 day ago',
      likes: 134,
      comments: 19,
      tags: ['#science', '#museum', '#familyfun'],
      source: 'following'
    },
    {
      id: 7,
      author: 'Maria Garcia',
      avatar: '👩‍🏫',
      content: 'New yoga studio opening in the East Village! Offering morning classes, meditation sessions, and wellness workshops. Perfect for beginners and advanced practitioners. 🧘‍♀️✨',
      location: 'Zen Yoga Studio',
      distance: '2.8 miles away',
      activityType: 'Wellness',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
      timestamp: '2 days ago',
      likes: 98,
      comments: 14,
      tags: ['#yoga', '#wellness', '#meditation'],
      source: 'following'
    },
    {
      id: 8,
      author: 'James Wilson',
      avatar: '👨‍💻',
      content: 'Tech meetup this weekend! Networking event for developers, designers, and entrepreneurs. Free pizza and great conversations about the future of tech. 💻🍕',
      location: 'Innovation Hub',
      distance: '1.5 miles away',
      activityType: 'Networking',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop',
      timestamp: '2 days ago',
      likes: 76,
      comments: 22,
      tags: ['#tech', '#networking', '#meetup'],
      source: 'following'
    },
    {
      id: 9,
      author: 'Sophie Brown',
      avatar: '👩‍🎨',
      content: 'Street art festival this weekend! Local and international artists transforming the city walls. Live painting, music, and food trucks. Don\'t miss this colorful celebration! 🎨🎵',
      location: 'Downtown Arts District',
      distance: '0.9 miles away',
      activityType: 'Arts & Culture',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop',
      timestamp: '3 days ago',
      likes: 245,
      comments: 38,
      tags: ['#streetart', '#festival', '#localartists'],
      source: 'following'
    },
    {
      id: 10,
      author: 'Carlos Rodriguez',
      avatar: '👨‍🍳',
      content: 'Food truck festival returns! Over 50 trucks serving everything from tacos to gourmet desserts. Live cooking demonstrations and family-friendly activities. 🚚🍔',
      location: 'Riverside Park',
      distance: '2.3 miles away',
      activityType: 'Food & Dining',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
      timestamp: '3 days ago',
      likes: 189,
      comments: 27,
      tags: ['#foodtrucks', '#festival', '#familyfun'],
      source: 'following'
    }
  ];

  const allPosts = [...friendsPosts, ...followingPosts].sort((a, b) => {
    const timeA = new Date(a.timestamp);
    const timeB = new Date(b.timestamp);
    return timeB - timeA;
  });

  // Get unique activity types for filtering
  const activityTypes = ['all', ...new Set(allPosts.map(post => post.activityType))];

  // Filter posts by activity type
  const filteredPosts = allPosts.filter(post => 
    selectedActivityType === 'all' || post.activityType === selectedActivityType
  );

  // Get today's highlights (posts from today)
  const todaysHighlights = allPosts.filter(post => 
    post.timestamp.includes('hours ago') || post.timestamp.includes('minutes ago')
  ).slice(0, 3);

  // Handle creating a new post
  const handleCreatePost = async (postData) => {
    try {
      const result = await postService.createPost(postData);
      showNotification('Post created successfully!', 'success');
    } catch (err) {
      showNotification('Failed to create post: ' + (err.message || err), 'error');
      console.error('Create post error:', err);
    }
  };

  // Handle scroll for back to top button
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    setShowBackToTop(scrollTop > 300);
  };

  // Refresh function
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  // Back to top function
  const scrollToTop = () => {
    const container = document.querySelector('.section-content.scrollable');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Check if page is already loaded
  useEffect(() => {
    if (isPageLoaded('home')) {
      setIsLoading(false);
    } else {
      // Simulate loading time
      const loadingTime = Math.random() * 1000 + 1000; // Random time between 1-2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        markPageAsLoaded('home');
      }, loadingTime);
      return () => clearTimeout(timer);
    }
  }, [isPageLoaded, markPageAsLoaded]);

  // Like state for real posts
  const [likeStates, setLikeStates] = useState({}); // { [postUuid]: { liked: bool, likesCount: number } }

  // Like handler
  const handleLike = async (post) => {
    const postUuid = post.uuid || post.id;
    // Optimistically update UI
    setLikeStates(prev => {
      const prevState = prev[postUuid] || { liked: false, likesCount: post.likes || 0 };
      const liked = !prevState.liked;
      const likesCount = liked ? prevState.likesCount + 1 : Math.max(0, prevState.likesCount - 1);
      return { ...prev, [postUuid]: { liked, likesCount } };
    });
    // Call backend for real posts
    if (post.uuid) {
      try {
        const result = await likeService.likePost(post.uuid);
        setLikeStates(prev => ({ ...prev, [postUuid]: { liked: result.liked, likesCount: result.likesCount } }));
      } catch (e) {
        // Revert UI on error
        setLikeStates(prev => ({ ...prev, [postUuid]: { liked: !prev[postUuid].liked, likesCount: post.likes } }));
      }
    }
  };

  const PostCard = ({ post }) => {
    const postUuid = post.uuid || post.id;
    const likeState = likeStates[postUuid] || { liked: false, likesCount: post.likes || 0 };
    return (
    <div className="post-card" onClick={() => setSelectedPost(post)}>
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">{post.avatar}</div>
          <div className="author-info">
            <div className="author-name">{post.author}</div>
            <div className="post-timestamp">{post.timestamp}</div>
          </div>
        </div>
        <button className="post-menu">⋯</button>
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
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
      </div>
      <div className="post-actions">
          <button className={`action-btn${likeState.liked ? ' active' : ''}`} onClick={e => { e.stopPropagation(); handleLike(post); }}>
          <span>❤️</span>
            <span className="action-count">{likeState.likesCount}</span>
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
        <button className="action-btn">
          <span>🗺️</span>
        </button>
      </div>
    </div>
  );
  };

  // Quick Actions Component
  const QuickActions = () => (
    <div className="quick-actions">
      <button className="quick-action-btn" onClick={() => setShowQuickActions(!showQuickActions)}>
        <span>⚡</span>
        <span>Quick Actions</span>
      </button>
      {showQuickActions && (
        <div className="quick-actions-menu">
          <button className="action-menu-item" onClick={() => {
            setShowCreatePostModal(true);
            setShowQuickActions(false);
          }}>
            <span>📝</span>
            <span>Create Post</span>
          </button>
          <button className="action-menu-item">
            <span>📍</span>
            <span>Check In</span>
          </button>
          <button className="action-menu-item">
            <span>📸</span>
            <span>Share Photo</span>
          </button>
          <button className="action-menu-item">
            <span>🎯</span>
            <span>Find Events</span>
          </button>
        </div>
      )}
    </div>
  );

  // Create Post Modal Component
  const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
    const [postData, setPostData] = useState({
      content: '',
      location: '',
      tags: '',
      imageUrl: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field, value) => {
      setPostData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!postData.content.trim()) return;

      setIsSubmitting(true);
      
      try {
        await onSubmit(postData);
        setPostData({ content: '', location: '', tags: '', imageUrl: '' });
        onClose();
      } catch (error) {
        // Error handling is done in handleCreatePost
        console.error('Modal submit error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleClose = () => {
      setPostData({ content: '', location: '', tags: '', imageUrl: '' });
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Create Post</h2>
            <button className="modal-close-btn" onClick={handleClose}>✕</button>
          </div>
          
          <form onSubmit={handleSubmit} className="create-post-form">
            <div className="form-group">
              <label htmlFor="content">What's happening?</label>
              <textarea
                id="content"
                value={postData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Share your experience, thoughts, or recommend..."
                rows={4}
                maxLength={500}
                required
              />
              <div className="char-count">
                {postData.content.length}/500
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location (optional)</label>
              <input
                type="text"
                id="location"
                value={postData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Where are you?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (optional)</label>
              <input
                type="text"
                id="tags"
                value={postData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="Add tags separated by commas (e.g., #food, #datenight)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Image URL (optional)</label>
              <input
                type="url"
                id="imageUrl"
                value={postData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {postData.imageUrl && (
              <div className="image-preview">
                <img src={postData.imageUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={!postData.content.trim() || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Today's Highlights Component
  const TodaysHighlights = () => (
    todaysHighlights.length > 0 && (
      <div className="highlights-section">
        <div className="highlights-header">
          <h3>Today's Highlights</h3>
          <span className="highlights-count">{todaysHighlights.length} new</span>
        </div>
        <div className="highlights-grid">
          {todaysHighlights.map(post => (
            <div key={post.id} className="highlight-card" onClick={() => setSelectedPost(post)}>
              <div className="highlight-image">
                <img src={post.image} alt={post.location} />
                <div className="highlight-overlay">
                  <span className="highlight-time">{post.timestamp}</span>
                </div>
              </div>
              <div className="highlight-content">
                <h4>{post.location}</h4>
                <p>{post.content.substring(0, 60)}...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );

  // Activity Type Filter Component
  const ActivityTypeFilter = () => (
    <div className="activity-filter">
      <div className="filter-container">
        {activityTypes.map(type => (
          <button
            key={type}
            className={`filter-btn ${selectedActivityType === type ? 'active' : ''}`}
            onClick={() => setSelectedActivityType(type)}
          >
            {type === 'all' ? 'All' : type}
          </button>
        ))}
      </div>
    </div>
  );

  const SelectedPostView = ({ post, onClose }) => (
    <div className="selected-post-overlay">
      <div className="selected-post-container">
        <div className="selected-post-header">
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="selected-post-content">
          <div className="selected-post-author">
            <div className="author-avatar large">{post.avatar}</div>
            <div className="author-info">
              <div className="author-name">{post.author}</div>
              <div className="post-timestamp">{post.timestamp}</div>
            </div>
          </div>
          
          <div className="selected-post-text">
            <p>{post.content}</p>
          </div>
          
          {post.image && (
            <div className="selected-post-image-container">
              <img 
                src={post.image} 
                alt={`${post.location}`}
                className="selected-post-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="selected-post-location">
            <span className="location-icon">📍</span>
            <span className="location-name">{post.location}</span>
            <span className="location-distance">{post.distance}</span>
          </div>
          
          <div className="selected-post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
          
          <div className="selected-post-actions">
            <button className="action-btn large">
              <span>❤️</span>
              <span className="action-count">{post.likes}</span>
            </button>
            <button className="action-btn large">
              <span>💬</span>
              <span className="action-count">{post.comments}</span>
            </button>
            <button className="action-btn large">
              <span>📤</span>
            </button>
            <button className="action-btn large">
              <span>🔖</span>
            </button>
            <button className="action-btn large">
              <span>🗺️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen message="Loading Your Feed . . ." />;
  }

  // If a post is selected, show the selected post view
  if (selectedPost) {
    return (
      <div className="home-container">
        <SelectedPostView post={selectedPost} onClose={() => setSelectedPost(null)} />
      </div>
    );
  }

  return (
    <div className="home-container">
      {notification.open && (
        <div style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: notification.type === 'error' ? '#ff3b30' : '#007AFF',
          color: 'white',
          padding: '12px 32px',
          borderRadius: 12,
          fontSize: 16,
          zIndex: 2000,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}>
          {notification.message}
        </div>
      )}
      <div className="home-feed">
        <div className="feed-header">
          <div className="header-left">
          <h1>Home</h1>
            <QuickActions />
          </div>
          <div className="header-right">
            <button className="refresh-btn" onClick={handleRefresh} disabled={isRefreshing}>
              <span className={isRefreshing ? 'refreshing' : ''}>🔄</span>
            </button>
          </div>
        </div>
        
        <div className="stories-section">
          <div className="stories-container">
            {stories.map(story => (
              <div key={story.id} className={`story-item ${story.isViewed ? 'viewed' : ''}`}>
                <div className="story-avatar">
                  {story.avatar}
                </div>
                <div className="story-author">{story.author}</div>
              </div>
            ))}
          </div>
        </div>

        <TodaysHighlights />
        
        <div className="section-toggle-container">
          <div className="section-toggle">
            <button 
              className={`toggle-btn ${activeSection === 'all' ? 'active' : ''}`}
              onClick={() => setActiveSection('all')}
            >
              All
            </button>
            <button 
              className={`toggle-btn ${activeSection === 'friends' ? 'active' : ''}`}
              onClick={() => setActiveSection('friends')}
            >
              Friends
            </button>
            <button 
              className={`toggle-btn ${activeSection === 'following' ? 'active' : ''}`}
              onClick={() => setActiveSection('following')}
            >
              Following
            </button>
          </div>
        </div>
        
        <ActivityTypeFilter />
        
        <div className="feed-content-container">
          {activeSection === 'all' && (
            <div className="section-content scrollable" onScroll={handleScroll}>
              {filteredPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          
          {activeSection === 'friends' && (
            <div className="section-content scrollable" onScroll={handleScroll}>
              {friendsPosts.filter(post => 
                selectedActivityType === 'all' || post.activityType === selectedActivityType
              ).map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          
          {activeSection === 'following' && (
            <div className="section-content scrollable" onScroll={handleScroll}>
              {followingPosts.filter(post => 
                selectedActivityType === 'all' || post.activityType === selectedActivityType
              ).map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {showBackToTop && (
          <button className="back-to-top-btn" onClick={scrollToTop}>
            <span>↑</span>
          </button>
        )}
      </div>
              <CreatePostModal
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
          onSubmit={handleCreatePost}
        />
    </div>
  );
};

export default Home;
