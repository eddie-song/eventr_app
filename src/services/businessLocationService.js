import { supabase } from '../lib/supabaseClient';

export const businessLocationService = {
  // Private helper method to transform business location data
  _transformBusinessLocationData(data) {
    return data.map(location => {
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
  },

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

      return this._transformBusinessLocationData(data);
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
      // Extract tags from updates if present
      const { tags, ...otherUpdates } = updates;
      
      // Start a transaction-like operation
      let mainTableData = null;
      
      // Update main table if there are other fields to update
      if (Object.keys(otherUpdates).length > 0) {
        const { data, error } = await supabase
          .from('business_locations')
          .update(otherUpdates)
          .eq('uuid', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating business location:', error);
          throw error;
        }
        
        mainTableData = data;
      }
      
      // Handle tags update if provided
      if (tags !== undefined) {
        await this.updateBusinessLocationTags(id, tags);
      }
      
      // If we didn't update the main table but need to return data, fetch it
      if (!mainTableData && tags !== undefined) {
        const { data, error } = await supabase
          .from('business_locations')
          .select()
          .eq('uuid', id)
          .single();

        if (error) {
          console.error('Error fetching updated business location:', error);
          throw error;
        }
        
        mainTableData = data;
      }
      
      return mainTableData;
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

      return this._transformBusinessLocationData(data);
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

      return this._transformBusinessLocationData(data);
    } catch (error) {
      console.error('Error in getUserBusinessLocationsById:', error);
      throw error;
    }
  },

  // Update business location tags with proper error handling
  async updateBusinessLocationTags(businessLocationId, tags) {
    try {
      // Validate input
      if (!businessLocationId) {
        throw new Error('Business location ID is required');
      }

      if (!Array.isArray(tags)) {
        throw new Error('Tags must be an array');
      }

      // Delete existing tags first
      const { error: deleteError } = await supabase
        .from('business_location_tags')
        .delete()
        .eq('business_location_id', businessLocationId);

      if (deleteError) {
        console.error('Error deleting existing business location tags:', deleteError);
        throw new Error(`Failed to delete existing tags: ${deleteError.message}`);
      }

      // Insert new tags if provided
      if (tags.length > 0) {
        // Validate and prepare tag records
        const tagRecords = tags
          .filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0)
          .map(tag => ({
            business_location_id: businessLocationId,
            tag: tag.trim(),
            created_at: new Date().toISOString()
          }));

        if (tagRecords.length > 0) {
          const { error: insertError } = await supabase
            .from('business_location_tags')
            .insert(tagRecords);

          if (insertError) {
            console.error('Error inserting business location tags:', insertError);
            throw new Error(`Failed to insert tags: ${insertError.message}`);
          }
        }
      }

      return { success: true, message: 'Tags updated successfully' };
    } catch (error) {
      console.error('Error in updateBusinessLocationTags:', error);
      throw error;
    }
  },

  // Add a single tag to a business location
  async addBusinessLocationTag(businessLocationId, tag) {
    try {
      // Validate input
      if (!businessLocationId) {
        throw new Error('Business location ID is required');
      }

      if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
        throw new Error('Valid tag is required');
      }

      const tagRecord = {
        business_location_id: businessLocationId,
        tag: tag.trim(),
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('business_location_tags')
        .insert([tagRecord]);

      if (error) {
        console.error('Error adding business location tag:', error);
        throw new Error(`Failed to add tag: ${error.message}`);
      }

      return { success: true, message: 'Tag added successfully' };
    } catch (error) {
      console.error('Error in addBusinessLocationTag:', error);
      throw error;
    }
  },

  // Remove a single tag from a business location
  async removeBusinessLocationTag(businessLocationId, tag) {
    try {
      // Validate input
      if (!businessLocationId) {
        throw new Error('Business location ID is required');
      }

      if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
        throw new Error('Valid tag is required');
      }

      const { error } = await supabase
        .from('business_location_tags')
        .delete()
        .eq('business_location_id', businessLocationId)
        .eq('tag', tag.trim());

      if (error) {
        console.error('Error removing business location tag:', error);
        throw new Error(`Failed to remove tag: ${error.message}`);
      }

      return { success: true, message: 'Tag removed successfully' };
    } catch (error) {
      console.error('Error in removeBusinessLocationTag:', error);
      throw error;
    }
  },

  // Get all tags for a business location
  async getBusinessLocationTags(businessLocationId) {
    try {
      // Validate input
      if (!businessLocationId) {
        throw new Error('Business location ID is required');
      }

      const { data, error } = await supabase
        .from('business_location_tags')
        .select('tag')
        .eq('business_location_id', businessLocationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching business location tags:', error);
        throw new Error(`Failed to fetch tags: ${error.message}`);
      }

      return data.map(item => item.tag);
    } catch (error) {
      console.error('Error in getBusinessLocationTags:', error);
      throw error;
    }
  }
}; 