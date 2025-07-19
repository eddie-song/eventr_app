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

      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: profileData.username,
          email: profileData.email,
          display_name: profileData.display_name,
          phone: profileData.phone,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          timezone: profileData.timezone || 'UTC',
          updated_at: new Date().toISOString()
        })
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