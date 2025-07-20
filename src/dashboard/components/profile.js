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
import EventImage from '../../components/EventImage';
import { formatDateInTimezone, getUserTimezone, convertUTCToDatetimeLocal } from '../../utils/timezoneUtils';

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

const EventModal = ({ event, onClose, userProfile }) => {
  const [userTimezone, setUserTimezone] = useState('UTC');

  // Get user's timezone on component mount
  useEffect(() => {
    const timezone = getUserTimezone();
    setUserTimezone(timezone);
  }, []);

  if (!event) return null;

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-container" onClick={e => e.stopPropagation()}>
        {/* Header with close button */}
        <div className="event-modal-header">
          <button className="event-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Hero section with event image and gradient */}
        <div className="event-modal-hero">
          <div className="event-modal-image">
                    {event.image_url ? (
          <EventImage 
            imageUrl={event.image_url}
            alt={event.event}
            className="event-modal-hero-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
            <div className="event-modal-placeholder" style={{ display: event.image_url ? 'none' : 'flex' }}>
              <span className="event-modal-icon">🎉</span>
            </div>
            <div className="event-modal-gradient"></div>
          </div>
          
          {/* Event title overlay */}
          <div className="event-modal-title-section">
            <h1 className="event-modal-title">{event.event}</h1>
            {event.location && (
              <div className="event-modal-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{event.location}</span>
              </div>
            )}
            {event.scheduled_time && (
              <div className="event-modal-time">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{formatDateInTimezone(event.scheduled_time, userTimezone, { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}</span>
              </div>
            )}
            {event.price !== null && (
              <div className="event-modal-price">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{event.price === 0 || isNaN(event.price) ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content section */}
        <div className="event-modal-content">
          {/* Author info */}
          <div className="event-modal-author">
            <div className="event-modal-avatar">
              <ProfileAvatar avatarPath={userProfile?.avatar_url} />
            </div>
            <div className="event-modal-author-info">
              <div className="event-modal-author-name">
                {userProfile?.display_name || userProfile?.username || 'User'}
              </div>
              <div className="event-modal-date">
                {event.created_at ? new Date(event.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Recently'}
              </div>
            </div>
          </div>

          {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
              <div className="event-modal-tags">
                {event.tags.map((tag, index) => (
                  <span key={index} className="event-modal-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

          {/* Stats grid */}
          <div className="event-modal-stats">
            <div className="event-modal-stat">
              <div className="event-modal-stat-icon">👥</div>
              <div className="event-modal-stat-content">
                <div className="event-modal-stat-number">{event.attendeeCount || 0}</div>
                <div className="event-modal-stat-label">Attendees</div>
              </div>
            </div>
            <div className="event-modal-stat">
              <div className="event-modal-stat-icon">⭐</div>
              <div className="event-modal-stat-content">
                <div className="event-modal-stat-number">{event.rating || 0.0}</div>
                <div className="event-modal-stat-label">Rating</div>
              </div>
            </div>
            <div className="event-modal-stat">
              <div className="event-modal-stat-icon">💬</div>
              <div className="event-modal-stat-content">
                <div className="event-modal-stat-number">{event.review_count || 0}</div>
                <div className="event-modal-stat-label">Reviews</div>
              </div>
            </div>
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
        setSignedUrl(null);
        return;
      }
      if (avatarPath.startsWith('http')) {
        setSignedUrl(avatarPath);
        return;
      }
      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(avatarPath, 3600);
      if (isMounted) {
        if (error) {
          setSignedUrl(null);
        } else {
          setSignedUrl(data.signedUrl);
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

  // User events are now loaded from the database
  // const userListings = []; // Removed since we're using userEvents now



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

        // Get user events
        try {
          const userEventsData = await eventService.getUserEvents();
          setUserEvents(userEventsData || []);
        } catch (error) {
          console.error('Error loading user events:', error);
          setUserEvents([]);
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
        avatar_url: editFormData.avatar_url,
        timezone: editFormData.timezone || 'UTC'
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


  const EventCard = ({ event }) => {
    const [userTimezone, setUserTimezone] = useState('UTC');

    // Get user's timezone on component mount
    useEffect(() => {
      const timezone = getUserTimezone();
      setUserTimezone(timezone);
    }, []);

    const formatDate = (dateString) => {
      if (!dateString) return null;
      return formatDateInTimezone(dateString, userTimezone, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    };

    const formatTime = (dateString) => {
      if (!dateString) return null;
      return formatDateInTimezone(dateString, userTimezone, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    return (
      <div 
        className="event-card" 
        onClick={() => {
          setSelectedEvent(event);
          setShowEventModal(true);
        }}
        style={{ cursor: 'pointer' }}
      >
        <div className="event-image-container">
          {event.image_url ? (
            <EventImage 
              imageUrl={event.image_url}
              alt={event.event}
              className="event-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="event-placeholder" style={{ display: event.image_url ? 'none' : 'flex' }}>
            <span className="event-icon">🎉</span>
          </div>
          
          {/* Rating badge */}
          <div className="event-rating">
            <span className="rating-star">⭐</span>
            <span className="rating-number">{event.rating || 0.0}</span>
            <span className="rating-count">({event.review_count || 0})</span>
          </div>
          
          {/* Date badge */}
          <div className="event-date-badge">
            <div className="event-date">
              {event.scheduled_time ? formatDate(event.scheduled_time) : formatDate(event.created_at)}
            </div>
            <div className="event-time">
              {event.scheduled_time ? formatTime(event.scheduled_time) : 'Created'}
            </div>
          </div>
          
          {/* Price badge */}
          {event.price !== null && (
            <div className="event-price">
              <span className="price-text">
                {event.price === 0 || isNaN(event.price) ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`}
              </span>
            </div>
          )}
          

        </div>
        
        <div className="event-content">
          <div className="event-header">
            <h3 className="event-name">{event.event}</h3>
            <div className="event-header-details">
              <span className="event-type-badge">
                {event.event_type ? event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1) : 'General'}
              </span>
            </div>
          </div>
          
          {event.location && (
            <div className="event-location">
              <span className="location-icon">📍</span>
              <span className="location-name">{event.location}</span>
            </div>
          )}
          
          <p className="event-description">
            {event.description || 'No description available for this event.'}
          </p>
          
          <div className="event-footer">
            <div className="event-tags">
              {event.tags && event.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="event-tag">{tag}</span>
              ))}
              {event.tags && event.tags.length > 3 && (
                <span className="event-tag-more">+{event.tags.length - 3}</span>
              )}
            </div>
            {/* Capacity badge */}
            {event.capacity && (
              <div className="event-capacity">
                <span className="capacity-text">
                  <span className="attendees-icon">👥</span>
                  {event.attendeeCount || 0}/{event.capacity}
                </span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="event-actions" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button 
              className="edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                openEditEventModal(event);
              }}
              style={{
                background: '#007AFF',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Edit
            </button>
            <button 
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteEventModal({ open: true, eventUuid: event.uuid });
              }}
              style={{
                background: '#ff3b30',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
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
          Recommendations (0)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          Listings ({userEvents.length})
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
          <div className="listings-grid">
            {userEvents.length > 0 ? (
              userEvents.map(event => (
                <EventCard key={event.uuid} event={event} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666', gridColumn: '1 / -1' }}>
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