import { supabase } from '../lib/supabaseClient'

export const userService = {
  async checkOnboardingStatus() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user found');

      // Check if a profile exists for the current user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('uuid')
        .eq('uuid', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile not found
        return { profileExists: false };
      }
      if (profileError) throw profileError;
      return { profileExists: !!profile };
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return { profileExists: false, error };
    }
  },

  async getCurrentUserProfile() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user found');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('uuid', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile not found
        return { profile: null, profileNotFound: true, error: null };
      }
      if (profileError) throw profileError;
      return { profile, profileNotFound: false, error: null };
    } catch (error) {
      return { profile: null, profileNotFound: false, error };
    }
  },

  async updateProfile(profileData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user found');

      // Input validation
      const updateObj = {};
      if ('username' in profileData && typeof profileData.username === 'string' && profileData.username.trim()) {
        updateObj.username = profileData.username.trim();
      }
      if ('email' in profileData && typeof profileData.email === 'string' && profileData.email.trim()) {
        // Simple email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email.trim())) {
          throw new Error('Invalid email format');
        }
        updateObj.email = profileData.email.trim();
      }
      if ('display_name' in profileData && typeof profileData.display_name === 'string') {
        updateObj.display_name = profileData.display_name.trim();
      }
      if ('phone' in profileData && typeof profileData.phone === 'string' && profileData.phone.trim()) {
        // Simple phone regex (international and US)
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
        if (!phoneRegex.test(profileData.phone.trim())) {
          throw new Error('Invalid phone number format');
        }
        updateObj.phone = profileData.phone.trim();
      }
      if ('bio' in profileData && typeof profileData.bio === 'string') {
        if (profileData.bio.length > 500) {
          throw new Error('Bio must be 500 characters or less');
        }
        updateObj.bio = profileData.bio;
      }
      if ('avatar_url' in profileData && typeof profileData.avatar_url === 'string') {
        updateObj.avatar_url = profileData.avatar_url;
      }
      if ('timezone' in profileData && typeof profileData.timezone === 'string') {
        updateObj.timezone = profileData.timezone;
      }
      updateObj.updated_at = new Date().toISOString();

      if (Object.keys(updateObj).length === 1 && updateObj.updated_at) {
        // No valid fields to update
        throw new Error('No valid profile fields to update');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updateObj)
        .eq('uuid', user.id)
        .select()
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { profile: null, error };
    }
  },
};