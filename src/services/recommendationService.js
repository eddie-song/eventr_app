import { supabase } from '../lib/supabaseClient.js';

const recommendationService = {
  // Helper function to transform recommendation data
  _transformRecommendationData(data) {
    return data.map(rec => ({
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
  },

  // Get all recommendations with author information (with pagination)
  async getAllRecommendations(page = 1, pageSize = 20) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

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
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
      }

      return this._transformRecommendationData(data);
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

      return this._transformRecommendationData(data);
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

      return this._transformRecommendationData(data);
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

      return this._transformRecommendationData(data);
    } catch (error) {
      console.error('Error in getRecommendationsByUser:', error);
      throw error;
    }
  },

  // Create a new recommendation
  async createRecommendation(recommendationData) {
    try {
      // Input validation
      if (!recommendationData || typeof recommendationData !== 'object') {
        throw new Error('Recommendation data must be a valid object');
      }

      // Validate required fields
      const requiredFields = ['title', 'description', 'type'];
      const missingFields = requiredFields.filter(field => {
        const value = recommendationData[field];
        return value === undefined || value === null || value === '';
      });

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate field types and formats
      if (typeof recommendationData.title !== 'string' || recommendationData.title.trim().length === 0) {
        throw new Error('Title must be a non-empty string');
      }

      if (typeof recommendationData.description !== 'string' || recommendationData.description.trim().length === 0) {
        throw new Error('Description must be a non-empty string');
      }

      if (typeof recommendationData.type !== 'string' || recommendationData.type.trim().length === 0) {
        throw new Error('Type must be a non-empty string');
      }

      // Validate optional fields
      if (recommendationData.location !== undefined && 
          (typeof recommendationData.location !== 'string' || recommendationData.location.trim().length === 0)) {
        throw new Error('Location must be a non-empty string if provided');
      }

      if (recommendationData.image_url !== undefined && 
          (typeof recommendationData.image_url !== 'string' || recommendationData.image_url.trim().length === 0)) {
        throw new Error('Image URL must be a non-empty string if provided');
      }

      if (recommendationData.rating !== undefined) {
        const rating = parseFloat(recommendationData.rating);
        if (isNaN(rating) || rating < 0 || rating > 5) {
          throw new Error('Rating must be a number between 0 and 5');
        }
      }

      // Validate string length limits
      if (recommendationData.title.length > 255) {
        throw new Error('Title must be 255 characters or less');
      }

      if (recommendationData.description.length > 1000) {
        throw new Error('Description must be 1000 characters or less');
      }

      if (recommendationData.location && recommendationData.location.length > 255) {
        throw new Error('Location must be 255 characters or less');
      }

      // Validate type against allowed values
      const allowedTypes = ['place', 'restaurant', 'activity', 'service', 'other'];
      if (!allowedTypes.includes(recommendationData.type.toLowerCase())) {
        throw new Error(`Type must be one of: ${allowedTypes.join(', ')}`);
      }

      // Sanitize and prepare data for insertion
      const sanitizedData = {
        title: recommendationData.title.trim(),
        description: recommendationData.description.trim(),
        type: recommendationData.type.toLowerCase().trim(),
        location: recommendationData.location ? recommendationData.location.trim() : null,
        image_url: recommendationData.image_url ? recommendationData.image_url.trim() : null,
        rating: recommendationData.rating !== undefined ? parseFloat(recommendationData.rating) : null
      };

      const { data, error } = await supabase
        .from('recommendations')
        .insert([sanitizedData])
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