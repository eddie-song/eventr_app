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
};