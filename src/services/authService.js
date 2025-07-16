import { supabase } from '../lib/supabaseClient';

export const authService = {
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/dashboard'
        }
      });
      
      if (error) {
        // Log the full error for debugging
        console.log('SignUp error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack
        });
        
        // Check if this is a "User already registered" error
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('user already registered') || 
            errorMessage.includes('already been registered') ||
            errorMessage.includes('already exists') ||
            errorMessage.includes('already registered') ||
            errorMessage.includes('user already exists') ||
            errorMessage.includes('email already') ||
            errorMessage.includes('account already')) {
          return { data: null, error: { message: 'An account with this email already exists. Please try logging in instead.' } };
        }
        
        // If it's not a duplicate user error, throw the original error
        throw error;
      }
      
      // Don't automatically sign in - user needs to confirm email first
      return { data, error: null };
      
    } catch (error) {
      return { data: null, error };
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  getCurrentUser() {
    return supabase.auth.getUser();
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },


}; 