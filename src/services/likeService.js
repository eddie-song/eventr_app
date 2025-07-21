import { supabase } from '../lib/supabaseClient';

export const likeService = {
  // Like a post
  async likePost(postUuid) {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');
      const userId = user.id;

      // Check if user already liked the post
      const { data: existingLike, error: checkError } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postUuid)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingLike) {
        // Unlike the post - remove from post_likes table
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postUuid)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        // Get updated like count and update post
        const newLikeCount = await this.updateLikeCount(postUuid);

        return { liked: false, likesCount: newLikeCount };
      } else {
        // Like the post - add to post_likes table
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert([{
            post_id: postUuid,
            user_id: userId,
          }]);

        if (insertError) throw insertError;

        // Get updated like count and update post
        const newLikeCount = await this.updateLikeCount(postUuid);

        return { liked: true, likesCount: newLikeCount };
      }
    } catch (error) {
      console.error('Like post error:', error);
      throw error;
    }
  },

  // Helper function to update like count
  async updateLikeCount(postUuid) {
    const { count: newLikeCount, error: countError } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postUuid);
    
    if (countError) throw countError;

    // Update post's like_count if the column exists
    const { error: updateError } = await supabase
      .from('posts')
      .update({ like_count: newLikeCount })
      .eq('uuid', postUuid);
    
    if (updateError) {
      console.warn('Could not update like_count column:', updateError);
    }

    return newLikeCount;
  },

  // Check if current user has liked a post
  async checkIfLiked(postUuid) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return false;
      const userId = user.id;

      const { data: likeRecord, error: checkError } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postUuid)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        return false; // No like record found
      }
      if (checkError) throw checkError;

      return !!likeRecord;
    } catch (error) {
      console.error('Check if liked error:', error);
      return false;
    }
  },

  // Get like count for a post
  async getLikeCount(postUuid) {
    try {
      const { count, error: countError } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postUuid);

      if (countError) return 0;

      return count || 0;
    } catch (error) {
      console.error('Get like count error:', error);
      return 0;
    }
  },

  async hasUserLikedPost(postId, userId) {
    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116: No rows found
    return !!data;
  },
}; 