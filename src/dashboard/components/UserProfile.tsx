import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { followService } from '../../services/followService';
import { postService } from '../../services/postService';
import { likeService } from '../../services/likeService';
import { commentService } from '../../services/commentService';
import { eventService } from '../../services/eventService';
import { recommendService } from '../../services/recommendService';
import { businessLocationService } from '../../services/businessLocationService';
import { personService } from '../../services/personService';
import LoadingScreen from './LoadingScreen.js';
import PostCard from '../profileComponents/postCard';
import PostModal from '../profileComponents/postModal';
import EventCard from './EventCard';
import EventModal from './EventModal';
import RecommendationCard from './create-components/RecommendationCard';
import RecommendationModal from './create-components/RecommendationModal';
import BusinessLocationCard from './create-components/businessCard';
import BusinessModal from './create-components/businessModal';
import PersonCard from '../profileComponents/personCard';
import PersonModal from '../profileComponents/personModal';
import { getAvatarEmoji, formatDate, formatProfileDate } from '../utils/userHelpers';

interface User {
  uuid: string;
  username: string;
  email: string;
  display_name: string | undefined;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Post {
  uuid: string;
  post_body_text: string;
  location: string;
  image_url: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  tags: string[];
  content: string;
  timestamp: string;
  profiles?: {
    display_name: string | null;
    username: string;
  };
}

interface Event {
  uuid: string;
  title: string;
  description: string;
  location: string;
  scheduled_time: string;
  price: number;
  capacity: number;
  event_type: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  rating: number;
  review_count: number;
}

interface Recommendation {
  uuid: string;
  title: string;
  description: string;
  location: string;
  type: string;
  rating: number;
  image_url: string | null;
  created_at: string;
}

interface BusinessLocation {
  uuid: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  business_type: string;
  image_url: string | undefined;
  created_at: string;
  created_by: string;
}

interface Person {
  uuid: string;
  service: string;
  description: string;
  location: string;
  hourly_rate: number;
  contact_info: string;
  created_at: string;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  

  
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [userRecommendations, setUserRecommendations] = useState<Recommendation[]>([]);
  const [userBusinessLocations, setUserBusinessLocations] = useState<BusinessLocation[]>([]);
  const [userPeople, setUserPeople] = useState<Person[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [selectedPostModal, setSelectedPostModal] = useState<Post | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessLocation | null>(null);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Custom hook for like state management
  const useLikeState = (postUuid: string, initialLikeCount: number = 0): [
    { liked: boolean; likesCount: number },
    () => Promise<void>
  ] => {
    const [likeState, setLikeState] = React.useState({
      liked: false,
      likesCount: initialLikeCount
    });

    React.useEffect(() => {
      let isMounted = true;
      async function checkLiked() {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const liked = await likeService.hasUserLikedPost(postUuid, user.id);
          if (isMounted) {
            setLikeState(prev => ({ ...prev, liked }));
          }
        } catch (e) {
          // ignore
        }
      }
      checkLiked();
      return () => { isMounted = false; };
    }, [postUuid]);

    const handleLike = React.useCallback(async () => {
      setLikeState(prev => {
        const liked = !prev.liked;
        const likesCount = liked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1);
        return { liked, likesCount };
      });
      try {
        const result = await likeService.likePost(postUuid);
        setLikeState({ liked: result.liked, likesCount: result.likesCount || 0 });
      } catch (e) {
        setLikeState(prev => ({
          liked: !prev.liked,
          likesCount: initialLikeCount
        }));
      }
    }, [postUuid, initialLikeCount]);

    return [likeState, handleLike];
  };



