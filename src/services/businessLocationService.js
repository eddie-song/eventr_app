import { supabase } from '../lib/supabaseClient';

export const businessLocationService = {
  // Create a new business location
  async createBusinessLocation(businessData) {
    try {
      const businessUuid = crypto.randomUUID();
      const now = new Date().toISOString();

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('business_locations')
        .insert([{
          uuid: businessUuid,
          name: businessData.name,
          description: businessData.description,
          address: businessData.address,
          city: businessData.city,
          state: businessData.state,
          zip_code: businessData.zipCode,
          country: businessData.country || 'USA',
          longitude: businessData.longitude || null,
          latitude: businessData.latitude || null,
          phone: businessData.phone,
          email: businessData.email,
          website: businessData.website,
          business_type: businessData.businessType || 'general',
          hours_of_operation: businessData.hoursOfOperation,
          price_range: businessData.priceRange,
          amenities: businessData.amenities || [],
          image_url: businessData.imageUrl,
          created_by: user.id
        }])
        .select();

      if (error) {
        console.error('Supabase error creating business location:', error);
        throw error;
      }

      // Add tags if provided
      if (businessData.tags && businessData.tags.length > 0) {
        const tagData = businessData.tags.map(tag => ({
          business_location_id: businessUuid,
          tag: tag.trim()
        }));

        const { error: tagError } = await supabase
          .from('business_location_tags')
          .insert(tagData);

        if (tagError) {
          console.error('Error adding tags:', tagError);
          // Don't throw here, the business location was created successfully
        }
      }

      return { businessLocationId: businessUuid };
    } catch (error) {
      console.error('Error creating business location:', error);
      throw error;
    }
  },

  // Get business location by ID
  async getBusinessLocation(businessId) {
    try {
      const { data, error } = await supabase
        .from('business_locations')
        .select(`
          *,
          business_location_tags(tag),
          business_location_reviews(
            uuid,
            rating,
            review_text,
            created_at,
            user_id,
            profiles:user_id(display_name, avatar_url)
          )
        `)
        .eq('uuid', businessId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting business location:', error);
      throw error;
    }
  },

  // Get all business locations
  async getAllBusinessLocations() {
    try {
      const { data, error } = await supabase
        .from('business_locations')
        .select(`
          *,
          business_location_tags(tag)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting all business locations:', error);
      throw error;
    }
  },

  // Search business locations
  async searchBusinessLocations(query, filters = {}) {
    try {
      let queryBuilder = supabase
        .from('business_locations')
        .select(`
          *,
          business_location_tags(tag)
        `);

      // Add search query
      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`);
      }

      // Add filters
      if (filters.businessType) {
        queryBuilder = queryBuilder.eq('business_type', filters.businessType);
      }

      if (filters.city) {
        queryBuilder = queryBuilder.eq('city', filters.city);
      }

      if (filters.priceRange) {
        queryBuilder = queryBuilder.eq('price_range', filters.priceRange);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error searching business locations:', error);
      throw error;
    }
  },

  // Update business location
  async updateBusinessLocation(businessId, updateData) {
    try {
      const { data, error } = await supabase
        .from('business_locations')
        .update({
          name: updateData.name,
          description: updateData.description,
          address: updateData.address,
          city: updateData.city,
          state: updateData.state,
          zip_code: updateData.zipCode,
          country: updateData.country,
          longitude: updateData.longitude,
          latitude: updateData.latitude,
          phone: updateData.phone,
          email: updateData.email,
          website: updateData.website,
          business_type: updateData.businessType,
          hours_of_operation: updateData.hoursOfOperation,
          price_range: updateData.priceRange,
          amenities: updateData.amenities,
          image_url: updateData.imageUrl
        })
        .eq('uuid', businessId)
        .select();

      if (error) throw error;

      // Update tags if provided
      if (updateData.tags !== undefined) {
        // Delete existing tags
        await supabase
          .from('business_location_tags')
          .delete()
          .eq('business_location_id', businessId);

        // Add new tags
        if (updateData.tags && updateData.tags.length > 0) {
          const tagData = updateData.tags.map(tag => ({
            business_location_id: businessId,
            tag: tag.trim()
          }));

          await supabase
            .from('business_location_tags')
            .insert(tagData);
        }
      }

      return data[0];
    } catch (error) {
      console.error('Error updating business location:', error);
      throw error;
    }
  },

  // Delete business location
  async deleteBusinessLocation(businessId) {
    try {
      const { error } = await supabase
        .from('business_locations')
        .delete()
        .eq('uuid', businessId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting business location:', error);
      throw error;
    }
  },

  // Add review to business location
  async addReview(businessId, reviewData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('business_location_reviews')
        .upsert([{
          business_location_id: businessId,
          user_id: user.id,
          rating: reviewData.rating,
          review_text: reviewData.reviewText
        }], {
          onConflict: 'business_location_id,user_id'
        })
        .select();

      if (error) throw error;

      return data[0];
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  // Get reviews for business location
  async getReviews(businessId) {
    try {
      const { data, error } = await supabase
        .from('business_location_reviews')
        .select(`
          *,
          profiles:user_id(display_name, avatar_url)
        `)
        .eq('business_location_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  },

  // Get business locations by type
  async getBusinessLocationsByType(businessType) {
    try {
      const { data, error } = await supabase
        .from('business_locations')
        .select(`
          *,
          business_location_tags(tag)
        `)
        .eq('business_type', businessType)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting business locations by type:', error);
      throw error;
    }
  },

  // Get business locations by city
  async getBusinessLocationsByCity(city) {
    try {
      const { data, error } = await supabase
        .from('business_locations')
        .select(`
          *,
          business_location_tags(tag)
        `)
        .eq('city', city)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting business locations by city:', error);
      throw error;
    }
  },

  // Get business locations created by current user
  async getUserBusinessLocations() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');

      const userId = user.id;

      const { data, error } = await supabase
        .from('business_locations')
        .select(`
          *,
          business_location_tags(tag)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting user business locations:', error);
      throw error;
    }
  }
}; 