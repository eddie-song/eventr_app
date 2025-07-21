import { supabase } from '../lib/supabaseClient';

export const locationService = {
  // Create a new location
  async createLocation(locationData) {
    try {
      const locationUuid = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('location')
        .insert([{
          uuid: locationUuid,
          location: locationData.name,
          longitude: locationData.longitude || null,
          latitude: locationData.latitude || null
        }])
        .select();

      if (error) {
        console.error('Supabase error creating location:', error);
        throw error;
      }
      return { locationId: locationUuid };
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  },

  // Get location by name (or create if doesn't exist)
  async getOrCreateLocation(locationName, coordinates = null) {
    try {
      // First, try to find existing location
      const { data: existingLocation, error: findError } = await supabase
        .from('location')
        .select('*')
        .eq('location', locationName)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding existing location:', findError);
        throw findError;
      }

      if (existingLocation) {
        return existingLocation;
      }

      // Create new location if it doesn't exist
      const locationData = {
        name: locationName,
        longitude: coordinates?.longitude || null,
        latitude: coordinates?.latitude || null
      };

      const { locationId } = await this.createLocation(locationData);
      
      // Fetch the newly created location
      const { data: newLocation, error: fetchError } = await supabase
        .from('location')
        .select('*')
        .eq('uuid', locationId)
        .single();

      if (fetchError) {
        console.error('Error fetching newly created location:', fetchError);
        throw fetchError;
      }

      return newLocation;
    } catch (error) {
      console.error('Error getting or creating location:', error);
      throw error;
    }
  },

  // Link event to location
  async linkEventToLocation(eventId, locationId) {
    try {
      const now = new Date().toISOString();

      // Check for existing link to prevent duplicates
      const { data: existing, error: findError } = await supabase
        .from('location_events')
        .select('event_id, location_id')
        .eq('event_id', eventId)
        .eq('location_id', locationId)
        .single();
      if (!findError && existing) {
        // Link already exists
        return { success: true };
      }
      // If error is not 'no rows found', throw
      if (findError && findError.code !== 'PGRST116') throw findError;

      const { error } = await supabase
        .from('location_events')
        .insert([{
          location_id: locationId,
          event_id: eventId,
          created_at: now
        }]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error linking event to location:', error);
      throw error;
    }
  },

  // Get locations for an event
  async getEventLocations(eventId) {
    try {
      const { data, error } = await supabase
        .from('location_events')
        .select(`
          location_id,
          location:location_id (
            uuid,
            location,
            longitude,
            latitude
          )
        `)
        .eq('event_id', eventId);

      if (error) throw error;

      return data.map(item => item.location);
    } catch (error) {
      console.error('Error getting event locations:', error);
      throw error;
    }
  },

  // Get events for a location
  async getLocationEvents(locationId) {
    try {
      const { data, error } = await supabase
        .from('location_events')
        .select(`
          event_id,
          event:event_id (
            uuid,
            event,
            location,
            image_url,
            scheduled_time,
            price,
            review_count,
            rating,
            created_at
          )
        `)
        .eq('location_id', locationId);

      if (error) throw error;

      return data.map(item => item.event);
    } catch (error) {
      console.error('Error getting location events:', error);
      throw error;
    }
  },

  // Search locations
  async searchLocations(query) {
    try {
      const { data, error } = await supabase
        .from('location')
        .select('*')
        .ilike('location', `%${query}%`)
        .order('location');

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  },

  // Get all locations
  async getAllLocations() {
    try {
      const { data, error } = await supabase
        .from('location')
        .select('*')
        .order('location');

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting all locations:', error);
      throw error;
    }
  }
}; 