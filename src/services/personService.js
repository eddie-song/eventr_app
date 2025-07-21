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
          status: 'active',
          review_count: 0,
          rating: 0.00,
          created_at: now
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
      const { data: people, error: peopleError } = await supabase
        .from('person')
        .select(`
          *,
          profiles:user_id (
            uuid,
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (peopleError) throw peopleError;

      return people;
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
        .select(`
          *,
          profiles:user_id (
            uuid,
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('uuid', personId)
        .single();

      if (personError) throw personError;

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
        hourly_rate: personData.hourlyRate ? parseFloat(personData.hourlyRate) : null,
        status: personData.status
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

      return people;
    } catch (error) {
      console.error('Error getting user people:', error);
      throw error;
    }
  },

  // Search people by service type
  async searchPeopleByService(serviceQuery) {
    try {
      const { data: people, error: peopleError } = await supabase
        .from('person')
        .select(`
          *,
          profiles:user_id (
            uuid,
            username,
            display_name,
            avatar_url
          )
        `)
        .ilike('service', `%${serviceQuery}%`)
        .order('created_at', { ascending: false });

      if (peopleError) throw peopleError;

      return people;
    } catch (error) {
      console.error('Error searching people:', error);
      throw error;
    }
  }
}; 