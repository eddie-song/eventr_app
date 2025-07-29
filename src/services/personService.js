import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const personService = {
  // Create a new person/service provider
  async createPerson(personData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');
      
      const userId = user.id;
      const personUuid = crypto?.randomUUID?.() ?? uuidv4();
      const now = new Date().toISOString();

      // Insert person
      const { error: personError } = await supabase
        .from('person')
        .insert([{
          uuid: personUuid,
          user_id: userId,
          service: personData.service,
          description: personData.description || null,
          location: personData.location || null,
          contact_info: personData.contactInfo || null,
          service_type: personData.serviceType || 'general',
          hourly_rate: personData.hourlyRate ? parseFloat(personData.hourlyRate) : null,
          image_url: personData.imageUrl || null
        }]);

      if (personError) throw personError;

      return { personId: personUuid };
    } catch (error) {
      console.error('Error creating person:', error);
      throw error;
    }
  },

  // Get all people/service providers
  async getAllPeople() {
    try {
      // First get all people
      const { data: people, error: peopleError } = await supabase
        .from('person')
        .select('*')
        .order('created_at', { ascending: false });

      if (peopleError) throw peopleError;

      // If no people, return empty array
      if (!people || people.length === 0) {
        return [];
      }

      // Get user IDs from people
      const userIds = people.map(person => person.user_id).filter(id => id);

      // Get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('uuid, username, display_name, avatar_url')
        .in('uuid', userIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by user ID
      const profilesMap = {};
      if (profiles) {
        profiles.forEach(profile => {
          profilesMap[profile.uuid] = profile;
        });
      }

      // Combine people with their profiles
      const peopleWithProfiles = people.map(person => ({
        ...person,
        profiles: profilesMap[person.user_id] || null
      }));

      return peopleWithProfiles;
    } catch (error) {
      console.error('Error getting people:', error);
      throw error;
    }
  },

  // Get a specific person by ID
  async getPerson(personId) {
    try {
      const { data: person, error: personError } = await supabase
        .from('person')
        .select('*')
        .eq('uuid', personId)
        .single();

      if (personError) throw personError;

      if (!person) {
        return null;
      }

      // Get the profile for this person
      if (person.user_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('uuid, username, display_name, avatar_url, bio')
          .eq('uuid', person.user_id)
          .single();

        if (!profileError && profile) {
          person.profiles = profile;
        }
      }

      return person;
    } catch (error) {
      console.error('Error getting person:', error);
      throw error;
    }
  },

  // Update a person
  async updatePerson(personId, personData) {
    try {
      // Assign all relevant fields directly
      const updateObj = {
        service: personData.service,
        description: personData.description,
        location: personData.location,
        contact_info: personData.contactInfo,
        service_type: personData.serviceType,
        hourly_rate: personData.hourlyRate ? parseFloat(personData.hourlyRate) : null
      };
      // Remove undefined fields
      Object.keys(updateObj).forEach(key => updateObj[key] === undefined && delete updateObj[key]);
      const { error: updateError } = await supabase
        .from('person')
        .update(updateObj)
        .eq('uuid', personId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      console.error('Error updating person:', error);
      throw error;
    }
  },

  // Delete a person
  async deletePerson(personId) {
    try {
      const { error: deleteError } = await supabase
        .from('person')
        .delete()
        .eq('uuid', personId);

      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error) {
      console.error('Error deleting person:', error);
      throw error;
    }
  },

  // Get people by current user
  async getUserPeople() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');
      
      const { data: people, error: peopleError } = await supabase
        .from('person')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (peopleError) throw peopleError;

      // If no people, return empty array
      if (!people || people.length === 0) {
        return [];
      }

      // Get the current user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('uuid, username, display_name, avatar_url')
        .eq('uuid', user.id)
        .single();

      if (profileError) {
        console.error('Error getting user profile:', profileError);
      }

      // Combine people with the user's profile
      const peopleWithProfiles = people.map(person => ({
        ...person,
        profiles: profile || null
      }));

      return peopleWithProfiles;
    } catch (error) {
      console.error('Error getting user people:', error);
      throw error;
    }
  },

  // Get people by a specific user ID
  async getUserPeopleById(userId) {
    try {
      const { data: people, error: peopleError } = await supabase
        .from('person')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (peopleError) throw peopleError;

      // If no people, return empty array
      if (!people || people.length === 0) {
        return [];
      }

      // Get the user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('uuid, username, display_name, avatar_url')
        .eq('uuid', userId)
        .single();

      if (profileError) {
        console.error('Error getting user profile:', profileError);
      }

      // Combine people with the user's profile
      const peopleWithProfiles = people.map(person => ({
        ...person,
        profiles: profile || null
      }));

      return peopleWithProfiles;
    } catch (error) {
      console.error('Error getting user people by ID:', error);
      throw error;
    }
  },

  // Search people by service type
  async searchPeopleByService(serviceQuery) {
    try {
      const { data: people, error: peopleError } = await supabase
        .from('person')
        .select('*')
        .ilike('service', `%${serviceQuery}%`)
        .order('created_at', { ascending: false });

      if (peopleError) throw peopleError;

      // If no people, return empty array
      if (!people || people.length === 0) {
        return [];
      }

      // Get user IDs from people
      const userIds = people.map(person => person.user_id).filter(id => id);

      // Get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('uuid, username, display_name, avatar_url')
        .in('uuid', userIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by user ID
      const profilesMap = {};
      if (profiles) {
        profiles.forEach(profile => {
          profilesMap[profile.uuid] = profile;
        });
      }

      // Combine people with their profiles
      const peopleWithProfiles = people.map(person => ({
        ...person,
        profiles: profilesMap[person.user_id] || null
      }));

      return peopleWithProfiles;
    } catch (error) {
      console.error('Error searching people:', error);
      throw error;
    }
  }
}; 