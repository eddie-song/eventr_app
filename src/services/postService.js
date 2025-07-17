import { supabase } from '../lib/supabaseClient';

export const postService = {
  // Get posts with tags for a user
  async getUserPosts(userId) {
    try {
      // Get posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get tags for all posts
      const postIds = posts.map(post => post.uuid);
      const { data: tags, error: tagsError } = await supabase
        .from('post_tags')
        .select('post_id, tag')
        .in('post_id', postIds);

      if (tagsError) throw tagsError;

      // Group tags by post_id
      const tagsByPost = {};
      tags.forEach(tag => {
        if (!tagsByPost[tag.post_id]) {
          tagsByPost[tag.post_id] = [];
        }
        tagsByPost[tag.post_id].push(tag.tag);
      });

      // Combine posts with their tags
      const postsWithTags = posts.map(post => ({
        ...post,
        tags: tagsByPost[post.uuid] || []
      }));

      return postsWithTags;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  // Get a single post with tags
  async getPost(postId) {
    try {
      // Get post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('uuid', postId)
        .single();

      if (postError) throw postError;

      // Get tags
      const { data: tags, error: tagsError } = await supabase
        .from('post_tags')
        .select('tag')
        .eq('post_id', postId);

      if (tagsError) throw tagsError;

      return {
        ...post,
        tags: tags.map(tag => tag.tag)
      };
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },

  // Create a new post with tags
  async createPost(postData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');
      
      const userId = user.id;
      const postUuid = crypto.randomUUID();
      const now = new Date().toISOString();
      const tagsArray = postData.tags ? postData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

      // Insert post
      const { error: postError } = await supabase
        .from('posts')
        .insert([{
          uuid: postUuid,
          created_at: now,
          user_id: userId,
          image_url: postData.imageUrl || null,
          post_body_text: postData.content,
          location: postData.location || ''
        }]);

      if (postError) throw postError;

      // Insert tags
      if (tagsArray.length > 0) {
        const tagRecords = tagsArray.map(tag => ({
          post_id: postUuid,
          tag: tag,
          created_at: now
        }));

        const { error: tagsError } = await supabase
          .from('post_tags')
          .insert(tagRecords);

        if (tagsError) throw tagsError;
      }

      return { postId: postUuid };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Update a post with tags
  async updatePost(postId, postData) {
    try {
      const tagsArray = postData.tags ? postData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

      // Update post
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          post_body_text: postData.content,
          location: postData.location,
          image_url: postData.imageUrl
        })
        .eq('uuid', postId);

      if (updateError) throw updateError;

      // Delete existing tags
      const { error: deleteTagsError } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', postId);

      if (deleteTagsError) throw deleteTagsError;

      // Insert new tags
      if (tagsArray.length > 0) {
        const tagRecords = tagsArray.map(tag => ({
          post_id: postId,
          tag: tag,
          created_at: new Date().toISOString()
        }));

        const { error: insertTagsError } = await supabase
          .from('post_tags')
          .insert(tagRecords);

        if (insertTagsError) throw insertTagsError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete a post and its related data
  async deletePost(postId) {
    try {
      // Delete tags first
      const { error: tagsError } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', postId);

      if (tagsError) throw tagsError;

      // Delete likes
      const { error: likesError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId);

      if (likesError) throw likesError;

      // Delete the post
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('uuid', postId);

      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
}; 