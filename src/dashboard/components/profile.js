import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './profile.css';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { likeService } from '../../services/likeService';
import { postService } from '../../services/postService';
import { commentService } from '../../services/commentService';
import { eventService } from '../../services/eventService';
import { imageUploadService } from '../../services/imageUploadService';
import EventImage from '../../components/eventImage';
import { formatDateInTimezone, getUserTimezone, convertUTCToDatetimeLocal } from '../../utils/timezoneUtils';
import { recommendService } from '../../services/recommendService';
import RecommendationCard from './create-components/RecommendationCard';
import RecommendationModal from './create-components/RecommendationModal';
import ProfileAvatar from './ProfileAvatar';
import EventCard from './EventCard';
import EventModal from './EventModal';
import { businessLocationService } from '../../services/businessLocationService';
import BusinessLocationCard from './create-components/businessCard.tsx';
import BusinessModal from './create-components/businessModal.tsx';
import PostCard from '../profileComponents/postCard';
import PostModal from '../profileComponents/postModal';
import { personService } from '../../services/personService';
import PersonCard from '../profileComponents/personCard';
import PersonModal from '../profileComponents/personModal';

const EditProfileModal = ({
  showEditModal,
  setShowEditModal,
  editFormData,
  setEditFormData,
  handleSaveProfile,
  isSaving
}) => {
  const [uploading, setUploading] = React.useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState(null);

  // Generate signed URL for preview when avatar path changes
  React.useEffect(() => {
    const getSignedUrl = async () => {
      if (!editFormData.avatar_url) {
        setAvatarPreviewUrl(null);
        return;
      }
      // If it's a URL (http/https), just use it
      if (editFormData.avatar_url.startsWith('http')) {
        setAvatarPreviewUrl(editFormData.avatar_url);
        return;
      }
      // Otherwise, generate signed URL from storage path
      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(editFormData.avatar_url, 3600);
      if (error) {
        setAvatarPreviewUrl(null);
      } else {
        setAvatarPreviewUrl(data.signedUrl);
      }
    };
    getSignedUrl();
  }, [editFormData.avatar_url]);

  const uploadAvatar = async (file) => {
    try {
      setUploading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('No authenticated user found');
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
      if (error) throw error;
      // Store only the file path
      setEditFormData(prev => ({
        ...prev,
        avatar_url: fileName
      }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  if (!showEditModal) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '95%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0 }}>Edit Profile</h2>
          <button
            onClick={() => setShowEditModal(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Username *
          </label>
          <input
            type="text"
            value={editFormData.username || ''}
            onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Email *
          </label>
          <input
            type="email"
            value={editFormData.email || ''}
            onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Display Name
          </label>
          <input
            type="text"
            value={editFormData.display_name || ''}
            onChange={(e) => setEditFormData(prev => ({ ...prev, display_name: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={editFormData.phone || ''}
            onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Bio
          </label>
          <textarea
            value={editFormData.bio || ''}
            onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Timezone
          </label>
          <select
            value={editFormData.timezone || 'UTC'}
            onChange={(e) => setEditFormData(prev => ({ ...prev, timezone: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            <option value="UTC">UTC (Coordinated Universal Time)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT/BST)</option>
            <option value="Europe/Paris">Paris (CET/CEST)</option>
            <option value="Europe/Berlin">Berlin (CET/CEST)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Shanghai">Shanghai (CST)</option>
            <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
            <option value="Pacific/Auckland">Auckland (NZST/NZDT)</option>
          </select>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '12px',
            color: '#666'
          }}>
            This affects how event times are displayed for you
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Avatar
          </label>
          <div style={{ marginBottom: '8px' }}>
            <input
              type="url"
              value={editFormData.avatar_url || ''}
              onChange={async (e) => {
                const value = e.target.value;
                setEditFormData(prev => ({ ...prev, avatar_url: value }));
              }}
              placeholder="Or enter image URL: https://example.com/avatar.jpg"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                marginBottom: '8px'
              }}
            />
          </div>
          <div style={{
            border: '2px dashed #ddd',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f9f9f9'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  uploadAvatar(file);
                }
              }}
              style={{ display: 'none' }}
              id="avatar-upload"
              disabled={uploading}
            />
            <label
              htmlFor="avatar-upload"
              style={{
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'block',
                color: uploading ? '#999' : '#007AFF',
                fontSize: '16px',
                opacity: uploading ? 0.7 : 1
              }}
            >
              {uploading ? '⏳ Uploading...' : '📁 Upload Image from Computer'}
            </label>
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '14px',
              color: '#666'
            }}>
              Click to select an image file (JPG, PNG, GIF)
            </p>
          </div>
          {avatarPreviewUrl && (
            <div style={{
              marginTop: '12px',
              textAlign: 'center'
            }}>
              <img
                src={avatarPreviewUrl}
                alt="Avatar preview"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #ddd'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '12px',
                color: '#666'
              }}>
                Preview
              </p>
            </div>
          )}
        </div>



        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Locations
          </label>
          <input
            type="text"
            placeholder="Add a location (press Enter)"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.target.value.trim();
                if (value && !editFormData.locations?.includes(value)) {
                  setEditFormData(prev => ({
                    ...prev,
                    locations: [...(prev.locations || []), value]
                  }));
                  e.target.value = '';
                }
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              marginBottom: '8px'
            }}
          />
          {editFormData.locations && editFormData.locations.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {editFormData.locations.map((location, index) => (
                <span
                  key={index}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {location}
                  <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({
                      ...prev,
                      locations: prev.locations?.filter(l => l !== location) || []
                    }))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0',
                      marginLeft: '4px'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => setShowEditModal(false)}
            style={{
              padding: '12px 24px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#007AFF',
              color: 'white',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};



const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [showPostMenu, setShowPostMenu] = useState(null); // post uuid or null
  const [isDeleting, setIsDeleting] = useState(false);
  const [editPostData, setEditPostData] = useState(null); // for edit modal
  const [deleteModal, setDeleteModal] = useState({ open: false, postUuid: null });
  const [deleteEventModal, setDeleteEventModal] = useState({ open: false, eventUuid: null });
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ content: '', location: '', tags: '', imageUrl: '' });
  const [userLocations, setUserLocations] = useState([]); // Store user locations from junction table
  const [selectedPostModal, setSelectedPostModal] = useState(null); // for Instagram-like post modal
  const [userEvents, setUserEvents] = useState([]); // Store user events
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [editEventFormData, setEditEventFormData] = useState({
    title: '',
    location: '',
    description: '',
    tags: '',
    imageUrl: '',
    price: '',
    scheduledTime: '',
    capacity: '',
    eventType: 'general'
  });
  const [selectedEventImageFile, setSelectedEventImageFile] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userRecommendations, setUserRecommendations] = useState([]);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [deleteRecommendationModal, setDeleteRecommendationModal] = useState({ open: false, rec: null });
  const [userBusinessLocations, setUserBusinessLocations] = useState([]);
  const [deleteBusinessModal, setDeleteBusinessModal] = useState({ open: false, businessUuid: null });
  const [isDeletingBusiness, setIsDeletingBusiness] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [userPeople, setUserPeople] = useState([]);
  const [deletePersonModal, setDeletePersonModal] = useState({ open: false, personUuid: null });
  const [isDeletingPerson, setIsDeletingPerson] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const { isPageLoaded, markPageAsLoaded } = usePageCache();

  // Custom hook for like state management
  const useLikeState = (postUuid, initialLikeCount = 0) => {
    const [likeState, setLikeState] = React.useState({
      liked: false,
      likesCount: initialLikeCount
    });

    // On mount, check if the user has liked the post
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
      // Optimistic update
      setLikeState(prev => {
        const liked = !prev.liked;
        const likesCount = liked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1);
        return { liked, likesCount };
      });
      try {
        const result = await likeService.likePost(postUuid);
        setLikeState({ liked: result.liked, likesCount: result.likesCount });
      } catch (e) {
        setLikeState(prev => ({
          liked: !prev.liked,
          likesCount: initialLikeCount
        }));
      }
    }, [postUuid, initialLikeCount]);

    return [likeState, handleLike];
  };

  // Empty user recommendations array since user has no recommendations
  const userRecommend = [];

  // User events are now loaded from the database
  // const userListings = []; // Removed since we're using userEvents now





  // Load user profile and posts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setProfileError('User not authenticated');
          setIsLoading(false);
          return;
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('uuid', user.id)
          .single();

        if (profileError) {
          setProfileError('Failed to load profile');
          setIsLoading(false);
          return;
        }

        setUserProfile({
          ...profile,
          posts: 0, // Will be updated below
          followers: 0, // Will be updated below
          following: 0 // Will be updated below
        });

        // Get user's posts count and posts
        const postsWithTags = await postService.getUserPosts(user.id);
        setUserPosts(postsWithTags || []);
        setUserProfile(prev => ({ ...prev, posts: postsWithTags ? postsWithTags.length : 0 }));

        // Get followers count
        const { count: followersCount, error: followersError } = await supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id);

        if (!followersError) {
          setUserProfile(prev => ({ ...prev, followers: followersCount || 0 }));
        }

        // Get following count
        const { count: followingCount, error: followingError } = await supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id);

        if (!followingError) {
          setUserProfile(prev => ({ ...prev, following: followingCount || 0 }));
        }

        // Get user locations from junction table
        const { data: locations, error: locationsError } = await supabase
          .from('user_locations')
          .select('location_name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!locationsError) {
          setUserLocations(locations || []);
        }

        // Get user events
        try {
          const userEventsData = await eventService.getUserEvents();
          setUserEvents(userEventsData || []);
        } catch (error) {
          console.error('Error loading user events:', error);
          setUserEvents([]);
        }

        // Get recommendations
        const recommendations = await recommendService.getUserRecommendations(user.id);
        setUserRecommendations(recommendations || []);

        // Get user business locations
        try {
          const userBusinessLocationsData = await businessLocationService.getUserBusinessLocations();
          setUserBusinessLocations(userBusinessLocationsData || []);
        } catch (error) {
          console.error('Error loading user business locations:', error);
          setUserBusinessLocations([]);
        }

        // Get user people/services
        try {
          const userPeopleData = await personService.getUserPeople();
          console.log('User people data:', userPeopleData);
          setUserPeople(userPeopleData || []);
        } catch (error) {
          console.error('Error loading user people:', error);
          setUserPeople([]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfileError('Failed to load profile');
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);



  // Show loading screen
  if (isLoading || !userProfile) {
    return <LoadingScreen message="Loading Your Profile . . ." />;
  }
  if (profileError) {
    return <div style={{ color: 'red', padding: '2rem' }}>Error: {profileError}</div>;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await authService.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        // Clear dashboard service selection from localStorage
        localStorage.removeItem('dashboard_selected_service');

        // Redirect to landing page after successful logout
        navigate('/');
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleEditProfile = () => {
    setEditFormData({
      username: userProfile.username?.replace('@', '') || '',
      email: userProfile.email || '',
      display_name: userProfile.display_name || '',
      phone: userProfile.phone || '',
      bio: userProfile.bio || '',
      locations: userLocations.map(loc => loc.location_name) || [],
      avatar_url: userProfile.avatar_url || ''
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      // Update profile basic info
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editFormData.username,
          email: editFormData.email,
          display_name: editFormData.display_name,
          phone: editFormData.phone,
          bio: editFormData.bio,
          avatar_url: editFormData.avatar_url,
          timezone: editFormData.timezone || 'UTC',
          updated_at: new Date().toISOString()
        })
        .eq('uuid', user.id);

      if (error) throw error;

      // Get current locations from state
      const currentLocations = userLocations.map(l => l.location_name);
      const newLocations = editFormData.locations || [];
      const toDelete = currentLocations.filter(loc => !newLocations.includes(loc));
      const toInsert = newLocations.filter(loc => !currentLocations.includes(loc));

      // Delete removed locations
      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_locations')
          .delete()
          .eq('user_id', user.id)
          .in('location_name', toDelete);
        if (deleteError) throw deleteError;
      }

      // Insert new locations
      if (toInsert.length > 0) {
        const locationRecords = toInsert.map(location => ({
          user_id: user.id,
          location_name: location,
          created_at: new Date().toISOString()
        }));
        const { error: insertError } = await supabase
          .from('user_locations')
          .insert(locationRecords);
        if (insertError) throw insertError;
      }

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        username: editFormData.username,
        email: editFormData.email,
        display_name: editFormData.display_name,
        bio: editFormData.bio,
        phone: editFormData.phone,
        avatar_url: editFormData.avatar_url,
        timezone: editFormData.timezone || 'UTC'
      }));

      // Update local locations state
      setUserLocations(newLocations.map(location => ({ location_name: location })));

      setShowEditModal(false);
      showNotification('Profile updated!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ open: true, message, type });
    setTimeout(() => setNotification({ open: false, message: '', type: '' }), 2500);
  };

  // Edit post handler
  const openEditModal = (post) => {
    console.log('Opening edit modal for post:', post);
    setEditForm({
      content: post.post_body_text || post.content || '',
      location: post.location || '',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
      imageUrl: post.image_url || post.image || ''
    });
    setEditPostData(post);
    setIsEditing(true);
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    console.log('Handling edit post submission:', editPostData, editForm);
    if (!editPostData) return;

    setIsSaving(true);
    try {
      await postService.updatePost(editPostData.uuid, editForm);

      // Update local state
      setUserPosts(prev => prev.map(post =>
        post.uuid === editPostData.uuid
          ? {
            ...post,
            post_body_text: editForm.content,
            location: editForm.location,
            image_url: editForm.imageUrl,
            tags: editForm.tags ? editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
          }
          : post
      ));

      setEditPostData(null);
      setEditForm({ content: '', location: '', tags: '', imageUrl: '' });
      setIsEditing(false);
      setNotification({ open: true, message: 'Post updated successfully!', type: 'success' });
      setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error updating post:', error);
      setNotification({ open: true, message: 'Failed to update post', type: 'error' });
      setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async (postUuid) => {
    setIsDeleting(true);
    try {
      await postService.deletePost(postUuid);

      // Update local state
      setUserPosts(prev => prev.filter(post => post.uuid !== postUuid));
      setUserProfile(prev => ({ ...prev, posts: prev.posts - 1 }));
      setDeleteModal({ open: false, postUuid: null });
      setNotification({ open: true, message: 'Post deleted successfully!', type: 'success' });

      setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error deleting post:', error);
      setNotification({ open: true, message: 'Failed to delete post', type: 'error' });
      setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteEvent = async (eventUuid) => {
    setIsDeletingEvent(true);
    try {
      await eventService.deleteEvent(eventUuid);

      // Update local state
      setUserEvents(prev => prev.filter(event => event.uuid !== eventUuid));
      setDeleteEventModal({ open: false, eventUuid: null });
      setNotification({ open: true, message: 'Event deleted successfully!', type: 'success' });

      setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error deleting event:', error);
      setNotification({ open: true, message: 'Failed to delete event', type: 'error' });
      setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleEventImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        imageUploadService.validateImageFile(file);
        setSelectedEventImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setEventImagePreview(e.target.result);
        reader.readAsDataURL(file);

        // Clear URL input when file is selected
        setEditEventFormData(prev => ({ ...prev, imageUrl: '' }));
      } catch (error) {
        setNotification({ open: true, message: error.message, type: 'error' });
        setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
        e.target.value = '';
      }
    }
  };

  const openEditEventModal = (event) => {
    // Get user's timezone for converting the scheduled time
    const userTimezone = getUserTimezone();

    setEventToEdit(event);
    setEditEventFormData({
      title: event.event || '',
      location: event.location || '',
      description: event.description || '',
      tags: event.tags ? event.tags.join(', ') : '',
      imageUrl: event.image_url || '',
      price: event.price ? event.price.toString() : '',
      scheduledTime: event.scheduled_time ? convertUTCToDatetimeLocal(event.scheduled_time, userTimezone) : '',
      capacity: event.capacity ? event.capacity.toString() : '',
      eventType: event.event_type || 'general'
    });
    setSelectedEventImageFile(null);
    setEventImagePreview(null);
    setShowEditEventModal(true);
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    if (!editEventFormData.title.trim()) return;

    setIsEditingEvent(true);
    try {
      let finalImageUrl = editEventFormData.imageUrl;

      // Upload image file if selected
      if (selectedEventImageFile) {
        const { publicUrl } = await imageUploadService.uploadEventImage(selectedEventImageFile);
        finalImageUrl = publicUrl;
      }

      // Update event with image URL
      await eventService.updateEvent(eventToEdit.uuid, {
        ...editEventFormData,
        imageUrl: finalImageUrl
      });

      // Update the event in the local state
      setUserEvents(prev => prev.map(event =>
        event.uuid === eventToEdit.uuid
          ? {
            ...event,
            event: editEventFormData.title,
            location: editEventFormData.location,
            description: editEventFormData.description,
            image_url: finalImageUrl,
            tags: editEventFormData.tags ? editEventFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            capacity: editEventFormData.capacity ? parseInt(editEventFormData.capacity) : null,
            event_type: editEventFormData.eventType
          }
          : event
      ));

      setShowEditEventModal(false);
      setEventToEdit(null);
      setEditEventFormData({
        title: '',
        location: '',
        description: '',
        tags: '',
        imageUrl: '',
        price: '',
        scheduledTime: '',
        capacity: '',
        eventType: 'general'
      });
      setSelectedEventImageFile(null);
      setEventImagePreview(null);
      setNotification({ open: true, message: 'Event updated successfully!', type: 'success' });
      setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error updating event:', error);
      setNotification({ open: true, message: 'Failed to update event', type: 'error' });
      setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
    } finally {
      setIsEditingEvent(false);
    }
  };

  // Add handlers in the Profile component:
  const openEditRecommendation = (rec) => {
    // TODO: Implement edit modal logic
    console.log('Edit recommendation:', rec);
  };
  const openDeleteRecommendation = (rec) => {
    setDeleteRecommendationModal({ open: true, rec });
  };
  const handleDeleteRecommendation = async () => {
    if (!deleteRecommendationModal.rec) return;
    try {
      await recommendService.deleteRecommendation(deleteRecommendationModal.rec.uuid);
      setUserRecommendations(prev => prev.filter(r => r.uuid !== deleteRecommendationModal.rec.uuid));
      setDeleteRecommendationModal({ open: false, rec: null });
      showNotification('Recommendation deleted!', 'success');
    } catch (error) {
      showNotification('Failed to delete recommendation', 'error');
    }
  };

  const handleDeleteBusiness = async (businessUuid) => {
    setIsDeletingBusiness(true);
    try {
      await businessLocationService.deleteBusinessLocation(businessUuid);

      // Update local state
      setUserBusinessLocations(prev => prev.filter(business => business.uuid !== businessUuid));
      setDeleteBusinessModal({ open: false, businessUuid: null });
      setNotification({ open: true, message: 'Business location deleted successfully!', type: 'success' });

      setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error deleting business location:', error);
      setNotification({ open: true, message: 'Failed to delete business location', type: 'error' });
      setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
    } finally {
      setIsDeletingBusiness(false);
    }
  };

  const handleDeletePerson = async (personUuid) => {
    setIsDeletingPerson(true);
    try {
      await personService.deletePerson(personUuid);

      // Update local state
      setUserPeople(prev => prev.filter(person => person.uuid !== personUuid));
      setDeletePersonModal({ open: false, personUuid: null });
      setNotification({ open: true, message: 'Service deleted successfully!', type: 'success' });

      setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error deleting person:', error);
      setNotification({ open: true, message: 'Failed to delete service', type: 'error' });
      setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
    } finally {
      setIsDeletingPerson(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-cover">
          <div className="profile-avatar-large" style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', padding: 0, margin: 0, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ProfileAvatar avatarPath={userProfile.avatar_url} />
          </div>
        </div>
        <div className="profile-info">
          <div className="profile-name-section">
            <h1 className="profile-name">{userProfile.display_name || userProfile.username || 'User'}</h1>
            <span className="profile-username">@{userProfile.username || 'user'}</span>
          </div>
          <p className="profile-bio">{userProfile.bio || 'No bio yet.'}</p>
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <span>{userLocations.length > 0 ? userLocations[0].location_name : 'Location not set'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <span>Joined {userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</span>
            </div>
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{userProfile.posts || 0}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userProfile.followers || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userProfile.following || 0}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="edit-profile-btn" onClick={handleEditProfile}>Edit Profile</button>
            <button className="settings-btn">⚙️</button>
            <button
              className="logout-btn"
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{ opacity: isLoggingOut ? 0.7 : 1 }}
            >
              {isLoggingOut ? 'Logging Out...' : 'Log Out'}
            </button>

          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts ({userProfile.posts || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'recommend' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommend')}
        >
          Recommendations ({userRecommendations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          Listings ({userEvents.length + userBusinessLocations.length + userPeople.length})
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'posts' && (
          <div className="posts-grid" style={{ width: '100%' }}>
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <PostCard 
                  key={post.uuid} 
                  post={{
                    ...post,
                    content: post.post_body_text,
                    image: post.image_url,
                    tags: post.tags || [],
                    timestamp: post.created_at ? new Date(post.created_at).toLocaleString() : '',
                    location: post.location || '',
                    likes: post.like_count || 0,
                    comments: post.comment_count || 0,
                    distance: '',
                  }}
                  userProfile={userProfile}
                  onPostClick={setSelectedPostModal}
                  onEditPost={openEditModal}
                  onDeletePost={(postUuid) => setDeleteModal({ open: true, postUuid })}
                  isDeleting={isDeleting}
                  showPostMenu={showPostMenu}
                  setShowPostMenu={setShowPostMenu}
                  useLikeState={useLikeState}
                />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', margin: '0 auto', width: '100%', color: '#666', padding: '2rem' }}>
                No posts yet. Start sharing your experiences!
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommend' && (
          <div className="listings-grid">
            {userRecommendations.length > 0 ? (
              userRecommendations.map(rec => (
                <div key={rec.uuid} onClick={() => { setSelectedRecommendation(rec); setShowRecommendationModal(true); }}>
                  <RecommendationCard
                    rec={{ ...rec, image: rec.image_url }}
                    onEdit={openEditRecommendation}
                    onDelete={openDeleteRecommendation}
                  />
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', margin: '0 auto', width: '100%', color: '#666', padding: '2rem' }}>
                No recommendations yet. Start recommending places and events!
              </div>
            )}
            {showRecommendationModal && selectedRecommendation && (
              <RecommendationModal
                recommendation={selectedRecommendation}
                onClose={() => { setShowRecommendationModal(false); setSelectedRecommendation(null); }}
                userProfile={userProfile}
              />
            )}
            {deleteRecommendationModal.open && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '32px 32px 24px 32px',
                  minWidth: 320,
                  maxWidth: '90vw',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  textAlign: 'center',
                }}>
                  <h2 style={{ margin: 0, marginBottom: 16 }}>Delete Recommendation?</h2>
                  <p style={{ color: '#86868b', marginBottom: 32 }}>Are you sure you want to delete this recommendation? This action cannot be undone.</p>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <button
                      style={{
                        background: '#f0f0f0',
                        color: '#1d1d1f',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 24px',
                        fontSize: 16,
                        cursor: 'pointer',
                      }}
                      onClick={() => setDeleteRecommendationModal({ open: false, rec: null })}
                    >
                      Cancel
                    </button>
                    <button
                      style={{
                        background: '#ff3b30',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 24px',
                        fontSize: 16,
                        cursor: 'pointer',
                      }}
                      onClick={handleDeleteRecommendation}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="listings-grid">
            {userEvents.length > 0 || userBusinessLocations.length > 0 || userPeople.length > 0 ? (
              <>
                {userEvents.map(event => (
                  <EventCard
                    key={event.uuid}
                    event={event}
                    openEditEventModal={openEditEventModal}
                    setDeleteEventModal={setDeleteEventModal}
                    setSelectedEvent={setSelectedEvent}
                    setShowEventModal={setShowEventModal}
                  />
                ))}
                {userBusinessLocations.map(business => (
                  <BusinessLocationCard
                    key={business.uuid}
                    business={business}
                    openEditBusinessModal={() => {}} // TODO: Implement edit modal
                    setDeleteBusinessModal={setDeleteBusinessModal}
                    setSelectedBusiness={setSelectedBusiness}
                    setShowBusinessModal={setShowBusinessModal}
                  />
                ))}
                {userPeople.map(person => (
                  <PersonCard
                    key={person.uuid}
                    person={person}
                    onDelete={(personUuid) => setDeletePersonModal({ open: true, personUuid })}
                    onView={(person) => {
                      setSelectedPerson(person);
                      setShowPersonModal(true);
                    }}
                  />
                ))}
              </>
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', margin: '0 auto', width: '100%', color: '#666', padding: '2rem' }}>
                No listings yet. Start creating your own listings!
              </div>
            )}
            {showEventModal && selectedEvent && (
              <EventModal
                event={selectedEvent}
                onClose={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                userProfile={userProfile}
              />
            )}
            {showBusinessModal && selectedBusiness && (
              <BusinessModal
                business={selectedBusiness}
                onClose={() => {
                  setShowBusinessModal(false);
                  setSelectedBusiness(null);
                }}
                userProfile={userProfile}
              />
            )}
            {showPersonModal && selectedPerson && (
              <PersonModal
                person={selectedPerson}
                onClose={() => {
                  setShowPersonModal(false);
                  setSelectedPerson(null);
                }}
                userProfile={userProfile}
              />
            )}
          </div>
        )}
      </div>
      <EditProfileModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        handleSaveProfile={handleSaveProfile}
        isSaving={isSaving}
      />
      {/* Notification */}
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
      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '32px 32px 24px 32px',
            minWidth: 320,
            maxWidth: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            textAlign: 'center',
          }}>
            <h2 style={{ margin: 0, marginBottom: 16 }}>Delete Post?</h2>
            <p style={{ color: '#86868b', marginBottom: 32 }}>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                style={{
                  background: '#f0f0f0',
                  color: '#1d1d1f',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontSize: 16,
                  cursor: 'pointer',
                }}
                onClick={() => setDeleteModal({ open: false, postUuid: null })}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                style={{
                  background: '#ff3b30',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontSize: 16,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                }}
                onClick={() => handleDeletePost(deleteModal.postUuid)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Event Confirmation Modal */}
      {deleteEventModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '32px 32px 24px 32px',
            minWidth: 320,
            maxWidth: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            textAlign: 'center',
          }}>
            <h2 style={{ margin: 0, marginBottom: 16 }}>Delete Event?</h2>
            <p style={{ color: '#86868b', marginBottom: 32 }}>Are you sure you want to delete this event? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                style={{
                  background: '#f0f0f0',
                  color: '#1d1d1f',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontSize: 16,
                  cursor: 'pointer',
                }}
                onClick={() => setDeleteEventModal({ open: false, eventUuid: null })}
                disabled={isDeletingEvent}
              >
                Cancel
              </button>
              <button
                style={{
                  background: '#ff3b30',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontSize: 16,
                  cursor: isDeletingEvent ? 'not-allowed' : 'pointer',
                  opacity: isDeletingEvent ? 0.7 : 1,
                }}
                onClick={() => handleDeleteEvent(deleteEventModal.eventUuid)}
                disabled={isDeletingEvent}
              >
                {isDeletingEvent ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Business Confirmation Modal */}
      {deleteBusinessModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '32px 32px 24px 32px',
            minWidth: 320,
            maxWidth: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            textAlign: 'center',
          }}>
            <h2 style={{ margin: 0, marginBottom: 16 }}>Delete Business Location?</h2>
            <p style={{ color: '#86868b', marginBottom: 32 }}>Are you sure you want to delete this business location? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                style={{
                  background: '#f0f0f0',
                  color: '#1d1d1f',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontSize: 16,
                  cursor: 'pointer',
                }}
                onClick={() => setDeleteBusinessModal({ open: false, businessUuid: null })}
                disabled={isDeletingBusiness}
              >
                Cancel
              </button>
              <button
                style={{
                  background: '#ff3b30',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontSize: 16,
                  cursor: isDeletingBusiness ? 'not-allowed' : 'pointer',
                  opacity: isDeletingBusiness ? 0.7 : 1,
                }}
                onClick={() => handleDeleteBusiness(deleteBusinessModal.businessUuid)}
                disabled={isDeletingBusiness}
              >
                {isDeletingBusiness ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Person Confirmation Modal */}
      {deletePersonModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '32px 32px 24px 32px',
            minWidth: 320,
            maxWidth: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            textAlign: 'center',
          }}>
            <h2 style={{ margin: 0, marginBottom: 16 }}>Delete Service?</h2>
            <p style={{ color: '#86868b', marginBottom: 32 }}>Are you sure you want to delete this service? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                style={{
                  background: '#f0f0f0',
                  color: '#1d1d1f',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontSize: 16,
                  cursor: 'pointer',
                }}
                onClick={() => setDeletePersonModal({ open: false, personUuid: null })}
                disabled={isDeletingPerson}
              >
                Cancel
              </button>
              <button
                style={{
                  background: '#ff3b30',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontSize: 16,
                  cursor: isDeletingPerson ? 'not-allowed' : 'pointer',
                  opacity: isDeletingPerson ? 0.7 : 1,
                }}
                onClick={() => handleDeletePerson(deletePersonModal.personUuid)}
                disabled={isDeletingPerson}
              >
                {isDeletingPerson ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Post Modal */}
      {editPostData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '32px 32px 24px 32px',
            minWidth: 340,
            maxWidth: '96vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            textAlign: 'left',
            width: 500,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ margin: 0, marginBottom: 16 }}>Edit Post</h2>
            <form onSubmit={handleEditPost} className="create-post-form">
              <div className="form-group">
                <label htmlFor="edit-content">What's happening?</label>
                <textarea
                  id="edit-content"
                  value={editForm.content}
                  onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Share your experience, thoughts, or recommend..."
                  rows={4}
                  maxLength={500}
                  required
                />
                <div className="char-count">{editForm.content.length}/500</div>
              </div>
              <div className="form-group">
                <label htmlFor="edit-location">Location (optional)</label>
                <input
                  type="text"
                  id="edit-location"
                  value={editForm.location}
                  onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Where are you?"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-tags">Tags (optional)</label>
                <input
                  type="text"
                  id="edit-tags"
                  value={editForm.tags}
                  onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="Add tags separated by commas (e.g., #food, #datenight)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-imageUrl">Image URL (optional)</label>
                <input
                  type="url"
                  id="edit-imageUrl"
                  value={editForm.imageUrl}
                  onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {editForm.imageUrl && (
                <div className="image-preview">
                  <img src={editForm.imageUrl} alt="Preview" onError={e => (e.target.style.display = 'none')} />
                </div>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditPostData(null);
                    setIsEditing(false);
                  }}
                  disabled={isEditing === 'saving'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!editForm.content.trim() || isEditing === 'saving'}
                >
                  {isEditing === 'saving' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Post Modal */}
      {selectedPostModal && (
        <PostModal
          post={selectedPostModal}
          onClose={() => setSelectedPostModal(null)}
          userProfile={userProfile}
          onCommentAdded={(postUuid) => {
            setUserPosts(prev => prev.map(p =>
              p.uuid === postUuid
                ? { ...p, comment_count: (p.comment_count || 0) + 1 }
                : p
            ));
          }}
        />
      )}
      {/* Edit Event Modal */}
      {showEditEventModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '32px 32px 24px 32px',
            minWidth: 340,
            maxWidth: '96vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            textAlign: 'left',
            width: 500,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ margin: 0, marginBottom: 16 }}>Edit Event</h2>
            <form onSubmit={handleEditEvent} className="create-post-form">
              <div className="form-group">
                <label htmlFor="edit-event-title">Event Title</label>
                <input
                  type="text"
                  id="edit-event-title"
                  value={editEventFormData.title}
                  onChange={e => setEditEventFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="What's your event called?"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-event-location">Location</label>
                <input
                  type="text"
                  id="edit-event-location"
                  value={editEventFormData.location}
                  onChange={e => setEditEventFormData(f => ({ ...f, location: e.target.value }))}
                  placeholder="Where is the event happening?"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-event-description">Description</label>
                <textarea
                  id="edit-event-description"
                  value={editEventFormData.description}
                  onChange={e => setEditEventFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Tell people about your event..."
                  rows={4}
                  maxLength={1000}
                />
                <div className="char-count">
                  {editEventFormData.description.length}/1000
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="edit-event-time">Event Time (optional)</label>
                <input
                  type="datetime-local"
                  id="edit-event-time"
                  value={editEventFormData.scheduledTime}
                  onChange={e => setEditEventFormData(f => ({ ...f, scheduledTime: e.target.value }))}
                  placeholder="When is the event happening?"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-event-price">Price (optional)</label>
                <div className="price-input-container">
                  <span className="price-symbol">$</span>
                  <input
                    type="number"
                    id="edit-event-price"
                    value={editEventFormData.price}
                    onChange={e => setEditEventFormData(f => ({ ...f, price: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="price-hint">Leave empty for free events</div>
              </div>
              <div className="form-group">
                <label htmlFor="edit-event-capacity">Capacity (optional)</label>
                <input
                  type="number"
                  id="edit-event-capacity"
                  value={editEventFormData.capacity}
                  onChange={e => setEditEventFormData(f => ({ ...f, capacity: e.target.value }))}
                  placeholder="Maximum number of attendees"
                  min="1"
                />
                <div className="capacity-hint">Leave empty for unlimited capacity</div>
              </div>
              <div className="form-group">
                <label htmlFor="edit-event-type">Event Type</label>
                <select
                  id="edit-event-type"
                  value={editEventFormData.eventType}
                  onChange={e => setEditEventFormData(f => ({ ...f, eventType: e.target.value }))}
                >
                  <option value="general">General</option>
                  <option value="concert">Concert</option>
                  <option value="workshop">Workshop</option>
                  <option value="party">Party</option>
                  <option value="meetup">Meetup</option>
                  <option value="conference">Conference</option>
                  <option value="sports">Sports</option>
                  <option value="food">Food & Dining</option>
                  <option value="art">Art & Culture</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-event-tags">Tags (optional)</label>
                <input
                  type="text"
                  id="edit-event-tags"
                  value={editEventFormData.tags}
                  onChange={e => setEditEventFormData(f => ({ ...f, tags: e.target.value }))}
                  placeholder="Add tags separated by commas (e.g., #party, #music, #networking)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-event-image">Event Image (optional)</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="edit-event-image"
                    accept="image/*"
                    onChange={handleEventImageFileChange}
                    className="image-upload-input"
                  />
                  <label htmlFor="edit-event-image" className="image-upload-label">
                    <div className="image-upload-content">
                      <span className="image-upload-icon">📷</span>
                      <span className="image-upload-text">Choose an image or drag here</span>
                      <span className="image-upload-hint">Max 5MB • JPEG, PNG, WebP, GIF</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-event-imageUrl">Or provide image URL (optional)</label>
                <input
                  type="url"
                  id="edit-event-imageUrl"
                  value={editEventFormData.imageUrl}
                  onChange={e => {
                    setEditEventFormData(f => ({ ...f, imageUrl: e.target.value }));
                    // Clear file selection when URL is entered
                    setSelectedEventImageFile(null);
                    setEventImagePreview(null);
                  }}
                  placeholder="https://example.com/event-image.jpg"
                />
              </div>

              {(eventImagePreview || editEventFormData.imageUrl) && (
                <div className="image-preview">
                  <img
                    src={eventImagePreview || editEventFormData.imageUrl}
                    alt="Preview"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowEditEventModal(false);
                    setEventToEdit(null);
                    setEditEventFormData({
                      title: '',
                      location: '',
                      description: '',
                      tags: '',
                      imageUrl: '',
                      price: '',
                      scheduledTime: '',
                      capacity: '',
                      eventType: 'general'
                    });
                  }}
                  disabled={isEditingEvent}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!editEventFormData.title.trim() || isEditingEvent}
                >
                  {isEditingEvent ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          userProfile={userProfile}
        />
      )}
    </div>
  );
};

export default Profile; 