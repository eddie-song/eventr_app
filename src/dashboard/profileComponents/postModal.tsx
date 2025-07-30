import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { likeService } from '../../services/likeService';
import { commentService } from '../../services/commentService';

interface Post {
  uuid: string;
  post_body_text: string; // matches schema column name
  image_url?: string; // matches schema column name
  location?: string;
  tags: string[];
  created_at: string; // matches schema column name
  like_count?: number | null; // can be null in schema
  comment_count?: number | null; // can be null in schema
  user_id: string; // matches schema
}

interface UserProfile {
  uuid: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

interface Comment {
  uuid: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  post_id: string;
  parent_comment_id: string | null;
  like_count: number | null; // can be null in schema
  reply_count: number | null; // can be null in schema
  profiles?: {
    uuid: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface PostModalProps {
  post: Post;
  onClose: () => void;
  userProfile: UserProfile;
  onCommentAdded?: (postUuid: string) => void;
}

const PostModal: React.FC<PostModalProps> = ({ post, onClose, userProfile, onCommentAdded }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);
  
  const [likeState, setLikeState] = useState({
    liked: false,
    likesCount: post.like_count || 0
  });
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(true); // Show comments by default
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [addingComment, setAddingComment] = useState(false);

  // On mount, check if the user has liked the post
  useEffect(() => {
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
  useEffect(() => {
    if (!showComments) return;
    
    let isMounted = true;
    
    setCommentsLoading(true);
    setCommentsError(null);
    
    commentService.getCommentsForPost(post.uuid)
      .then(comments => {
        if (isMounted) {
          setComments(comments);
        }
      })
      .catch(err => {
        if (isMounted) {
          setCommentsError('Failed to load comments');
        }
      })
      .finally(() => {
        if (isMounted) {
          setCommentsLoading(false);
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, [showComments, post.uuid]);

  const handleLike = useCallback(async () => {
    // Optimistic update
    setLikeState(prev => {
      const liked = !prev.liked;
      const currentCount = prev.likesCount || 0;
      const likesCount = liked ? currentCount + 1 : Math.max(0, currentCount - 1);
      return { liked, likesCount };
    });

    try {
      const result = await likeService.likePost(post.uuid);
      // Update with actual result from server
      setLikeState({ 
        liked: result.liked, 
        likesCount: result.likesCount || 0 
      });
    } catch (e) {
      console.error('Like error:', e);
      // Revert on error
      setLikeState(prev => ({
        liked: !prev.liked,
        likesCount: post.like_count || 0
      }));
    }
  }, [post.uuid, post.like_count]);

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  // Handle focus trapping
  React.useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    
    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;
    
    // Focus the modal
    modal.focus();
    
    // Get all focusable elements within the modal
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab: move to previous element
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move to next element
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, []);

  // Prevent background scrolling and restore on unmount
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Add comment to server and get the created comment with proper UUID
      const createdComment = await commentService.addComment({
        postId: post.uuid,
        userId: user.id,
        commentText,
      });
      
      // Update comments state with the confirmed comment from server
      setComments(prev => [createdComment, ...prev]);
      setCommentText('');
      
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
    <div 
      className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
        aria-describedby="post-modal-description"
        tabIndex={-1}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex overflow-hidden shadow-2xl"
      >
                 {/* Left side - Image */}
         <div className="flex-1 bg-black flex items-center justify-center min-h-[400px]">
           {post.image_url ? (
             <img
               src={post.image_url}
               alt="Post"
               className="max-w-full max-h-full object-contain"
               onError={(e) => {
                 (e.target as HTMLImageElement).style.display = 'none';
               }}
             />
           ) : (
             <div className="text-gray-500 text-lg text-center">
               No image
             </div>
           )}
         </div>

        {/* Right side - Content */}
        <div className="flex-1 flex flex-col max-w-md min-w-[300px]">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-base">
                             {userProfile?.avatar_url ? (
                 <img
                   src={userProfile.avatar_url}
                   alt={`${userProfile?.display_name || userProfile?.username || 'User'}'s profile picture`}
                   className="w-full h-full rounded-full object-cover"
                   onError={(e) => {
                     (e.target as HTMLImageElement).style.display = 'none';
                   }}
                 />
               ) : (
                 <span role="img" aria-label={`${userProfile?.display_name || userProfile?.username || 'User'}'s profile avatar`}>
                   👤
                 </span>
               )}
            </div>
            <div className="flex-1">
              <h2 id="post-modal-title" className="font-semibold text-sm">
                {userProfile?.display_name || userProfile?.username || 'User'}
              </h2>
              <div className="text-xs text-gray-500">
                {post.location || 'Unknown location'}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="bg-transparent border-none text-xl cursor-pointer p-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
                         {/* Post text */}
             <div className="mb-4">
               <p className="text-sm leading-relaxed text-gray-900 mb-3">
                 {post.post_body_text}
               </p>

               {/* Tags */}
               {post.tags && post.tags.length > 0 && (
                 <div className="flex flex-wrap gap-1.5 mb-3">
                   {post.tags.map((tag, index) => (
                     <span key={index} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium">
                       {tag}
                     </span>
                   ))}
                 </div>
               )}

               {/* Location */}
               {post.location && (
                 <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                   <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16">
                     <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
                   </svg>
                   <span>{post.location}</span>
                 </div>
               )}

               {/* Timestamp */}
               <div className="text-xs text-gray-500 mb-4">
                 {new Date(post.created_at).toLocaleString()}
               </div>
             </div>

            {/* Comments section */}
            <div className="border-t border-gray-200 pt-4 min-h-[120px]">
              <button
                onClick={() => setShowComments(!showComments)}
                aria-expanded={showComments}
                aria-controls="comments-list"
                className="bg-transparent border-none text-gray-500 text-sm cursor-pointer mb-3 hover:text-gray-700 transition-colors"
              >
                {showComments ? 'Hide comments' : 'View comments'}
              </button>

              {showComments && (
                <div className="mb-4 max-h-[200px] overflow-y-auto">
                  {commentsLoading && <div className="text-gray-500 text-center py-3">Loading comments...</div>}
                  {commentsError && <div className="text-red-500 text-center py-3">{commentsError}</div>}
                  {!commentsLoading && !commentsError && comments.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-5">No comments yet. Be the first to comment!</div>
                  )}
                  {!commentsLoading && !commentsError && comments.length > 0 && (
                    <ul className="list-none p-0 m-0">
                      {comments.map(comment => (
                        <li key={comment.uuid} className="mb-3 border-b border-gray-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs">
                              {comment.user_id === userProfile?.uuid 
                                ? (userProfile.display_name || userProfile.username || 'You')
                                : (comment.profiles?.display_name || comment.profiles?.username || 'Anonymous')
                              }
                            </span>
                            <span className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleString()}</span>
                          </div>
                          <div className="text-sm mt-1">{comment.comment_text}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200">
            {/* Action buttons */}
            <div className="flex gap-4 mb-3">
              <button
                onClick={handleLike}
                aria-label={likeState.liked ? 'Unlike post' : 'Like post'}
                aria-pressed={likeState.liked}
                className="bg-transparent border-none text-2xl cursor-pointer transition-colors duration-200 hover:scale-110"
                style={{ color: likeState.liked ? '#ff3b30' : '#86868b' }}
              >
                {likeState.liked ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                )}
              </button>
              <button
                onClick={() => setShowComments(true)}
                aria-label="Show comments"
                className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.891 1 4.127L3 21l4.873-1c1.236.64 2.64 1 4.127 1"></path>
                </svg>
              </button>
              <button 
                aria-label="Share post"
                className="bg-transparent border-none text-2xl cursor-pointer text-green-500 hover:text-green-700 transition-colors duration-200 hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
              </button>
              <button 
                aria-label="Save post"
                className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                  <path fill="currentColor" d="m12 18l-4.2 1.8q-1 .425-1.9-.162T5 17.975V5q0-.825.588-1.412T7 3h10q.825 0 1.413.588T19 5v12.975q0 1.075-.9 1.663t-1.9.162zm0-2.2l5 2.15V5H7v12.95zM12 5H7h10z"></path>
                </svg>
              </button>
            </div>

                         {/* Like count */}
             <div className="text-sm font-semibold mb-2">
               {likeState.likesCount || 0} like{(likeState.likesCount || 0) !== 1 ? 's' : ''}
             </div>

            {/* Comment input */}
            <form onSubmit={handleSubmitComment} className="flex gap-2 items-center mt-2">
              <label htmlFor="comment-input" className="sr-only">
                Add a comment
              </label>
              <input
                id="comment-input"
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                aria-label="Add a comment"
                aria-describedby="comment-submit-button"
                className="flex-1 border-none outline-none text-sm py-2 bg-gray-50 rounded-md px-3"
                disabled={addingComment}
              />
              <button
                id="comment-submit-button"
                type="submit"
                disabled={!commentText.trim() || addingComment}
                aria-label={addingComment ? 'Posting comment...' : 'Post comment'}
                className="bg-transparent border-none text-sm font-semibold cursor-pointer transition-colors disabled:cursor-default"
                style={{ 
                  color: commentText.trim() ? '#007AFF' : '#c1c1c1'
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

export default PostModal;
