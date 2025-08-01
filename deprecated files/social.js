import React, { useState, useEffect, useCallback } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsError, setRecommendationsError] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsPage, setRecommendationsPage] = useState(1);
  const [hasMoreRecommendations, setHasMoreRecommendations] = useState(true);
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
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

  // Filter posts by category only
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.location && post.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter recommendations by category only, with separate text search
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCategory = selectedCategory === 'all' || rec.type === selectedCategory;
    const matchesSearch = searchQuery === '' || 
                         rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (rec.location && rec.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter users by category only, with separate text search
  const filteredUsers = users.filter(user => {
    const matchesCategory = selectedCategory === 'all'; // Users don't have categories, so show all when category is 'all'
    const matchesSearch = searchQuery === '' || 
                         (user.display_name && user.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });



  // Fetch recommendations from database with pagination
  const fetchRecommendations = useCallback(async (page = 1, append = false) => {
    if (page === 1) {
      setRecommendationsLoading(true);
    }
    setRecommendationsError(null);
    try {
      const data = await recommendationService.getAllRecommendations(page, 20);
      
      if (append) {
        setRecommendations(prevRecommendations => [...prevRecommendations, ...(data || [])]);
      } else {
        setRecommendations(data || []);
      }
      
      // Check if there are more recommendations to load
      setHasMoreRecommendations((data || []).length === 20);
      setRecommendationsPage(page);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendationsError('Failed to load recommendations');
      if (!append) {
        setRecommendations([]);
      }
    } finally {
      setRecommendationsLoading(false);
    }
  }, []);

  // Load more recommendations
  const loadMoreRecommendations = useCallback(() => {
    if (!recommendationsLoading && hasMoreRecommendations) {
      fetchRecommendations(recommendationsPage + 1, true);
    }
  }, [recommendationsLoading, hasMoreRecommendations, recommendationsPage, fetchRecommendations]);

  // Fetch posts from database
  const fetchPosts = useCallback(async (page = 1, append = false) => {
    if (page === 1) {
      setPostsLoading(true);
    }
    setPostsError(null);
    try {
      const postsData = await postService.getAllPosts(page, 20);
      
      // Transform posts data to match the SocialPost component interface
      const transformedPosts = (postsData || []).map(post => {
        // Determine category based on post content or tags
        const determineCategory = (post) => {
          const content = (post.post_body_text || '').toLowerCase();
          const tags = (post.tags || []).map(tag => tag.toLowerCase());
          
          // Check for category indicators in content and tags
          if (content.includes('food') || content.includes('restaurant') || content.includes('dining') || 
              tags.some(tag => tag.includes('food') || tag.includes('restaurant'))) {
            return 'food';
          }
          if (content.includes('outdoor') || content.includes('hiking') || content.includes('nature') || 
              tags.some(tag => tag.includes('outdoor') || tag.includes('hiking'))) {
            return 'outdoor';
          }
          if (content.includes('art') || content.includes('culture') || content.includes('museum') || 
              tags.some(tag => tag.includes('art') || tag.includes('culture'))) {
            return 'culture';
          }
          if (content.includes('wellness') || content.includes('fitness') || content.includes('health') || 
              tags.some(tag => tag.includes('wellness') || tag.includes('fitness'))) {
            return 'wellness';
          }
          if (content.includes('work') || content.includes('business') || content.includes('professional') || 
              tags.some(tag => tag.includes('work') || tag.includes('business'))) {
            return 'work';
          }
          if (content.includes('network') || content.includes('meeting') || content.includes('connect') || 
              tags.some(tag => tag.includes('network') || tag.includes('meeting'))) {
            return 'networking';
          }
          if (content.includes('entertainment') || content.includes('movie') || content.includes('music') || 
              tags.some(tag => tag.includes('entertainment') || tag.includes('movie'))) {
            return 'entertainment';
          }
          return 'general';
        };

        // Handle avatar URL with fallback
        const getAvatarUrl = (post) => {
          if (post.profiles?.avatar_url) {
            return post.profiles.avatar_url;
          }
          // Return a default avatar emoji if no avatar URL is available
          return '👤';
        };

        return {
          id: post.uuid,
          author: post.profiles?.display_name || post.profiles?.username || 'Anonymous',
          avatar: getAvatarUrl(post),
          content: post.post_body_text || '',
          location: post.location || '',
          distance: '', // Not available in posts table
          image: post.image_url || null,
          timestamp: post.created_at ? new Date(post.created_at).toLocaleString() : '',
          likes: post.like_count || 0,
          comments: post.comment_count || 0,
          rating: 0, // Not available in posts table
          tags: post.tags || [],
          category: determineCategory(post)
        };
      });
      
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

  // Fetch users from database with pagination
  const fetchUsers = useCallback(async (page = 1, append = false) => {
    if (page === 1) {
      setUsersLoading(true);
    }
    setUsersError(null);
    try {
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const pageSize = 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Fetch profiles from database with pagination
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('uuid, username, display_name, avatar_url, bio, phone, created_at, updated_at')
        .neq('uuid', user?.id) // Exclude current user
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (profilesError) {
        console.error('Profiles query error:', profilesError);
        
        // Check if we're in development and mock data is enabled
        const isDevelopment = process.env.NODE_ENV === 'development';
        const useMockData = process.env.REACT_APP_USE_MOCK_DATA === 'true';
        
        if (isDevelopment && useMockData) {
          console.warn('Using mock data for development. Set REACT_APP_USE_MOCK_DATA=false to disable.');
          
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
          
          const mockUsers = mockProfiles.map(profile => ({
            uuid: profile.uuid,
            username: profile.username,
            email: '',
            display_name: profile.display_name,
            phone: profile.phone || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url,
            created_at: profile.created_at,
            updated_at: profile.updated_at || profile.created_at
          }));
          
          if (append) {
            setUsers(prevUsers => [...prevUsers, ...mockUsers]);
          } else {
            setUsers(mockUsers);
          }
          
          // Check if there are more users to load (mock data is limited)
          setHasMoreUsers(false);
          setUsersPage(page);
          return;
        } else {
          // In production or when mock data is disabled, rethrow the error
          throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
        }
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
      
      if (append) {
        setUsers(prevUsers => [...prevUsers, ...transformedUsers]);
      } else {
        setUsers(transformedUsers);
      }
      
      // Check if there are more users to load
      setHasMoreUsers((profiles || []).length === pageSize);
      setUsersPage(page);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError('Failed to load users');
      if (!append) {
        setUsers([]);
      }
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Load more users
  const loadMoreUsers = useCallback(() => {
    if (!usersLoading && hasMoreUsers) {
      fetchUsers(usersPage + 1, true);
    }
  }, [usersLoading, hasMoreUsers, usersPage, fetchUsers]);

  // Check if page is already loaded
  useEffect(() => {
    let isMounted = true;
    let timer = null;

    const loadData = () => {
      if (!isMounted) return;
      
      setIsLoading(false);
      markPageAsLoaded('social');
      
      // Fetch posts, recommendations and users after page loads
      fetchPosts(1, false);
      fetchRecommendations(1, false);
      fetchUsers(1, false);
    };

    if (isPageLoaded('social')) {
      setIsLoading(false);
      // Still fetch posts, recommendations and users even if page is cached
      if (isMounted) {
        fetchPosts(1, false);
        fetchRecommendations(1, false);
        fetchUsers(1, false);
      }
    } else {
      // Use fixed loading time for consistent UX
      const loadingTime = 1500; // Fixed 1.5 seconds for consistent experience
      timer = setTimeout(() => {
        if (isMounted) {
          loadData();
        }
      }, loadingTime);
    }

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [fetchPosts, fetchRecommendations, fetchUsers, markPageAsLoaded]);

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

      <div className="search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search posts, recommendations, or users..."
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
                  onClick={() => fetchRecommendations(1, false)}
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
                {hasMoreRecommendations && (
                  <div className="load-more-container">
                    <button 
                      onClick={loadMoreRecommendations}
                      disabled={recommendationsLoading}
                      className="load-more-button"
                    >
                      {recommendationsLoading ? 'Loading...' : 'Load More Recommendations'}
                    </button>
                  </div>
                )}
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
                  onClick={() => fetchUsers(1, false)}
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
                {hasMoreUsers && (
                  <div className="load-more-container">
                    <button 
                      onClick={loadMoreUsers}
                      disabled={usersLoading}
                      className="load-more-button"
                    >
                      {usersLoading ? 'Loading...' : 'Load More Users'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Social; 