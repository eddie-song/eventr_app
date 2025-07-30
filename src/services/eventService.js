import { supabase } from '../lib/supabaseClient';
import { userService } from './userService';
import { locationService } from './locationService';
import { convertLocalToUTC } from '../utils/timezoneUtils';

export const eventService = {
  // Create a new event
  async createEvent(eventData) {
    // Manual rollback mechanism for atomicity
    const inserted = {
      eventUuid: null,
      tags: false,
      host: false,
      attendee: false,
      locationLinked: false,
      location: null,
    };
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');

      const userId = user.id;
      const eventUuid = crypto.randomUUID();
      const now = new Date().toISOString();

      // Input validation for eventData
      if (typeof eventData.title !== 'string' || !eventData.title.trim()) {
        throw new Error('Event title is required and must be a non-empty string.');
      }
      if (eventData.location && typeof eventData.location !== 'string') {
        throw new Error('Event location must be a string.');
      }
      if (eventData.description && typeof eventData.description !== 'string') {
        throw new Error('Event description must be a string.');
      }
      if (eventData.imageUrl && typeof eventData.imageUrl !== 'string') {
        throw new Error('Event imageUrl must be a string.');
      }
      if (eventData.price && isNaN(parseFloat(eventData.price))) {
        throw new Error('Event price must be a valid number.');
      }
      if (eventData.capacity && isNaN(parseInt(eventData.capacity))) {
        throw new Error('Event capacity must be a valid integer.');
      }
      if (eventData.eventType && typeof eventData.eventType !== 'string') {
        throw new Error('Event type must be a string.');
      }
      if (eventData.scheduledTime && isNaN(Date.parse(eventData.scheduledTime))) {
        throw new Error('Event scheduledTime must be a valid date string.');
      }

      // Parse and validate tags
      let tagsArray = [];
      if (typeof eventData.tags === 'string') {
        tagsArray = eventData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag && /^[\w#\- ]{1,32}$/.test(tag)); // Only allow word chars, #, -, space, max 32 chars
      } else if (Array.isArray(eventData.tags)) {
        tagsArray = eventData.tags
          .map(tag => (typeof tag === 'string' ? tag.trim() : ''))
          .filter(tag => tag && /^[\w#\- ]{1,32}$/.test(tag));
      }

      // Get user's timezone for reference
      let userProfile = null;
      try {
        userProfile = await userService.getUserProfile();
      } catch (profileError) {
        console.warn('Could not get user timezone, using UTC:', profileError);
      }

      const userTimezone = userProfile?.timezone || 'UTC';

      // Store scheduled time as provided (datetime-local input is already in local time)
      let scheduledTimeUTC = null;
      if (eventData.scheduledTime) {
        try {
          // Use timezone utility to convert local datetime input to UTC
          scheduledTimeUTC = convertLocalToUTC(eventData.scheduledTime, userTimezone);
        } catch (error) {
          console.error('Error processing scheduled time:', error);
          scheduledTimeUTC = eventData.scheduledTime;
        }
      }

      // Insert event
      const { error: eventError } = await supabase
        .from('events')
        .insert([{
          uuid: eventUuid,
          event: eventData.title,
          location: eventData.location || null,
          description: eventData.description || null,
          image_url: eventData.imageUrl || null,
          scheduled_time: scheduledTimeUTC,
          price: eventData.price ? parseFloat(eventData.price) : null,
          capacity: eventData.capacity ? parseInt(eventData.capacity) : null,
          event_type: eventData.eventType || 'general',
          status: 'active',
          review_count: 0,
          rating: 0.00,
          created_at: now
        }]);

      if (eventError) throw eventError;
      inserted.eventUuid = eventUuid;

      // Link event to location if provided
      if (eventData.location) {
        const location = await locationService.getOrCreateLocation(eventData.location);
        await locationService.linkEventToLocation(eventUuid, location.uuid);
        inserted.locationLinked = true;
        inserted.location = location;
      }

      // Insert tags if provided
      if (tagsArray.length > 0) {
        // Validate each tag again before insert (defensive)
        const validTags = tagsArray.filter(tag => tag && /^[\w#\- ]{1,32}$/.test(tag));
        if (validTags.length !== tagsArray.length) {
          throw new Error('One or more tags are invalid. Tags must be 1-32 chars, only letters, numbers, #, -, and spaces.');
        }
        const tagRecords = validTags.map(tag => ({
          event_id: eventUuid,
          tag: tag,
          created_at: now
        }));

        const { error: tagsError } = await supabase
          .from('event_tags')
          .insert(tagRecords);

        if (tagsError) throw tagsError;
        inserted.tags = true;
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
      inserted.host = true;

      // Add the creator as an attendee
      const { error: attendeeError } = await supabase
        .from('event_attendees')
        .insert([{
          event_id: eventUuid,
          user_id: userId,
          created_at: now
        }]);

      if (attendeeError) throw attendeeError;
      inserted.attendee = true;

      return { eventId: eventUuid };
    } catch (error) {
      // Rollback in reverse order
      if (inserted.attendee) {
        await supabase.from('event_attendees').delete().eq('event_id', inserted.eventUuid);
      }
      if (inserted.host) {
        await supabase.from('event_hosts').delete().eq('event_id', inserted.eventUuid);
      }
      if (inserted.tags) {
        await supabase.from('event_tags').delete().eq('event_id', inserted.eventUuid);
      }
      if (inserted.locationLinked && inserted.location) {
        await supabase.from('location_events').delete().eq('event_id', inserted.eventUuid).eq('location_id', inserted.location.uuid);
      }
      if (inserted.eventUuid) {
        await supabase.from('events').delete().eq('uuid', inserted.eventUuid);
      }
      console.error('Error creating event, rolled back:', error);
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

      // Get location associations for all events
      const { data: locationEvents, error: locationError } = await supabase
        .from('location_events')
        .select(`
          event_id,
          location:location_id (
            uuid,
            location,
            longitude,
            latitude
          )
        `)
        .in('event_id', eventIds);

      if (locationError) throw locationError;

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

      // Group locations by event_id
      const locationsByEvent = {};
      locationEvents.forEach(locationEvent => {
        if (!locationsByEvent[locationEvent.event_id]) {
          locationsByEvent[locationEvent.event_id] = [];
        }
        locationsByEvent[locationEvent.event_id].push(locationEvent.location);
      });

      // Combine events with their tags, hosts, attendee counts, and locations
      const eventsWithDetails = events.map(event => ({
        ...event,
        tags: tagsByEvent[event.uuid] || [],
        hosts: hostsByEvent[event.uuid] || [],
        attendeeCount: attendeeCountByEvent[event.uuid] || 0,
        locations: locationsByEvent[event.uuid] || []
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

      // Get location associations
      const { data: locationEvents, error: locationError } = await supabase
        .from('location_events')
        .select(`
          location:location_id (
            uuid,
            location,
            longitude,
            latitude
          )
        `)
        .eq('event_id', eventId);

      if (locationError) throw locationError;

      return {
        ...event,
        tags: tags.map(tag => tag.tag),
        hosts: hosts.map(host => host.user_id),
        attendeeCount: attendeeCount || 0,
        locations: locationEvents.map(le => le.location)
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  // Update an event with tags
  async updateEvent(eventId, eventData) {
    try {
      // Comprehensive input validation for tags
      let tagsArray = [];
      if (typeof eventData.tags === 'string') {
        tagsArray = eventData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag && /^[\w#\- ]{1,32}$/.test(tag)); // Only allow word chars, #, -, space, max 32 chars
      } else if (Array.isArray(eventData.tags)) {
        tagsArray = eventData.tags
          .map(tag => (typeof tag === 'string' ? tag.trim() : ''))
          .filter(tag => tag && /^[\w#\- ]{1,32}$/.test(tag));
      }

      // Get current user's timezone
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not get current user');

      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('uuid', user.id)
        .single();

      if (profileError) {
        console.warn('Could not get user timezone, using UTC:', profileError);
      }

      const userTimezone = userProfile?.timezone || 'UTC';

      // Store scheduled time as provided (datetime-local input is already in local time)
      let scheduledTimeUTC = null;
      if (eventData.scheduledTime) {
        try {
          // Use timezone utility to convert local datetime input to UTC
          scheduledTimeUTC = convertLocalToUTC(eventData.scheduledTime, userTimezone);
        } catch (error) {
          console.error('Error processing scheduled time:', error);
          scheduledTimeUTC = eventData.scheduledTime;
        }
      }

      // Update event
      const { error: updateError } = await supabase
        .from('events')
        .update({
          event: eventData.title,
          location: eventData.location,
          description: eventData.description || null,
          image_url: eventData.imageUrl,
          scheduled_time: scheduledTimeUTC,
          price: eventData.price ? parseFloat(eventData.price) : null,
          capacity: eventData.capacity ? parseInt(eventData.capacity) : null,
          event_type: eventData.eventType || 'general'
        })
        .eq('uuid', eventId);

      if (updateError) throw updateError;

      // Update location association if location changed
      if (eventData.location) {
        try {
          // Remove existing location associations
          await supabase
            .from('location_events')
            .delete()
            .eq('event_id', eventId);

          // Create new location association
          const location = await locationService.getOrCreateLocation(eventData.location);
          await locationService.linkEventToLocation(eventId, location.uuid);
        } catch (locationError) {
          console.warn('Could not update event location association:', locationError);
          // Don't fail the event update if location linking fails
        }
      }

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

  // Get events for a specific user ID
  async getUserEventsById(userId) {
    try {
      // Get events where the specified user is a host
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
      console.error('Error fetching user events by ID:', error);
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

  // Get events by location
  async getEventsByLocation(locationId) {
    try {
      return await locationService.getLocationEvents(locationId);
    } catch (error) {
      console.error('Error getting events by location:', error);
      throw error;
    }
  },

  // Search events by location name
  async searchEventsByLocation(locationName) {
    try {
      // First find the location
      const locations = await locationService.searchLocations(locationName);

      if (locations.length === 0) {
        return [];
      }

      // Get events for all matching locations
      const allEvents = [];
      for (const location of locations) {
        const events = await locationService.getLocationEvents(location.uuid);
        allEvents.push(...events);
      }

      // Remove duplicates and return
      const uniqueEvents = allEvents.filter((event, index, self) =>
        index === self.findIndex(e => e.uuid === event.uuid)
      );

      return uniqueEvents;
    } catch (error) {
      console.error('Error searching events by location:', error);
      throw error;
    }
  }
};