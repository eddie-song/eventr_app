import { supabase } from '../lib/supabaseClient.js';

const recommendationService = {
  // Get all recommendations with author information
  async getAllRecommendations() {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
      }

      // Transform the data to match our component interface
      const transformedData = data.map(rec => ({
        uuid: rec.uuid,
        created_at: rec.created_at,
        user_id: rec.user_id,
        image_url: rec.image_url,
        title: rec.title,
        description: rec.description,
        location: rec.location,
        type: rec.type || 'place',
        rating: rec.rating,
        author_name: rec.profiles?.display_name || rec.profiles?.username || 'Anonymous',
        author_username: rec.profiles?.username || 'user',
        author_avatar: rec.profiles?.avatar_url || null
      }));

      return transformedData;
    } catch (error) {
      console.error('Error in getAllRecommendations:', error);
      throw error;
    }
  },

  // Get recommendations by type
  async getRecommendationsByType(type) {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recommendations by type:', error);
        throw error;
      }

      // Transform the data
      const transformedData = data.map(rec => ({
        uuid: rec.uuid,
        created_at: rec.created_at,
        user_id: rec.user_id,
        image_url: rec.image_url,
        title: rec.title,
        description: rec.description,
        location: rec.location,
        type: rec.type || 'place',
        rating: rec.rating,
        author_name: rec.profiles?.display_name || rec.profiles?.username || 'Anonymous',
        author_username: rec.profiles?.username || 'user',
        author_avatar: rec.profiles?.avatar_url || null
      }));

      return transformedData;
    } catch (error) {
      console.error('Error in getRecommendationsByType:', error);
      throw error;
    }
  },

  // Search recommendations by title, description, or location
  async searchRecommendations(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching recommendations:', error);
        throw error;
      }

      // Transform the data
      const transformedData = data.map(rec => ({
        uuid: rec.uuid,
        created_at: rec.created_at,
        user_id: rec.user_id,
        image_url: rec.image_url,
        title: rec.title,
        description: rec.description,
        location: rec.location,
        type: rec.type || 'place',
        rating: rec.rating,
        author_name: rec.profiles?.display_name || rec.profiles?.username || 'Anonymous',
        author_username: rec.profiles?.username || 'user',
        author_avatar: rec.profiles?.avatar_url || null
      }));

      return transformedData;
    } catch (error) {
      console.error('Error in searchRecommendations:', error);
      throw error;
    }
  },

  // Get recommendations by user
  async getRecommendationsByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user recommendations:', error);
        throw error;
      }

      // Transform the data
      const transformedData = data.map(rec => ({
        uuid: rec.uuid,
        created_at: rec.created_at,
        user_id: rec.user_id,
        image_url: rec.image_url,
        title: rec.title,
        description: rec.description,
        location: rec.location,
        type: rec.type || 'place',
        rating: rec.rating,
        author_name: rec.profiles?.display_name || rec.profiles?.username || 'Anonymous',
        author_username: rec.profiles?.username || 'user',
        author_avatar: rec.profiles?.avatar_url || null
      }));

      return transformedData;
    } catch (error) {
      console.error('Error in getRecommendationsByUser:', error);
      throw error;
    }
  },

  // Create a new recommendation
  async createRecommendation(recommendationData) {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .insert([recommendationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating recommendation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createRecommendation:', error);
      throw error;
    }
  },

  // Update a recommendation
  async updateRecommendation(uuid, updates) {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .update(updates)
        .eq('uuid', uuid)
        .select()
        .single();

      if (error) {
        console.error('Error updating recommendation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateRecommendation:', error);
      throw error;
    }
  },

  // Delete a recommendation
  async deleteRecommendation(uuid) {
    try {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('uuid', uuid);

      if (error) {
        console.error('Error deleting recommendation:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteRecommendation:', error);
      throw error;
    }
  }
};

export default recommendationService; 