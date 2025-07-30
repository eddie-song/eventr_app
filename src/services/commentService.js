import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const commentService = {
  // Get all comments for a post with user profile data (flat, newest first)
  async getCommentsForPost(postId) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          uuid,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Add a comment to a post and increment comment_count
  async addComment({ postId, userId, commentText, parentCommentId = null }) {
    // Insert comment with generated uuid
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          uuid: uuidv4(),
          post_id: postId,
          user_id: userId,
          comment_text: commentText,
          parent_comment_id: parentCommentId,
          // created_at removed, DB default will be used
        },
      ])
      .select()
      .single();
    if (error) throw error;
    // Increment comment_count in posts table
    const { error: countError } = await supabase.rpc('increment_post_comment_count', { postid: postId });
    if (countError) {
      // fallback: fetch current count and update manually
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('comment_count')
        .eq('uuid', postId)
        .single();
      if (!fetchError && post) {
        await supabase
          .from('posts')
          .update({ comment_count: (post.comment_count || 0) + 1 })
          .eq('uuid', postId);
      }
    }
    return data;
  },

  // (Optional) Delete a comment
  async deleteComment(commentId, userId) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('uuid', commentId)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },
}; 