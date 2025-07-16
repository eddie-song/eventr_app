import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './profile.css';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabaseClient';

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

function ProfileAvatar({ avatarPath }) {
  const [signedUrl, setSignedUrl] = React.useState(null);
  React.useEffect(() => {
    let isMounted = true;
    async function fetchUrl() {
      if (!avatarPath || avatarPath.trim() === '') {
        console.log('ProfileAvatar: No avatarPath provided');
        setSignedUrl(null);
        return;
      }
      console.log('ProfileAvatar: avatarPath =', avatarPath);
      if (avatarPath.startsWith('http')) {
        setSignedUrl(avatarPath);
        console.log('ProfileAvatar: Using direct URL');
        return;
      }
      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(avatarPath, 3600);
      if (isMounted) {
        if (error) {
          setSignedUrl(null);
          console.log('ProfileAvatar: Error creating signed URL', error);
        } else {
          setSignedUrl(data.signedUrl);
          console.log('ProfileAvatar: signedUrl =', data.signedUrl);
        }
      }
    }
    fetchUrl();
    return () => { isMounted = false; };
  }, [avatarPath]);
  if (!signedUrl) return <span role="img" aria-label="avatar">👤</span>;
  return (
    <img 
      src={signedUrl} 
      alt="avatar" 
      style={{ 
        width: '100%', 
        height: '100%', 
        borderRadius: '50%', 
        objectFit: 'cover', 
        display: 'block',
        border: 'none',
        background: 'none',
        minWidth: 0,
        minHeight: 0
      }} 
    />
  );
}

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
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();

  // Empty user posts array since user has no posts
  const userPosts = [];

  // Empty user recommendations array since user has no recommendations
  const userRecommendations = [];

  // Empty user listings array since user has no listings
  const userListings = [];

  const PostCard = ({ post }) => (
    <div className="profile-post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">{userProfile.avatar}</div>
          <div className="author-info">
            <div className="author-name">{userProfile.name}</div>
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
        <button className="action-btn">
          <span>🗺️</span>
        </button>
      </div>
    </div>
  );

  const RecommendationCard = ({ rec }) => (
    <div className="profile-rec-card">
      <div className="rec-image-container">
        <img 
          src={rec.image} 
          alt={rec.title}
          className="rec-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="rec-type-badge">{rec.type}</div>
      </div>
      <div className="rec-content">
        <div className="rec-header">
          <h3 className="rec-title">{rec.title}</h3>
          <span className="rec-distance">{rec.distance}</span>
        </div>
        <div className="rec-author">
          <span className="author-avatar small">{userProfile.avatar}</span>
          <span>{rec.author}</span>
          <span>•</span>
          <span>{rec.timestamp}</span>
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
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const { profile, profileNotFound, error } = await userService.getCurrentUserProfile();
      if (profileNotFound) {
        // Redirect to onboarding or show a message
        navigate('/register/onboarding');
        return;
      }
      if (error) {
        setProfileError(error.message || 'Failed to load profile');
      } else {
        // Set default values for null profile fields
        const profileWithDefaults = {
          name: profile.display_name || profile.username || 'User',
          username: `@${profile.username || 'user'}`,
          email: profile.email || '',
          avatar: '👤',
          avatar_url: profile.avatar_url || '',
          bio: profile.bio || 'No bio yet.',
          locations: profile.locations || [],
          joinDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
          followers: profile.followers ? profile.followers.length : 0,
          following: profile.following ? profile.following.length : 0,
          posts: profile.posts ? profile.posts.length : 0,
          recommendations: 0, // Default value
          listings: 0 // Default value
        };
        setUserProfile(profileWithDefaults);
      }
      setIsLoading(false);
    };
    fetchProfile();
    // eslint-disable-next-line
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
      display_name: userProfile.name,
      phone: userProfile.phone || '',
      bio: userProfile.bio,
      locations: userProfile.locations || [],
      avatar_url: userProfile.avatar_url || ''
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          username: editFormData.username,
          email: editFormData.email,
          display_name: editFormData.display_name,
          phone: editFormData.phone,
          bio: editFormData.bio,
          locations: editFormData.locations,
          avatar_url: editFormData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('uuid', user.id);

      if (error) throw error;

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        username: `@${editFormData.username}`,
        email: editFormData.email,
        name: editFormData.display_name,
        bio: editFormData.bio,
        phone: editFormData.phone,
        locations: editFormData.locations,
        avatar_url: editFormData.avatar_url
      }));

      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };





  const ListingCard = ({ listing }) => (
    <div className="profile-listing-card">
      <div className="listing-image-container">
        <img 
          src={listing.image} 
          alt={listing.title}
          className="listing-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className={`listing-status ${listing.status}`}>
          {listing.status === 'active' ? 'Active' : 'Inactive'}
        </div>
      </div>
      <div className="listing-content">
        <div className="listing-header">
          <h3 className="listing-title">{listing.title}</h3>
          <span className="listing-rate">{listing.rate}</span>
        </div>
        <div className="listing-category">
          <span className="category-badge">{listing.category}</span>
          <span className="listing-distance">{listing.distance}</span>
        </div>
        <p className="listing-description">{listing.description}</p>
        <div className="listing-details">
          <div className="detail-item">
            <span className="detail-label">📍</span>
            <span>{listing.location}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">🕒</span>
            <span>{listing.availability}</span>
          </div>
        </div>
        <div className="listing-stats">
          <div className="stat-item">
            <span className="stat-number">{listing.views}</span>
            <span className="stat-label">Views</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{listing.inquiries}</span>
            <span className="stat-label">Inquiries</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Posted {listing.posted}</span>
          </div>
        </div>
        <div className="listing-actions">
          <button className="edit-btn">Edit</button>
          <button className="pause-btn">Pause</button>
          <button className="delete-btn">Delete</button>
        </div>
      </div>
    </div>
  );

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
            <h1 className="profile-name">{userProfile.name}</h1>
            <span className="profile-username">{userProfile.username}</span>
          </div>
          <p className="profile-bio">{userProfile.bio}</p>
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <span>{userProfile.locations[0] || 'Location not set'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <span>Joined {userProfile.joinDate}</span>
            </div>
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{userProfile.posts}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userProfile.followers}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userProfile.following}</span>
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
          Posts ({userProfile.posts})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations ({userProfile.recommendations})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          Listings ({userProfile.listings})
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'posts' && (
          <div className="posts-grid" style={{ width: '100%' }}>
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666', width: '100%' }}>
                No posts yet. Start sharing your experiences!
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'recommendations' && (
          <div className="recommendations-grid" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {userRecommendations.length > 0 ? (
              userRecommendations.map(rec => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666', width: '100%' }}>
                No recommendations yet. Start recommending places and events!
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'listings' && (
          <div className="listings-grid" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {userListings.length > 0 ? (
              userListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666', width: '100%' }}>
                No listings yet. Start creating your own listings!
              </div>
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
    </div>
  );
};

export default Profile; 