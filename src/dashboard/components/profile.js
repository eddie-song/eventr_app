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

// Instagram-like Post Modal Component
const PostModal = ({ post, onClose, userProfile, onCommentAdded }) => {
  const [likeState, setLikeState] = React.useState({ 
    liked: false, 
    likesCount: post.like_count || 0 
  });
  const [commentText, setCommentText] = React.useState('');
  const [showComments, setShowComments] = React.useState(true); // Show comments by default
  const [comments, setComments] = React.useState([]);
  const [commentsLoading, setCommentsLoading] = React.useState(false);
  const [commentsError, setCommentsError] = React.useState(null);
  const [addingComment, setAddingComment] = React.useState(false);

  // On mount, check if the user has liked the post
  React.useEffect(() => {
    let isMounted = true;
    async function checkLiked() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const liked = await likeService.hasUserLikedPost(post.uuid, user.id);
        if (isMounted) {
          setLikeState(prev => ({ ...prev, liked }));
        }
      } catch (e) {
        // ignore
      }
    }
    checkLiked();
    return () => { isMounted = false; };
  }, [post.uuid]);

  // Fetch comments when modal opens or post changes
  React.useEffect(() => {
    if (!showComments) return;
    setCommentsLoading(true);
    setCommentsError(null);
    commentService.getCommentsForPost(post.uuid)
      .then(setComments)
      .catch(err => setCommentsError('Failed to load comments'))
      .finally(() => setCommentsLoading(false));
  }, [showComments, post.uuid]);

  const handleLike = React.useCallback(async () => {
    // Optimistic update
    setLikeState(prev => {
      const liked = !prev.liked;
      const likesCount = liked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1);
      return { liked, likesCount };
    });
    
    try {
      const result = await likeService.likePost(post.uuid);
      // Update with actual result from server
      setLikeState({ liked: result.liked, likesCount: result.likesCount });
    } catch (e) {
      console.error('Like error:', e);
      // Revert on error
      setLikeState(prev => ({ 
        liked: !prev.liked, 
        likesCount: post.like_count || 0 
      }));
    }
  }, [post.uuid, post.like_count]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      // Optimistically add comment
      const newComment = {
        uuid: Math.random().toString(36).slice(2),
        user_id: user.id,
        comment_text: commentText,
        created_at: new Date().toISOString(),
        post_id: post.uuid,
        parent_comment_id: null,
        like_count: 0,
        reply_count: 0
      };
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      await commentService.addComment({
        postId: post.uuid,
        userId: user.id,
        commentText,
      });
      // Refetch to get real data (with uuid, etc)
      const fresh = await commentService.getCommentsForPost(post.uuid);
      setComments(fresh);
      // Notify parent to update comment count in UI
      if (onCommentAdded) onCommentAdded(post.uuid);
    } catch (err) {
      setCommentsError('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  if (!post) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Left side - Image */}
        <div style={{
          flex: '1',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          {post.image ? (
            <img 
              src={post.image} 
              alt="Post"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div style={{
              color: '#666',
              fontSize: '18px',
              textAlign: 'center'
            }}>
              No image
            </div>
          )}
        </div>

        {/* Right side - Content */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '400px',
          minWidth: '300px'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e1e5e9',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="avatar"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  onError={e => (e.target.style.display = 'none')}
                />
              ) : (
                '👤'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>
                {userProfile?.display_name || userProfile?.username || 'User'}
              </div>
              <div style={{ fontSize: '12px', color: '#86868b' }}>
                {post.location || 'Unknown location'}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px',
                color: '#86868b'
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px'
          }}>
            {/* Post text */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.4',
                margin: '0 0 12px 0',
                color: '#1d1d1f'
              }}>
                {post.content}
              </p>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  {post.tags.map((tag, index) => (
                    <span key={index} style={{
                      backgroundColor: '#E3F2FD',
                      color: '#1976D2',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Location */}
              {post.location && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#86868b',
                  marginBottom: '12px'
                }}>
                  <span>📍</span>
                  <span>{post.location}</span>
                </div>
              )}

              {/* Timestamp */}
              <div style={{
                fontSize: '12px',
                color: '#86868b',
                marginBottom: '16px'
              }}>
                {post.timestamp}
              </div>
            </div>

            {/* Comments section */}
            <div style={{
              borderTop: '1px solid #e1e5e9',
              paddingTop: '16px',
              minHeight: 120
            }}>
              <button
                onClick={() => setShowComments(!showComments)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#86868b',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}
              >
                {showComments ? 'Hide comments' : 'View comments'}
              </button>
              
              {showComments && (
                <div style={{ marginBottom: '16px', maxHeight: 200, overflowY: 'auto' }}>
                  {commentsLoading && <div style={{ color: '#86868b', textAlign: 'center', padding: 12 }}>Loading comments...</div>}
                  {commentsError && <div style={{ color: 'red', textAlign: 'center', padding: 12 }}>{commentsError}</div>}
                  {!commentsLoading && !commentsError && comments.length === 0 && (
                    <div style={{ fontSize: '14px', color: '#86868b', textAlign: 'center', padding: 20 }}>No comments yet. Be the first to comment!</div>
                  )}
                  {!commentsLoading && !commentsError && comments.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {comments.map(comment => (
                        <li key={comment.uuid} style={{ marginBottom: 12, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{comment.user_id === userProfile?.uuid ? (userProfile.display_name || userProfile.username || 'You') : 'User'}</span>
                            <span style={{ color: '#86868b', fontSize: 11 }}>{new Date(comment.created_at).toLocaleString()}</span>
                          </div>
                          <div style={{ fontSize: 14 }}>{comment.comment_text}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e1e5e9'
          }}>
            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '12px'
            }}>
              <button
                onClick={handleLike}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: likeState.liked ? '#ff3b30' : '#86868b',
                  transition: 'color 0.2s ease'
                }}
              >
                {likeState.liked ? '❤️' : '🤍'}
              </button>
              <button
                onClick={() => setShowComments(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#86868b'
                }}
              >
                💬
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#86868b'
                }}
              >
                📤
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#86868b'
                }}
              >
                🔖
              </button>
            </div>

            {/* Like count */}
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              {likeState.likesCount} like{likeState.likesCount !== 1 ? 's' : ''}
            </div>

            {/* Comment input */}
            <form onSubmit={handleSubmitComment} style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginTop: 8
            }}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  padding: '8px 0',
                  background: '#f8f9fa',
                  borderRadius: 6
                }}
                disabled={addingComment}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || addingComment}
                style={{
                  background: 'none',
                  border: 'none',
                  color: commentText.trim() ? '#007AFF' : '#c1c1c1',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: commentText.trim() && !addingComment ? 'pointer' : 'default'
                }}
              >
                {addingComment ? 'Posting...' : 'Post'}
              </button>
            </form>
          </div>
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
  const [userPosts, setUserPosts] = useState([]);
  const [showPostMenu, setShowPostMenu] = useState(null); // post uuid or null
  const [isDeleting, setIsDeleting] = useState(false);
  const [editPostData, setEditPostData] = useState(null); // for edit modal
  const [deleteModal, setDeleteModal] = useState({ open: false, postUuid: null });
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ content: '', location: '', tags: '', imageUrl: '' });
  const [userLocations, setUserLocations] = useState([]); // Store user locations from junction table
  const [selectedPostModal, setSelectedPostModal] = useState(null); // for Instagram-like post modal
  
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
      // Optimistic update, but only if the current state matches the backend
      let actualLiked = likeState.liked;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const backendLiked = await likeService.hasUserLikedPost(postUuid, user.id);
        if (backendLiked !== actualLiked) {
          setLikeState(prev => ({ ...prev, liked: backendLiked }));
          actualLiked = backendLiked;
        }
      } catch (e) { /* ignore */ }
      // Now toggle
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
    }, [postUuid, initialLikeCount, likeState.liked]);

    return [likeState, handleLike];
  };

  // Empty user recommendations array since user has no recommendations
  const userRecommend = [];

  // Empty user listings array since user has no listings
  const userListings = [];



  const PostCard = React.memo(({ post }) => {
    const postUuid = post.uuid;
    const isMenuOpen = showPostMenu === post.uuid;
    const [likeState, handleLike] = useLikeState(postUuid, post.like_count || 0);
    
    const handleMenuClick = React.useCallback((e) => {
      e.stopPropagation();
      setShowPostMenu(isMenuOpen ? null : post.uuid);
    }, [isMenuOpen, post.uuid]);
    
    const handleLikeClick = React.useCallback((e) => {
      e.stopPropagation();
      handleLike();
    }, [handleLike]);

    const handlePostClick = React.useCallback(() => {
      setSelectedPostModal(post);
    }, [post]);
    
    return (
      <div className="profile-post-card" onClick={handlePostClick}>
        <div className="post-header">
          <div className="post-author">
            <div className="author-avatar">
              {userProfile.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="avatar"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  onError={e => (e.target.style.display = 'none')}
                />
              ) : (
                '👤'
              )}
            </div>
            <div className="author-info">
              <div className="author-name">{userProfile.display_name || userProfile.username || 'User'}</div>
              <div className="post-timestamp">{post.timestamp}</div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <button className="post-menu" onClick={handleMenuClick}>
              ⋯
            </button>
            {isMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'white',
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                zIndex: 10,
                minWidth: '160px',
                padding: '4px 0'
              }}>
                <button
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '10px 16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '15px',
                    color: '#1d1d1f',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(post);
                    setShowPostMenu(null);
                  }}
                >
                  ✏️ Edit Post
                </button>
                <button
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '10px 16px',
                    textAlign: 'left',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    color: '#ff3b30',
                    opacity: isDeleting ? 0.6 : 1,
                    whiteSpace: 'nowrap'
                  }}
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteModal({ open: true, postUuid: post.uuid });
                    setShowPostMenu(null);
                  }}
                >
                  🗑️ Delete Post
                </button>
              </div>
            )}
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
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>
        
        <div className="post-actions">
          <button className={`action-btn${likeState.liked ? ' active' : ''}`} onClick={handleLikeClick}>
            <span>❤️</span>
            <span className="action-count">{likeState.likesCount}</span>
          </button>
          <button className="action-btn">
            <span>💬</span>
            <span className="action-count">{post.comments || 0}</span>
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
  });

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
          <span className="author-avatar small">{userProfile.avatar_url ? '👤' : '👤'}</span>
          <span>{userProfile.display_name || userProfile.username || 'User'}</span>
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
          updated_at: new Date().toISOString()
        })
        .eq('uuid', user.id);

      if (error) throw error;

      // Handle locations - delete existing and insert new ones
      // Delete existing locations first
      const { error: deleteError } = await supabase
        .from('user_locations')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Insert new locations if any
      if (editFormData.locations && editFormData.locations.length > 0) {
        const locationRecords = editFormData.locations.map(location => ({
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
        avatar_url: editFormData.avatar_url
      }));

      // Update local locations state
      setUserLocations(editFormData.locations.map(location => ({ location_name: location })));

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
          Recommendations (0)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          Listings (0)
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'posts' && (
          <div className="posts-grid" style={{ width: '100%' }}>
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <PostCard key={post.uuid} post={{
                  ...post,
                  content: post.post_body_text,
                  image: post.image_url,
                  tags: post.tags || [],
                  timestamp: post.created_at ? new Date(post.created_at).toLocaleString() : '',
                  location: post.location || '',
                  likes: post.like_count || 0,
                  comments: post.comment_count || 0,
                  distance: '', // You can add logic for distance if needed
                }} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666', width: '100%' }}>
                No posts yet. Start sharing your experiences!
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'recommend' && (
          <div className="recommend-grid" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {userRecommend.length > 0 ? (
              userRecommend.map(rec => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666', width: '100%' }}>
                No recommend yet. Start recommending places and events!
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
    </div>
  );
};

export default Profile; 