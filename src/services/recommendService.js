import { supabase } from '../lib/supabaseClient';
import { businessLocationTagService } from './businessLocationTagService';

// Note: This service now works with business_locations and business_location_tags
// instead of recommendations and recommendation_tags

export const recommendService = {
  // Get business locations for a user (replacing recommendations)
  async getUserRecommendations(userId) {
    try {
      const { data: businessLocations, error: blError } = await supabase
        .from('business_locations')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (blError) throw blError;
      
      // Get tags for each business location
      const businessLocationsWithTags = await Promise.all(
        businessLocations.map(async (bl) => {
          const tags = await businessLocationTagService.getBusinessLocationTags(bl.uuid);
          return { ...bl, tags };
        })
      );

      return businessLocationsWithTags;
    } catch (error) {
      console.error('Error fetching user business locations:', error);
      throw error;
    }
  },

  // Get a single business location (replacing recommendation)
  async getRecommendation(businessLocationId) {
    try {
      const { data: businessLocation, error: blError } = await supabase
        .from('business_locations')
        .select('*')
        .eq('uuid', businessLocationId)
        .single();
      
      if (blError) throw blError;
      
      const tags = await businessLocationTagService.getBusinessLocationTags(businessLocationId);
      return { ...businessLocation, tags };
    } catch (error) {
      console.error('Error fetching business location:', error);
      throw error;
    }
  },

  // Create a new business location (replacing recommendation)
  async createRecommendation(businessData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');
      
      const tagsArray = businessData.tags ? businessData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      
      // Create business location
      const { data: businessLocation, error: blError } = await supabase
        .from('business_locations')
        .insert([{
          name: businessData.title,
          description: businessData.description,
          address: businessData.location || '',
          image_url: businessData.imageUrl || null,
          created_by: user.id
        }])
        .select()
        .single();
      
      if (blError) throw blError;
      
      // Add tags if provided
      if (tagsArray.length > 0) {
        await businessLocationTagService.addBusinessLocationTags(businessLocation.uuid, tagsArray);
      }
      
      return { recommendationId: businessLocation.uuid };
    } catch (error) {
      console.error('Error creating business location:', error);
      throw error;
    }
  },

  // Update a business location (replacing recommendation)
  async updateRecommendation(businessLocationId, businessData) {
    try {
      const tagsArray = businessData.tags ? businessData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      
      // Update business location
      const { error: updateError } = await supabase
        .from('business_locations')
        .update({
          name: businessData.title,
          description: businessData.description,
          address: businessData.location,
          image_url: businessData.imageUrl
        })
        .eq('uuid', businessLocationId);
      
      if (updateError) throw updateError;
      
      // Update tags
      await businessLocationTagService.updateBusinessLocationTags(businessLocationId, tagsArray);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating business location:', error);
      throw error;
    }
  },

  // Delete a business location (replacing recommendation)
  async deleteRecommendation(businessLocationId) {
    try {
      const { error } = await supabase
        .from('business_locations')
        .delete()
        .eq('uuid', businessLocationId);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting business location:', error);
      throw error;
    }
  }
}; 