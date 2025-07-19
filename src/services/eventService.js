import { supabase } from '../lib/supabaseClient';

export const eventService = {
  // Create a new event with tags and hosts
  async createEvent(eventData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');
      
      const userId = user.id;
      const eventUuid = crypto.randomUUID();
      const now = new Date().toISOString();
      const tagsArray = eventData.tags ? eventData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

      // Insert event
      const { error: eventError } = await supabase
        .from('events')
        .insert([{
          uuid: eventUuid,
          event: eventData.title,
          location: eventData.location || null,
          review_count: 0,
          rating: 0.00,
          created_at: now
        }]);

      if (eventError) throw eventError;

      // Insert tags if provided
      if (tagsArray.length > 0) {
        const tagRecords = tagsArray.map(tag => ({
          event_id: eventUuid,
          tag: tag,
          created_at: now
        }));

        const { error: tagsError } = await supabase
          .from('event_tags')
          .insert(tagRecords);

        if (tagsError) throw tagsError;
      }

      // Add the creator as a host
      const { error: hostError } = await supabase
        .from('event_hosts')
        .insert([{
          event_id: eventUuid,
          user_id: userId,
          created_at: now
        }]);

      if (hostError) throw hostError;

      // Add the creator as an attendee
      const { error: attendeeError } = await supabase
        .from('event_attendees')
        .insert([{
          event_id: eventUuid,
          user_id: userId,
          created_at: now
        }]);

      if (attendeeError) throw attendeeError;

      return { eventId: eventUuid };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Get all events with tags and host information
  async getAllEvents() {
    try {
      // Get events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Get tags for all events
      const eventIds = events.map(event => event.uuid);
      const { data: tags, error: tagsError } = await supabase
        .from('event_tags')
        .select('event_id, tag')
        .in('event_id', eventIds);

      if (tagsError) throw tagsError;

      // Get hosts for all events
      const { data: hosts, error: hostsError } = await supabase
        .from('event_hosts')
        .select('event_id, user_id')
        .in('event_id', eventIds);

      if (hostsError) throw hostsError;

      // Get attendee counts for all events
      const { data: attendeeCounts, error: attendeeError } = await supabase
        .from('event_attendees')
        .select('event_id')
        .in('event_id', eventIds);

      if (attendeeError) throw attendeeError;

      // Group tags by event_id
      const tagsByEvent = {};
      tags.forEach(tag => {
        if (!tagsByEvent[tag.event_id]) {
          tagsByEvent[tag.event_id] = [];
        }
        tagsByEvent[tag.event_id].push(tag.tag);
      });

      // Group hosts by event_id
      const hostsByEvent = {};
      hosts.forEach(host => {
        if (!hostsByEvent[host.event_id]) {
          hostsByEvent[host.event_id] = [];
        }
        hostsByEvent[host.event_id].push(host.user_id);
      });

      // Count attendees by event_id
      const attendeeCountByEvent = {};
      attendeeCounts.forEach(attendee => {
        attendeeCountByEvent[attendee.event_id] = (attendeeCountByEvent[attendee.event_id] || 0) + 1;
      });

      // Combine events with their tags, hosts, and attendee counts
      const eventsWithDetails = events.map(event => ({
        ...event,
        tags: tagsByEvent[event.uuid] || [],
        hosts: hostsByEvent[event.uuid] || [],
        attendeeCount: attendeeCountByEvent[event.uuid] || 0
      }));

      return eventsWithDetails;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get a single event with tags and host information
  async getEvent(eventId) {
    try {
      // Get event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('uuid', eventId)
        .single();

      if (eventError) throw eventError;

      // Get tags
      const { data: tags, error: tagsError } = await supabase
        .from('event_tags')
        .select('tag')
        .eq('event_id', eventId);

      if (tagsError) throw tagsError;

      // Get hosts
      const { data: hosts, error: hostsError } = await supabase
        .from('event_hosts')
        .select('user_id')
        .eq('event_id', eventId);

      if (hostsError) throw hostsError;

      // Get attendee count
      const { count: attendeeCount, error: attendeeError } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (attendeeError) throw attendeeError;

      return {
        ...event,
        tags: tags.map(tag => tag.tag),
        hosts: hosts.map(host => host.user_id),
        attendeeCount: attendeeCount || 0
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  // Update an event with tags
  async updateEvent(eventId, eventData) {
    try {
      const tagsArray = eventData.tags ? eventData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

      // Update event
      const { error: updateError } = await supabase
        .from('events')
        .update({
          event: eventData.title,
          location: eventData.location
        })
        .eq('uuid', eventId);

      if (updateError) throw updateError;

      // Delete existing tags
      const { error: deleteTagsError } = await supabase
        .from('event_tags')
        .delete()
        .eq('event_id', eventId);

      if (deleteTagsError) throw deleteTagsError;

      // Insert new tags
      if (tagsArray.length > 0) {
        const tagRecords = tagsArray.map(tag => ({
          event_id: eventId,
          tag: tag,
          created_at: new Date().toISOString()
        }));

        const { error: insertTagsError } = await supabase
          .from('event_tags')
          .insert(tagRecords);

        if (insertTagsError) throw insertTagsError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete an event and its related data
  async deleteEvent(eventId) {
    try {
      // Delete tags first
      const { error: tagsError } = await supabase
        .from('event_tags')
        .delete()
        .eq('event_id', eventId);

      if (tagsError) throw tagsError;

      // Delete hosts
      const { error: hostsError } = await supabase
        .from('event_hosts')
        .delete()
        .eq('event_id', eventId);

      if (hostsError) throw hostsError;

      // Delete attendees
      const { error: attendeesError } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId);

      if (attendeesError) throw attendeesError;

      // Delete location_events references
      const { error: locationEventsError } = await supabase
        .from('location_events')
        .delete()
        .eq('event_id', eventId);

      if (locationEventsError) throw locationEventsError;

      // Delete user_saves references to this event
      const { error: userSavesError } = await supabase
        .from('user_saves')
        .delete()
        .eq('item_type', 'event')
        .eq('item_id', eventId);

      if (userSavesError) throw userSavesError;

      // Delete the event
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('uuid', eventId);

      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Join an event as an attendee
  async joinEvent(eventId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');
      
      const userId = user.id;

      // Check if user is already an attendee
      const { data: existingAttendee, error: checkError } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingAttendee) {
        throw new Error('User is already attending this event');
      }

      // Add user as attendee
      const { error: insertError } = await supabase
        .from('event_attendees')
        .insert([{
          event_id: eventId,
          user_id: userId,
          created_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      return { success: true };
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  },

  // Leave an event
  async leaveEvent(eventId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');
      
      const userId = user.id;

      // Remove user from attendees
      const { error: deleteError } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error) {
      console.error('Error leaving event:', error);
      throw error;
    }
  },

  // Check if current user is attending an event
  async isUserAttending(eventId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return false;
      
      const userId = user.id;

      const { data: attendee, error: checkError } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code === 'PGRST116') {
        return false; // No attendee record found
      }
      if (checkError) throw checkError;

      return !!attendee;
    } catch (error) {
      console.error('Error checking if user is attending:', error);
      return false;
    }
  },

  // Get events created by current user
  async getUserEvents() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');
      
      const userId = user.id;

      // Get events where user is a host
      const { data: hostedEvents, error: hostedError } = await supabase
        .from('event_hosts')
        .select(`
          event_id,
          events (*)
        `)
        .eq('user_id', userId);

      if (hostedError) throw hostedError;

      const events = hostedEvents.map(item => item.events);
      
      // Get tags for all events
      const eventIds = events.map(event => event.uuid);
      const { data: tags, error: tagsError } = await supabase
        .from('event_tags')
        .select('event_id, tag')
        .in('event_id', eventIds);

      if (tagsError) throw tagsError;

      // Group tags by event_id
      const tagsByEvent = {};
      tags.forEach(tag => {
        if (!tagsByEvent[tag.event_id]) {
          tagsByEvent[tag.event_id] = [];
        }
        tagsByEvent[tag.event_id].push(tag.tag);
      });

      // Get attendee counts for all events
      const { data: attendeeCounts, error: attendeeError } = await supabase
        .from('event_attendees')
        .select('event_id')
        .in('event_id', eventIds);

      if (attendeeError) throw attendeeError;

      // Count attendees per event
      const attendeeCountByEvent = {};
      attendeeCounts.forEach(attendee => {
        attendeeCountByEvent[attendee.event_id] = (attendeeCountByEvent[attendee.event_id] || 0) + 1;
      });

      // Combine events with their tags and attendee counts
      const eventsWithTags = events.map(event => ({
        ...event,
        tags: tagsByEvent[event.uuid] || [],
        attendeeCount: attendeeCountByEvent[event.uuid] || 0
      }));

      return eventsWithTags;
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw error;
    }
  },

  // Get events the current user is attending
  async getUserAttendingEvents() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');
      
      const userId = user.id;

      // Get events where user is an attendee
      const { data: attendingEvents, error: attendingError } = await supabase
        .from('event_attendees')
        .select(`
          event_id,
          events (*)
        `)
        .eq('user_id', userId);

      if (attendingError) throw attendingError;

      return attendingEvents.map(item => item.events);
    } catch (error) {
      console.error('Error fetching user attending events:', error);
      throw error;
    }
  },


}; 