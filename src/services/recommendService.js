import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const recommendService = {
  // Get recommendations for a user
  async getUserRecommendations(userId) {
    try {
      const { data: recs, error: recsError } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (recsError) throw recsError;
      const recIds = recs.map(rec => rec.uuid);
      if (recIds.length === 0) return recs;
      const { data: tags, error: tagsError } = await supabase
        .from('recommendation_tags')
        .select('recommendation_id, tag')
        .in('recommendation_id', recIds);
      if (tagsError) throw tagsError;
      const tagsByRec = {};
      tags.forEach(tag => {
        if (!tagsByRec[tag.recommendation_id]) tagsByRec[tag.recommendation_id] = [];
        tagsByRec[tag.recommendation_id].push(tag.tag);
      });
      return recs.map(rec => ({ ...rec, tags: tagsByRec[rec.uuid] || [] }));
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
      throw error;
    }
  },

  // Get a single recommendation
  async getRecommendation(recId) {
    try {
      const { data: rec, error: recError } = await supabase
        .from('recommendations')
        .select('*')
        .eq('uuid', recId)
        .single();
      if (recError) throw recError;
      const { data: tags, error: tagsError } = await supabase
        .from('recommendation_tags')
        .select('tag')
        .eq('recommendation_id', recId);
      if (tagsError) throw tagsError;
      return { ...rec, tags: tags.map(tag => tag.tag) };
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      throw error;
    }
  },

  // Create a new recommendation
  async createRecommendation(recData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');
      const userId = user.id;
      const recUuid = crypto.randomUUID?.() ?? uuidv4();
      const now = new Date().toISOString();
      const tagsArray = recData.tags ? recData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      const { error: recError } = await supabase
        .from('recommendations')
        .insert([{
          uuid: recUuid,
          created_at: now,
          user_id: userId,
          image_url: recData.imageUrl || null,
          title: recData.title,
          description: recData.description,
          location: recData.location || '',
          type: recData.type || 'place',
          rating: recData.rating ? parseFloat(recData.rating) : null
        }]);
      if (recError) throw recError;
      if (tagsArray.length > 0) {
        const tagRecords = tagsArray.map(tag => ({
          recommendation_id: recUuid,
          tag: tag,
          created_at: now
        }));
        const { error: tagsError } = await supabase
          .from('recommendation_tags')
          .insert(tagRecords);
        if (tagsError) throw tagsError;
      }
      return { recommendationId: recUuid };
    } catch (error) {
      console.error('Error creating recommendation:', error);
      throw error;
    }
  },

  // Update a recommendation
  async updateRecommendation(recId, recData) {
    try {
      const tagsArray = recData.tags ? recData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      const { error: updateError } = await supabase
        .from('recommendations')
        .update({
          title: recData.title,
          description: recData.description,
          location: recData.location,
          image_url: recData.imageUrl,
          type: recData.type,
          rating: recData.rating ? parseFloat(recData.rating) : null
        })
        .eq('uuid', recId);
      if (updateError) throw updateError;
      const { error: deleteTagsError } = await supabase
        .from('recommendation_tags')
        .delete()
        .eq('recommendation_id', recId);
      if (deleteTagsError) throw deleteTagsError;
      if (tagsArray.length > 0) {
        const tagRecords = tagsArray.map(tag => ({
          recommendation_id: recId,
          tag: tag,
          created_at: new Date().toISOString()
        }));
        const { error: insertTagsError } = await supabase
          .from('recommendation_tags')
          .insert(tagRecords);
        if (insertTagsError) throw insertTagsError;
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating recommendation:', error);
      throw error;
    }
  },

  // Delete a recommendation
  async deleteRecommendation(recId) {
    try {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('uuid', recId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      throw error;
    }
  }
}; 