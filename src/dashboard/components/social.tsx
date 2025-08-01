import React, { useState, useEffect, useCallback } from 'react';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';
import UserCard from '../socialComponents/userCard';
import RecommendationCard from '../socialComponents/recommendationCard';
import PostCard from '../socialComponents/postCard';
import recommendationService from '../../services/recommendationService.js';
import { postService } from '../../services/postService.js';
import { supabase } from '../../lib/supabaseClient.js';
import './social.css';

// TypeScript interfaces
interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  location: string;
  distance: string;
  image: string | null;
  timestamp: string;
  likes: number;
  comments: number;
  rating: number;
  tags: string[];
  category: string;
}

interface Recommendation {
  uuid: string;
  title: string;
  description: string;
  location: string;
  type: string;
  rating: number;
  image_url: string | null;
  author: string;
  created_at: string;
  distance?: string;
  user_id: string;
}

interface User {
  uuid: string;
  username: string;
  email: string;
  display_name: string;
  phone: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'recommendations' | 'users'>('posts');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState<boolean>(false);
  const [recommendationsPage, setRecommendationsPage] = useState<number>(1);
  const [hasMoreRecommendations, setHasMoreRecommendations] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [usersPage, setUsersPage] = useState<number>(1);
  const [hasMoreUsers, setHasMoreUsers] = useState<boolean>(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [postsPage, setPostsPage] = useState<number>(1);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();

  const categories: Category[] = [
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
  const fetchRecommendations = useCallback(async (page: number = 1, append: boolean = false) => {
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
  const fetchPosts = useCallback(async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setPostsLoading(true);
    }
    setPostsError(null);
    try {
      const postsData = await postService.getAllPosts(page, 20);
      
             // Transform posts data to match the SocialPost component interface
       const transformedPosts: Post[] = [];
       
       for (const post of (postsData || [])) {
         // Determine category based on post content or tags
         const determineCategory = (post: any): string => {
           const content = (post.post_body_text || '').toLowerCase();
           const tags = (post.tags || []).map((tag: string) => tag.toLowerCase());
           
           // Check for category indicators in content and tags
           if (content.includes('food') || content.includes('restaurant') || content.includes('dining') || 
               tags.some((tag: string) => tag.includes('food') || tag.includes('restaurant'))) {
             return 'food';
           }
           if (content.includes('outdoor') || content.includes('hiking') || content.includes('nature') || 
               tags.some((tag: string) => tag.includes('outdoor') || tag.includes('hiking'))) {
             return 'outdoor';
           }
           if (content.includes('art') || content.includes('culture') || content.includes('museum') || 
               tags.some((tag: string) => tag.includes('art') || tag.includes('culture'))) {
             return 'culture';
           }
           if (content.includes('wellness') || content.includes('fitness') || content.includes('health') || 
               tags.some((tag: string) => tag.includes('wellness') || tag.includes('fitness'))) {
             return 'wellness';
           }
           if (content.includes('work') || content.includes('business') || content.includes('professional') || 
               tags.some((tag: string) => tag.includes('work') || tag.includes('business'))) {
             return 'work';
           }
           if (content.includes('network') || content.includes('meeting') || content.includes('connect') || 
               tags.some((tag: string) => tag.includes('network') || tag.includes('meeting'))) {
             return 'networking';
           }
           if (content.includes('entertainment') || content.includes('movie') || content.includes('music') || 
               tags.some((tag: string) => tag.includes('entertainment') || tag.includes('movie'))) {
             return 'entertainment';
           }
           return 'general';
         };

         // Handle avatar URL with fallback - using the same approach as profile component
         const getAvatarUrl = async (post: any): Promise<string> => {
           console.log('Post profiles data:', post.profiles);
           console.log('Avatar URL:', post.profiles?.avatar_url);
           
           if (post.profiles?.avatar_url && post.profiles.avatar_url !== '') {
             // If it's already a URL (http/https), just use it
             if (post.profiles.avatar_url.startsWith('http')) {
               console.log('Using valid avatar URL:', post.profiles.avatar_url);
               return post.profiles.avatar_url;
             } else {
               // Generate signed URL from storage path (same as profile component)
               console.log('Generating signed URL for filename:', post.profiles.avatar_url);
               try {
                 const { data, error } = await supabase.storage
                   .from('avatars')
                   .createSignedUrl(post.profiles.avatar_url, 3600);
                 if (error) {
                   console.error('Error generating signed URL:', error);
                   throw error;
                 } else {
                   console.log('Generated signed URL:', data.signedUrl);
                   return data.signedUrl;
                 }
               } catch (error) {
                 console.error('Failed to generate signed URL:', error);
                 // Fall back to initials
               }
             }
           } else {
             console.log('No avatar URL found or empty');
           }
           
           // Return initials as fallback
           const displayName = post.profiles?.display_name || post.profiles?.username || 'Anonymous';
           const initial = displayName.charAt(0).toUpperCase();
           console.log('Using initial as fallback:', initial);
           return initial;
         };

         // Get avatar URL asynchronously
         const avatarUrl = await getAvatarUrl(post);
         
         transformedPosts.push({
           id: post.uuid,
           author: post.profiles?.display_name || post.profiles?.username || 'Anonymous',
           avatar: avatarUrl,
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
         });
       }
      
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
  const fetchUsers = useCallback(async (page: number = 1, append: boolean = false) => {
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
          
          const mockUsers: User[] = mockProfiles.map(profile => ({
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
      
             // Transform profiles data to user data format with avatar URL handling
       const transformedUsers: User[] = [];
       
       for (const profile of (profiles || [])) {
         // Handle avatar URL with fallback - using the same approach as profile component
         const getAvatarUrl = async (profile: any): Promise<string | null> => {
           if (profile.avatar_url && profile.avatar_url !== '') {
             // If it's already a URL (http/https), just use it
             if (profile.avatar_url.startsWith('http')) {
               return profile.avatar_url;
             } else {
               // Generate signed URL from storage path (same as profile component)
               try {
                 const { data, error } = await supabase.storage
                   .from('avatars')
                   .createSignedUrl(profile.avatar_url, 3600);
                 if (error) {
                   console.error('Error generating signed URL for user avatar:', error);
                   return null;
                 } else {
                   return data.signedUrl;
                 }
               } catch (error) {
                 console.error('Failed to generate signed URL for user avatar:', error);
                 return null;
               }
             }
           }
           return null;
         };

         // Get avatar URL asynchronously
         const avatarUrl = await getAvatarUrl(profile);
         
         transformedUsers.push({
           uuid: profile.uuid,
           username: profile.username,
           email: '', // Not included in select for security
           display_name: profile.display_name,
           phone: profile.phone || '',
           bio: profile.bio || '',
           avatar_url: avatarUrl,
           created_at: profile.created_at,
           updated_at: profile.updated_at || profile.created_at
         });
       }
      
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
    let timer: NodeJS.Timeout | null = null;

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
    <div id="social-page-container" className="w-full min-h-full p-0 bg-transparent">
      <div className="social-header mb-8">
        <h1 className="text-[32px] font-bold text-[#1d1d1f] mb-2 tracking-[-0.5px]">
          Social Discovery
        </h1>
        <p className="text-lg text-[#86868b] font-normal">
          Discover posts, reviews, and recommendations from the community
        </p>
      </div>

      <div className="tabs-section mb-8">
        <div className="tabs-container flex bg-[#f0f0f0] rounded-xl p-1 gap-0.5 max-w-[600px]">
          <button
            className={`tab-btn flex items-center gap-2 px-6 py-3 bg-none border-none rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium text-[#86868b] flex-1 whitespace-nowrap ${
              activeTab === 'posts' 
                ? 'active bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.1)]' 
                : 'hover:bg-white/50 hover:text-[#1d1d1f]'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            <span className="tab-name font-medium">Posts</span>
          </button>

          <button
            className={`tab-btn flex items-center gap-2 px-6 py-3 bg-none border-none rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium text-[#86868b] flex-1 whitespace-nowrap ${
              activeTab === 'recommendations' 
                ? 'active bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.1)]' 
                : 'hover:bg-white/50 hover:text-[#1d1d1f]'
            }`}
            onClick={() => setActiveTab('recommendations')}
          >
            <span className="tab-name font-medium">Recommendations</span>
          </button>
          <button
            className={`tab-btn flex items-center gap-2 px-6 py-3 bg-none border-none rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium text-[#86868b] flex-1 whitespace-nowrap ${
              activeTab === 'users' 
                ? 'active bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.1)]' 
                : 'hover:bg-white/50 hover:text-[#1d1d1f]'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <span className="tab-name font-medium">Users</span>
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="relative max-w-[600px]">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search posts, recommendations, or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="categories-section mb-8">
        <div className="categories-container flex gap-3 overflow-x-auto py-1 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn flex items-center gap-2 px-4 py-3 bg-white border border-[#e1e5e9] rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap text-sm font-medium text-[#1d1d1f] min-w-fit ${
                selectedCategory === category.id 
                  ? 'active bg-[#007AFF] border-[#007AFF] text-white' 
                  : 'hover:bg-[#f8f9fa] hover:border-[#d1d5db]'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-name font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="content-section flex-1">
        {activeTab === 'posts' && (
          <div>
            <div className="section-header flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#1d1d1f]">Community Posts</h2>
              <span className="section-count text-sm text-[#86868b] font-medium">
                {postsLoading ? 'Loading...' : `${filteredPosts.length} posts`}
              </span>
            </div>
            
            {postsError && (
              <div className="error-message bg-[#fef2f2] border border-[#fecaca] rounded-xl p-5 mb-6 text-center">
                <p className="text-[#dc2626] mb-4 text-sm">{postsError}</p>
                <button 
                  onClick={() => fetchPosts(1, false)}
                  className="retry-button bg-[#dc2626] text-white border-none py-2 px-4 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-[#b91c1c]"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {postsLoading ? (
              <div className="loading-state flex flex-col items-center justify-center py-15 px-5 text-center">
                <div className="loading-spinner w-10 h-10 border-3 border-[#f3f4f6] border-t-[#007AFF] rounded-full animate-spin mb-4"></div>
                <p className="text-[#6b7280] text-base">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state flex flex-col items-center justify-center py-20 px-5 text-center">
                <div className="empty-icon text-5xl mb-4 opacity-60">📱</div>
                <h3 className="text-[#374151] text-xl font-semibold mb-2">No posts found</h3>
                <p className="text-[#6b7280] text-base">Be the first to share something with the community!</p>
              </div>
            ) : (
              <div className="posts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8 max-w-[1200px] mx-auto">
                {filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
                {hasMorePosts && (
                  <div className="load-more-container flex justify-center mt-6 col-span-full">
                    <button 
                      onClick={loadMorePosts}
                      disabled={postsLoading}
                      className="load-more-button bg-[#007AFF] text-white border-none py-3 px-6 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 min-w-40 hover:bg-[#0056CC] hover:-translate-y-0.5 disabled:bg-[#86868b] disabled:cursor-not-allowed disabled:transform-none"
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
          <div>
            <div className="section-header flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#1d1d1f]">Community Recommendations</h2>
              <span className="section-count text-sm text-[#86868b] font-medium">
                {recommendationsLoading ? 'Loading...' : `${filteredRecommendations.length} recommendations`}
              </span>
            </div>
            
            {recommendationsError && (
              <div className="error-message bg-[#fef2f2] border border-[#fecaca] rounded-xl p-5 mb-6 text-center">
                <p className="text-[#dc2626] mb-4 text-sm">{recommendationsError}</p>
                <button 
                  onClick={() => fetchRecommendations(1, false)}
                  className="retry-button bg-[#dc2626] text-white border-none py-2 px-4 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-[#b91c1c]"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {recommendationsLoading ? (
              <div className="loading-state flex flex-col items-center justify-center py-15 px-5 text-center">
                <div className="loading-spinner w-10 h-10 border-3 border-[#f3f4f6] border-t-[#007AFF] rounded-full animate-spin mb-4"></div>
                <p className="text-[#6b7280] text-base">Loading recommendations...</p>
              </div>
            ) : filteredRecommendations.length === 0 ? (
              <div className="empty-state flex flex-col items-center justify-center py-20 px-5 text-center">
                <div className="empty-icon text-5xl mb-4 opacity-60">💡</div>
                <h3 className="text-[#374151] text-xl font-semibold mb-2">No recommendations found</h3>
                <p className="text-[#6b7280] text-base">Be the first to share a great place or event!</p>
              </div>
            ) : (
              <div className="recommendations-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8 max-w-[1200px] mx-auto">
                {filteredRecommendations.map(rec => (
                  <RecommendationCard 
                    key={rec.uuid} 
                    recommendation={{
                      ...rec,
                      user_id: rec.uuid // Use uuid as user_id if not provided
                    }}
                    onLike={(uuid) => console.log('Like recommendation:', uuid)}
                    onComment={(uuid) => console.log('Comment on recommendation:', uuid)}
                    onShare={(uuid) => console.log('Share recommendation:', uuid)}
                    onSave={(uuid) => console.log('Save recommendation:', uuid)}
                  />
                ))}
                {hasMoreRecommendations && (
                  <div className="load-more-container flex justify-center mt-6 col-span-full">
                    <button 
                      onClick={loadMoreRecommendations}
                      disabled={recommendationsLoading}
                      className="load-more-button bg-[#007AFF] text-white border-none py-3 px-6 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 min-w-40 hover:bg-[#0056CC] hover:-translate-y-0.5 disabled:bg-[#86868b] disabled:cursor-not-allowed disabled:transform-none"
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
          <div>
            <div className="section-header flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#1d1d1f]">Discover People</h2>
              <span className="section-count text-sm text-[#86868b] font-medium">
                {usersLoading ? 'Loading...' : `${filteredUsers.length} users found`}
              </span>
            </div>
            
            {usersError && (
              <div className="error-message bg-[#fef2f2] border border-[#fecaca] rounded-xl p-5 mb-6 text-center">
                <p className="text-[#dc2626] mb-4 text-sm">{usersError}</p>
                <button 
                  onClick={() => fetchUsers(1, false)}
                  className="retry-button bg-[#dc2626] text-white border-none py-2 px-4 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-[#b91c1c]"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {usersLoading ? (
              <div className="loading-state flex flex-col items-center justify-center py-15 px-5 text-center">
                <div className="loading-spinner w-10 h-10 border-3 border-[#f3f4f6] border-t-[#007AFF] rounded-full animate-spin mb-4"></div>
                <p className="text-[#6b7280] text-base">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state flex flex-col items-center justify-center py-20 px-5 text-center">
                <div className="empty-icon text-5xl mb-4 opacity-60">👥</div>
                <h3 className="text-[#374151] text-xl font-semibold mb-2">No users found near you . . .</h3>
                <p className="text-[#6b7280] text-base">Check back later to discover new people in your area!</p>
              </div>
            ) : (
                             <div className="users-grid">
                {filteredUsers.map(user => (
                  <UserCard 
                    key={user.uuid} 
                    user={user} 
                    onFollowChange={(userId: string, isFollowing: boolean) => {
                      console.log(`User ${userId} follow status changed to: ${isFollowing}`);
                      // You could update the user list or show a notification here
                    }}
                  />
                ))}
                {hasMoreUsers && (
                  <div className="load-more-container flex justify-center mt-6 col-span-full">
                    <button 
                      onClick={loadMoreUsers}
                      disabled={usersLoading}
                      className="load-more-button bg-[#007AFF] text-white border-none py-3 px-6 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 min-w-40 hover:bg-[#0056CC] hover:-translate-y-0.5 disabled:bg-[#86868b] disabled:cursor-not-allowed disabled:transform-none"
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
