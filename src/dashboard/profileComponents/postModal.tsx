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
}

interface PostModalProps {
  post: Post;
  onClose: () => void;
  userProfile: UserProfile;
  onCommentAdded?: (postUuid: string) => void;
}

const PostModal: React.FC<PostModalProps> = ({ post, onClose, userProfile, onCommentAdded }) => {
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
    setCommentsLoading(true);
    setCommentsError(null);
    commentService.getCommentsForPost(post.uuid)
      .then(setComments)
      .catch(err => setCommentsError('Failed to load comments'))
      .finally(() => setCommentsLoading(false));
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      // Optimistically add comment
      const newComment: Comment = {
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
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-5">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex overflow-hidden shadow-2xl">
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
                   alt="avatar"
                   className="w-full h-full rounded-full object-cover"
                   onError={(e) => {
                     (e.target as HTMLImageElement).style.display = 'none';
                   }}
                 />
               ) : (
                 '👤'
               )}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">
                {userProfile?.display_name || userProfile?.username || 'User'}
              </div>
              <div className="text-xs text-gray-500">
                {post.location || 'Unknown location'}
              </div>
            </div>
            <button
              onClick={onClose}
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
                   <span>📍</span>
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
                            <span className="font-semibold text-xs">{comment.user_id === userProfile?.uuid ? (userProfile.display_name || userProfile.username || 'You') : 'User'}</span>
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
                className="bg-transparent border-none text-2xl cursor-pointer transition-colors duration-200 hover:scale-110"
                style={{ color: likeState.liked ? '#ff3b30' : '#86868b' }}
              >
                {likeState.liked ? '❤️' : '🤍'}
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:scale-110"
              >
                💬
              </button>
              <button className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:scale-110">
                📤
              </button>
              <button className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:scale-110">
                🔖
              </button>
            </div>

                         {/* Like count */}
             <div className="text-sm font-semibold mb-2">
               {likeState.likesCount || 0} like{(likeState.likesCount || 0) !== 1 ? 's' : ''}
             </div>

            {/* Comment input */}
            <form onSubmit={handleSubmitComment} className="flex gap-2 items-center mt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border-none outline-none text-sm py-2 bg-gray-50 rounded-md px-3"
                disabled={addingComment}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || addingComment}
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