  // Load user profile and data
  useEffect(() => {
    let isMounted = true;

    const loadUserProfile = async () => {
      
      if (!userId) {
        console.error('No userId provided');
        if (isMounted) {
          setError('User ID is required');
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
          setError(null);
        }

        // Get current user to check if we're viewing our own profile
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('uuid', userId)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          if (profileError.code === 'PGRST116') {
            throw new Error(`User with ID ${userId} not found in database`);
          } else {
            throw new Error(`Database error: ${profileError.message}`);
          }
        }

        if (!profile) {
          throw new Error(`User with ID ${userId} not found`);
        }

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
        
        if (isMounted) {
          setUser({
            ...profile,
            avatar_url: avatarUrl
          });
        }

        // Check follow status and counts
        if (currentUser && currentUser.id !== userId) {
          try {
            const following = await followService.isFollowing(userId);
            if (isMounted) {
              setIsFollowing(following);
            }
          } catch (error) {
            console.error('Error checking follow status:', error);
          }

          try {
            const counts = await followService.getUserFollowCounts(userId);
            if (isMounted) {
              setFollowCounts({
                followers: counts.followers_count || 0,
                following: counts.following_count || 0
              });
            }
          } catch (error) {
            console.error('Error getting follow counts:', error);
          }
        }

        // Load user posts
        try {
          const postsData = await postService.getUserPosts(userId);
          const transformedPosts = (postsData || []).map(post => ({
            ...post,
            content: post.post_body_text || '',
            timestamp: post.created_at ? new Date(post.created_at).toLocaleString() : ''
          }));
          if (isMounted) {
            setUserPosts(transformedPosts);
          }
        } catch (error) {
          console.error('Error loading posts:', error);
        }

        // Load user events
        try {
          const eventsData = await eventService.getUserEventsById(userId);
          const transformedEvents = (eventsData || []).map((event: any) => ({
            uuid: event.uuid || '',
            title: event.event || '', // Note: events table uses 'event' field for title
            description: event.description || '',
            location: event.location || '',
            scheduled_time: event.scheduled_time || '',
            price: event.price || 0,
            capacity: event.capacity || 0,
            event_type: event.event_type || '',
            image_url: event.image_url || null,
            created_at: event.created_at || '',
            updated_at: event.updated_at || '',
            rating: event.rating || 0,
            review_count: event.review_count || 0
          }));
          if (isMounted) {
            setUserEvents(transformedEvents);
          }
        } catch (error) {
          console.error('Error loading events:', error);
        }

        // Load user recommendations
        try {
          const recommendationsData = await recommendService.getUserRecommendations(userId);
          if (isMounted) {
            setUserRecommendations(recommendationsData || []);
          }
        } catch (error) {
          console.error('Error loading recommendations:', error);
        }

        // Load user business locations
        try {
          const businessData = await businessLocationService.getUserBusinessLocationsById(userId);
          if (isMounted) {
            setUserBusinessLocations(businessData || []);
          }
        } catch (error) {
          console.error('Error loading business locations:', error);
        }

        // Load user people
        try {
          const peopleData = await personService.getUserPeopleById(userId);
          if (isMounted) {
            setUserPeople(peopleData || []);
          }
        } catch (error) {
          console.error('Error loading people:', error);
        }

      } catch (error) {
        console.error('Error loading user profile:', error);
        if (isMounted) {
          setError('Failed to load user profile');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUserProfile();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!user || isLoadingFollow) return;
    
    setIsLoadingFollow(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(user.uuid);
        setIsFollowing(false);
        setFollowCounts(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
      } else {
        await followService.followUser(user.uuid);
        setIsFollowing(true);
        setFollowCounts(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleMessage = () => {
    // Navigate to messaging with this user
    navigate(`/dashboard/messaging?user=${user?.uuid}`);
  };

  if (isLoading) {
    return <LoadingScreen message="Loading Profile..." />;
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The user you\'re looking for doesn\'t exist.'}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const avatarEmoji = getAvatarEmoji(user.display_name, user.username);
  const displayName = user.display_name || user.username;
  const userBio = user.bio || 'No bio available';
  const memberSince = formatDate(user.created_at);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
                  {/* Avatar */}
        <div className="absolute -top-16 left-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-medium shadow-lg border-4 border-white overflow-hidden">
            {user.avatar_url && user.avatar_url.startsWith('http') ? (
              <img
                src={user.avatar_url}
                alt={`${displayName}'s avatar`}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // Show fallback text when image fails to load
                  const fallback = target.parentElement?.querySelector('.avatar-fallback');
                  if (fallback) {
                    fallback.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            <span className={`avatar-fallback ${user.avatar_url && user.avatar_url.startsWith('http') ? 'hidden' : ''}`}>
              {avatarEmoji}
            </span>
          </div>
        </div>

          {/* User Info */}
          <div className="pt-20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{displayName}</h1>
                <p className="text-lg text-gray-600 mb-2">@{user.username}</p>
                {userBio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{userBio}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleFollowToggle}
                  disabled={isLoadingFollow}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    isFollowing 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                  } ${isLoadingFollow ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoadingFollow ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  )}
                </button>
                
                <button
                  onClick={handleMessage}
                  className="px-6 py-2.5 rounded-xl font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  Message
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{followCounts.followers}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{followCounts.following}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
                           <div className="text-center">
               <div className="text-2xl font-bold text-gray-900">
                 {userPosts.length + userEvents.length + userRecommendations.length + userBusinessLocations.length + userPeople.length}
               </div>
               <div className="text-sm text-gray-600">Posts</div>
             </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center text-sm text-gray-500">
              <span>Member since {memberSince}</span>
            </div>
          </div>
        </div>
      </div>

             {/* Tabs */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
         <div className="flex bg-white rounded-2xl p-2 gap-1">
           <button
             onClick={() => setActiveTab('posts')}
             className={`flex-1 bg-none border-none py-3 px-4 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
               activeTab === 'posts'
                 ? 'bg-blue-500 text-white'
                 : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
             }`}
           >
             Posts ({userPosts.length})
           </button>
           <button
             onClick={() => setActiveTab('events')}
             className={`flex-1 bg-none border-none py-3 px-4 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
               activeTab === 'events'
                 ? 'bg-blue-500 text-white'
                 : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
             }`}
           >
             Events ({userEvents.length})
           </button>
           <button
             onClick={() => setActiveTab('recommendations')}
             className={`flex-1 bg-none border-none py-3 px-4 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
               activeTab === 'recommendations'
                 ? 'bg-blue-500 text-white'
                 : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
             }`}
           >
             Recommendations ({userRecommendations.length})
           </button>
           <button
             onClick={() => setActiveTab('businesses')}
             className={`flex-1 bg-none border-none py-3 px-4 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
               activeTab === 'businesses'
                 ? 'bg-blue-500 text-white'
                 : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
             }`}
           >
             Businesses ({userBusinessLocations.length})
           </button>
           <button
             onClick={() => setActiveTab('people')}
             className={`flex-1 bg-none border-none py-3 px-4 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
               activeTab === 'people'
                 ? 'bg-blue-500 text-white'
                 : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
             }`}
           >
             People ({userPeople.length})
           </button>
         </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {userPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">This user hasn't shared any posts yet.</p>
                </div>
              ) : (
                                 <div className="grid gap-4">
                   {userPosts.map(post => (
                                           <PostCard 
                        key={post.uuid} 
                        post={post}
                        userProfile={{
                          ...user,
                          display_name: user.display_name || undefined,
                          avatar_url: user.avatar_url || undefined
                        }}
                        onPostClick={() => {}}
                        onEditPost={() => {}}
                        onDeletePost={() => {}}
                        isDeleting={false}
                        showPostMenu={null}
                        setShowPostMenu={() => {}}
                        useLikeState={useLikeState}
                      />
                   ))}
                 </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              {userEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-600">This user hasn't created any events yet.</p>
                </div>
              ) : (
                                 <div className="grid gap-4">
                   {userEvents.map(event => (
                     <EventCard 
                       key={event.uuid} 
                       event={event}
                       openEditEventModal={() => {}}
                       setDeleteEventModal={() => {}}
                       setSelectedEvent={() => {}}
                       setShowEventModal={() => {}}
                     />
                   ))}
                 </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              {userRecommendations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💡</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations yet</h3>
                  <p className="text-gray-600">This user hasn't shared any recommendations yet.</p>
                </div>
              ) : (
                                 <div className="grid gap-4">
                   {userRecommendations.map(rec => (
                     <RecommendationCard 
                       key={rec.uuid} 
                       rec={rec}
                       onEdit={(uuid: string) => {}}
                       onDelete={(uuid: string) => {}}
                     />
                   ))}
                 </div>
              )}
            </div>
          )}

          {activeTab === 'businesses' && (
            <div className="space-y-4">
              {userBusinessLocations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🏢</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No businesses yet</h3>
                  <p className="text-gray-600">This user hasn't added any businesses yet.</p>
                </div>
              ) : (
                                 <div className="grid gap-4">
                   {userBusinessLocations.map(business => (
                     <BusinessLocationCard 
                       key={business.uuid} 
                       business={{
                         ...business,
                         created_by: business.created_by || user?.uuid || '',
                         image_url: business.image_url || undefined
                       }}
                       openEditBusinessModal={() => {}}
                       setDeleteBusinessModal={() => {}}
                       setSelectedBusiness={() => {}}
                       setShowBusinessModal={() => {}}
                     />
                   ))}
                 </div>
              )}
            </div>
          )}

          {activeTab === 'people' && (
            <div className="space-y-4">
              {userPeople.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No people yet</h3>
                  <p className="text-gray-600">This user hasn't added any people yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {userPeople.map(person => (
                    <PersonCard key={person.uuid} person={person} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedPostModal && (
        <PostModal 
          post={{
            ...selectedPostModal,
            uuid: selectedPostModal.uuid,
            post_body_text: selectedPostModal.post_body_text,
            created_at: selectedPostModal.created_at,
            user_id: user?.uuid || '',
            image_url: selectedPostModal.image_url || undefined
          }}
          onClose={() => setSelectedPostModal(null)}
          userProfile={{
            ...user,
            display_name: user.display_name || undefined,
            avatar_url: user.avatar_url || undefined
          }}
        />
      )}

      {showEventModal && selectedEvent && (
        <EventModal 
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          userProfile={{
            ...user,
            display_name: user.display_name || undefined,
            avatar_url: user.avatar_url || undefined
          }}
        />
      )}

      {showRecommendationModal && selectedRecommendation && (
        <RecommendationModal 
          recommendation={selectedRecommendation}
          onClose={() => {
            setShowRecommendationModal(false);
            setSelectedRecommendation(null);
          }}
          userProfile={{
            ...user,
            display_name: user.display_name || undefined,
            avatar_url: user.avatar_url || undefined
          }}
        />
      )}

      {showBusinessModal && selectedBusiness && (
        <BusinessModal 
          business={{
            ...selectedBusiness,
            created_by: selectedBusiness.created_by || user?.uuid || '',
            image_url: selectedBusiness.image_url || undefined
          }}
          onClose={() => {
            setShowBusinessModal(false);
            setSelectedBusiness(null);
          }}
        />
      )}

      {showPersonModal && selectedPerson && (
        <PersonModal 
          person={selectedPerson}
          onClose={() => {
            setShowPersonModal(false);
            setSelectedPerson(null);
          }}
        />
      )}
    </div>
  );
};

export default UserProfile; 