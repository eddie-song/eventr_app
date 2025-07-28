import { supabase } from '../lib/supabaseClient';

export const businessLocationService = {
  // Get all business locations
  async getAllBusinessLocations() {
    try {
      const { data, error } = await supabase
        .from('business_locations')
        .select(`
          *,
          business_location_tags(tag),
          business_location_reviews(
            rating,
            review_text,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching business locations:', error);
        throw error;
      }

      // Transform the data to calculate average rating and review count
      const transformedData = data.map(location => {
        const reviews = location.business_location_reviews || [];
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        
        const tags = location.business_location_tags || [];
        
        return {
          ...location,
          rating: parseFloat(averageRating.toFixed(1)),
          review_count: reviews.length,
          tags: tags.map(tagObj => tagObj.tag)
        };
      });

      return transformedData;
    } catch (error) {
      console.error('Error in getAllBusinessLocations:', error);
      throw error;
    }
  },

  // Get business location by ID
  async getBusinessLocationById(id) {
    try {
      const { data, error } = await supabase
        .from('business_locations')
        .select(`
          *,
          business_location_tags(tag),
          business_location_reviews(
            rating,
            review_text,
            created_at,
            user_id
          )
        `)
        .eq('uuid', id)
        .single();

      if (error) {
        console.error('Error fetching business location:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getBusinessLocationById:', error);
      throw error;
    }
  },

  // Create a new business location
  async createBusinessLocation(businessData) {
    try {
      const { data, error } = await supabase
        .from('business_locations')
        .insert([businessData])
        .select()
        .single();

      if (error) {
        console.error('Error creating business location:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createBusinessLocation:', error);
      throw error;
    }
  },

  // Update a business location
  async updateBusinessLocation(id, updates) {
    try {
      const { data, error } = await supabase
        .from('business_locations')
        .update(updates)
        .eq('uuid', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating business location:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateBusinessLocation:', error);
      throw error;
    }
  },

  // Delete a business location
  async deleteBusinessLocation(id) {
    try {
      const { error } = await supabase
        .from('business_locations')
        .delete()
        .eq('uuid', id);

      if (error) {
        console.error('Error deleting business location:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteBusinessLocation:', error);
      throw error;
    }
  },

  // Get business locations created by the current user
  async getUserBusinessLocations() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('business_locations')
        .select(`
          *,
          business_location_tags(tag),
          business_location_reviews(
            rating,
            review_text,
            created_at
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user business locations:', error);
        throw error;
      }

      // Transform the data to calculate average rating and review count
      const transformedData = data.map(location => {
        const reviews = location.business_location_reviews || [];
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        
        const tags = location.business_location_tags || [];
        
        return {
          ...location,
          rating: parseFloat(averageRating.toFixed(1)),
          review_count: reviews.length,
          tags: tags.map(tagObj => tagObj.tag)
        };
      });

      return transformedData;
    } catch (error) {
      console.error('Error in getUserBusinessLocations:', error);
      throw error;
    }
  },

  // Get business locations created by a specific user ID
  async getUserBusinessLocationsById(userId) {
    try {
      const { data, error } = await supabase
        .from('business_locations')
        .select(`
          *,
          business_location_tags(tag),
          business_location_reviews(
            rating,
            review_text,
            created_at
          )
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user business locations by ID:', error);
        throw error;
      }

      // Transform the data to calculate average rating and review count
      const transformedData = data.map(location => {
        const reviews = location.business_location_reviews || [];
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        
        const tags = location.business_location_tags || [];
        
        return {
          ...location,
          rating: parseFloat(averageRating.toFixed(1)),
          review_count: reviews.length,
          tags: tags.map(tagObj => tagObj.tag)
        };
      });

      return transformedData;
    } catch (error) {
      console.error('Error in getUserBusinessLocationsById:', error);
      throw error;
    }
  }
}; 