import React, { useState, useEffect, useCallback } from 'react';
import './social.css';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';
import UserCard from '../socialComponents/userCard.tsx';
import RecommendationCard from '../socialComponents/recommendationCard';
import PostCard from '../socialComponents/postCard.tsx';
import recommendationService from '../../services/recommendationService.js';
import { postService } from '../../services/postService.js';
import { supabase } from '../../lib/supabaseClient.js';

const Social = () => {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'recommendations', 'users'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsError, setRecommendationsError] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsError, setPostsError] = useState(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();







  // Users data will be fetched from database

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'outdoor', name: 'Outdoor' },
    { id: 'culture', name: 'Arts & Culture' },
    { id: 'wellness', name: 'Wellness' },
    { id: 'work', name: 'Work' },
    { id: 'networking', name: 'Networking' },
    { id: 'entertainment', name: 'Entertainment' }
  ];

  const filteredPosts = posts.filter(post => {
    return selectedCategory === 'all' || post.category === selectedCategory;
  });



  const filteredRecommendations = recommendations.filter(rec => {
    return selectedCategory === 'all' || 
           rec.type === selectedCategory ||
           rec.title.toLowerCase().includes(selectedCategory) ||
           rec.description.toLowerCase().includes(selectedCategory) ||
           rec.location?.toLowerCase().includes(selectedCategory);
  });

  const filteredUsers = users.filter(user => {
    return selectedCategory === 'all' || 
           user.display_name?.toLowerCase().includes(selectedCategory) ||
           user.username.toLowerCase().includes(selectedCategory) ||
           user.bio?.toLowerCase().includes(selectedCategory);
  });



  // Fetch recommendations from database
  const fetchRecommendations = async () => {
    setRecommendationsLoading(true);
    setRecommendationsError(null);
    try {
      const data = await recommendationService.getAllRecommendations();
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendationsError('Failed to load recommendations');
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Fetch posts from database
  const fetchPosts = useCallback(async (page = 1, append = false) => {
    if (page === 1) {
      setPostsLoading(true);
    }
    setPostsError(null);
    try {
      const postsData = await postService.getAllPosts(page, 20);
      
      // Transform posts data to match the SocialPost component interface
      const transformedPosts = (postsData || []).map(post => ({
        id: post.uuid,
        author: post.profiles?.display_name || post.profiles?.username || 'Anonymous',
        avatar: '👤', // Default avatar emoji
        content: post.post_body_text || '',
        location: post.location || '',
        distance: '', // Not available in posts table
        image: post.image_url || null,
        timestamp: post.created_at ? new Date(post.created_at).toLocaleString() : '',
        likes: post.like_count || 0,
        comments: post.comment_count || 0,
        rating: 0, // Not available in posts table
        tags: post.tags || [],
        category: 'general' // Default category
      }));
      
      if (append) {
        setPosts(prevPosts => [...prevPosts, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }
      
      // Check if there are more posts to load
      setHasMorePosts(transformedPosts.length === 20);
      setPostsPage(page);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPostsError('Failed to load posts');
      if (!append) {
        setPosts([]);
      }
    } finally {
      setPostsLoading(false);
    }
  }, []);

  // Load more posts
  const loadMorePosts = useCallback(() => {
    if (!postsLoading && hasMorePosts) {
      fetchPosts(postsPage + 1, true);
    }
  }, [postsLoading, hasMorePosts, postsPage, fetchPosts]);

  // Fetch users from database (first 10, excluding current user)
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      // Fetch profiles from database
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('uuid, username, display_name, avatar_url, bio, phone, created_at, updated_at')
        .neq('uuid', user?.id) // Exclude current user
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (profilesError) {
        console.error('Profiles query error:', profilesError);
        // If RLS is blocking the query, use mock data for now
        const mockProfiles = [
          {
            uuid: 'mock-1',
            username: 'john_doe',
            display_name: 'John Doe',
            avatar_url: null,
            bio: 'Software developer and coffee enthusiast',
            phone: '+1234567890',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z'
          },
          {
            uuid: 'mock-2', 
            username: 'jane_smith',
            display_name: 'Jane Smith',
            avatar_url: null,
            bio: 'Designer and art lover',
            phone: '+1234567891',
            created_at: '2024-01-14T10:00:00Z',
            updated_at: '2024-01-14T10:00:00Z'
          },
          {
            uuid: 'mock-3',
            username: 'mike_wilson',
            display_name: 'Mike Wilson',
            avatar_url: null,
            bio: 'Photographer and travel enthusiast',
            phone: '+1234567892',
            created_at: '2024-01-13T10:00:00Z',
            updated_at: '2024-01-13T10:00:00Z'
          }
        ];
        setUsers(mockProfiles.map(profile => ({
          uuid: profile.uuid,
          username: profile.username,
          email: '',
          display_name: profile.display_name,
          phone: profile.phone || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          updated_at: profile.updated_at || profile.created_at
        })));
        return;
      }
      
      // Transform profiles data to user data format
      const transformedUsers = (profiles || []).map(profile => ({
        uuid: profile.uuid,
        username: profile.username,
        email: '', // Not included in select for security
        display_name: profile.display_name,
        phone: profile.phone || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at || profile.created_at
      }));
      
      console.log('Found real users from database:', transformedUsers);
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError('Failed to load users');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Check if page is already loaded
  useEffect(() => {
    if (isPageLoaded('social')) {
      setIsLoading(false);
      // Still fetch posts, recommendations and users even if page is cached
      fetchPosts();
      fetchRecommendations();
      fetchUsers();
    } else {
      // Simulate loading time
      const loadingTime = Math.random() * 1000 + 1000; // Random time between 1-2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        markPageAsLoaded('social');
        // Fetch posts, recommendations and users after page loads
        fetchPosts();
        fetchRecommendations();
        fetchUsers();
      }, loadingTime);
      return () => clearTimeout(timer);
    }
  }, []);

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
            <span className="tab-name">Posts</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            <span className="tab-name">Recommendations</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="tab-name">Users</span>
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
              <span className="section-count">
                {postsLoading ? 'Loading...' : `${filteredPosts.length} posts`}
              </span>
            </div>
            
            {postsError && (
              <div className="error-message">
                <p>{postsError}</p>
                <button 
                  onClick={fetchPosts}
                  className="retry-button"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {postsLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📱</div>
                <h3>No posts found</h3>
                <p>Be the first to share something with the community!</p>
              </div>
            ) : (
              <div className="posts-grid">
                {filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
                {hasMorePosts && (
                  <div className="load-more-container">
                    <button 
                      onClick={loadMorePosts}
                      disabled={postsLoading}
                      className="load-more-button"
                    >
                      {postsLoading ? 'Loading...' : 'Load More Posts'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}



        {activeTab === 'recommendations' && (
          <div className="recommendations-section">
            <div className="section-header">
              <h2>Community Recommendations</h2>
              <span className="section-count">
                {recommendationsLoading ? 'Loading...' : `${filteredRecommendations.length} recommendations`}
              </span>
            </div>
            
            {recommendationsError && (
              <div className="error-message">
                <p>{recommendationsError}</p>
                <button 
                  onClick={fetchRecommendations}
                  className="retry-button"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {recommendationsLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading recommendations...</p>
              </div>
            ) : filteredRecommendations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💡</div>
                <h3>No recommendations found</h3>
                <p>Be the first to share a great place or event!</p>
              </div>
            ) : (
              <div className="recommendations-grid">
                {filteredRecommendations.map(rec => (
                  <RecommendationCard 
                    key={rec.uuid} 
                    recommendation={rec}
                    onLike={(uuid) => console.log('Like recommendation:', uuid)}
                    onComment={(uuid) => console.log('Comment on recommendation:', uuid)}
                    onShare={(uuid) => console.log('Share recommendation:', uuid)}
                    onSave={(uuid) => console.log('Save recommendation:', uuid)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h2>Discover People</h2>
              <span className="section-count">
                {usersLoading ? 'Loading...' : `${filteredUsers.length} users found`}
              </span>
            </div>
            
            {usersError && (
              <div className="error-message">
                <p>{usersError}</p>
                <button 
                  onClick={fetchUsers}
                  className="retry-button"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {usersLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No users found near you . . .</h3>
                <p>Check back later to discover new people in your area!</p>
              </div>
            ) : (
              <div className="users-grid">
                {filteredUsers.map(user => (
                  <UserCard 
                    key={user.uuid} 
                    user={user} 
                    onFollowChange={(userId, isFollowing) => {
                      console.log(`User ${userId} follow status changed to: ${isFollowing}`);
                      // You could update the user list or show a notification here
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Social; 