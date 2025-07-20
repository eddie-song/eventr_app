import { supabase } from '../lib/supabaseClient';

export const imageUploadService = {
  // Check if event-images bucket exists, create if it doesn't
  async ensureBucketExists() {
    try {
      // Try to list files from the bucket to check if it exists
      const { data, error } = await supabase.storage
        .from('event-images')
        .list('', { limit: 1 });
      
      if (error && error.message.includes('not found')) {
        // Bucket doesn't exist, create it
        const { error: createError } = await supabase.storage.createBucket('event-images', {
          public: false, // private bucket
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        });
        
        if (createError) {
          console.error('Failed to create bucket:', createError);
          throw new Error('Storage bucket not available. Please contact support.');
        }
        
        // Set up RLS policies for the bucket
        await this.setupBucketPolicies();
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      throw error;
    }
  },

  // Upload image to event-images bucket
  async uploadEventImage(file) {
    try {
      // Ensure bucket exists before uploading
      await this.ensureBucketExists();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');
      
      const userId = user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // Check if it's an RLS policy error
        if (error.message && error.message.includes('row-level security policy')) {
          throw new Error(`
            Storage access denied. Please set up RLS policies for the event-images bucket.
            
            To fix this:
            1. Go to your Supabase Dashboard
            2. Navigate to Storage > Policies
            3. Select the 'event-images' bucket
            4. Add the required policies (see console for details)
            
            See the documentation in: src/schema/setup/event-images-bucket.sql
          `);
        }
        throw error;
      }

      // Get the signed URL (since bucket is private)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('event-images')
        .createSignedUrl(fileName, 31536000); // 1 year expiry

      if (signedUrlError) throw signedUrlError;

      return { publicUrl: signedUrlData.signedUrl, fileName };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Delete image from event-images bucket
  async deleteEventImage(fileName) {
    try {
      const { error } = await supabase.storage
        .from('event-images')
        .remove([fileName]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  // Get signed URL for existing image (for display)
  async getSignedUrl(fileName) {
    try {
      const { data, error } = await supabase.storage
        .from('event-images')
        .createSignedUrl(fileName, 3600); // 1 hour expiry for display

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  },

  // Validate file before upload
  validateImageFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (file.size > maxSize) {
      throw new Error('Image file size must be less than 5MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed');
    }
    
    return true;
  }
}; 