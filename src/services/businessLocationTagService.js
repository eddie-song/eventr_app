import { supabase } from '../lib/supabaseClient';

export const businessLocationTagService = {
  // Get tags for a business location
  async getBusinessLocationTags(businessLocationId) {
    try {
      const { data: tags, error } = await supabase
        .from('business_location_tags')
        .select('tag')
        .eq('business_location_id', businessLocationId);
      
      if (error) throw error;
      return tags.map(tag => tag.tag);
    } catch (error) {
      console.error('Error fetching business location tags:', error);
      throw error;
    }
  },

  // Add tags to a business location
  async addBusinessLocationTags(businessLocationId, tags) {
    try {
      if (!tags || tags.length === 0) return { success: true };
      
      const tagRecords = tags.map(tag => ({
        business_location_id: businessLocationId,
        tag: tag.trim(),
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('business_location_tags')
        .insert(tagRecords);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error adding business location tags:', error);
      throw error;
    }
  },

  // Update tags for a business location (replace all existing tags)
  async updateBusinessLocationTags(businessLocationId, tags) {
    try {
      // Delete existing tags
      const { error: deleteError } = await supabase
        .from('business_location_tags')
        .delete()
        .eq('business_location_id', businessLocationId);
      
      if (deleteError) throw deleteError;

      // Add new tags if any
      if (tags && tags.length > 0) {
        return await this.addBusinessLocationTags(businessLocationId, tags);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating business location tags:', error);
      throw error;
    }
  },

  // Remove specific tags from a business location
  async removeBusinessLocationTags(businessLocationId, tagsToRemove) {
    try {
      const { error } = await supabase
        .from('business_location_tags')
        .delete()
        .eq('business_location_id', businessLocationId)
        .in('tag', tagsToRemove);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error removing business location tags:', error);
      throw error;
    }
  },

  // Get all unique tags across all business locations
  async getAllTags() {
    try {
      const { data: tags, error } = await supabase
        .from('business_location_tags')
        .select('tag')
        .order('tag');
      
      if (error) throw error;
      
      // Get unique tags
      const uniqueTags = [...new Set(tags.map(tag => tag.tag))];
      return uniqueTags;
    } catch (error) {
      console.error('Error fetching all tags:', error);
      throw error;
    }
  },

  // Search business locations by tags
  async searchBusinessLocationsByTags(tags) {
    try {
      const { data: businessLocations, error } = await supabase
        .from('business_locations')
        .select(`
          *,
          business_location_tags(tag)
        `)
        .in('business_location_tags.tag', tags);
      
      if (error) throw error;
      return businessLocations;
    } catch (error) {
      console.error('Error searching business locations by tags:', error);
      throw error;
    }
  }
}; 