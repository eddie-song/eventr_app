import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { formatDateInTimezone, getUserTimezone } from '../../utils/timezoneUtils';
import EventImage from '../../components/eventImage';

interface Event {
  uuid: string;
  event: string;
  description: string;
  location: string;
  image_url: string;
  scheduled_time: string;
  price: number;
  capacity: number;
  event_type: string;
  status: string;
  rating: number;
  review_count: number;
  tags: string[];
  hosts: string[];
  attendeeCount: number;
  locations: Array<{
    uuid: string;
    location: string;
    longitude: number;
    latitude: number;
  }>;
}

interface EventDetailProps {
  eventId?: string;
}

const EventDetail: React.FC<EventDetailProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState('UTC');

  useEffect(() => {
    const timezone = getUserTimezone();
    setUserTimezone(timezone);
  }, []);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        setError('No event ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await eventService.getEvent(eventId);
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    return formatDateInTimezone(dateString, userTimezone, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return null;
    return formatDateInTimezone(dateString, userTimezone, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return null;
    return formatDateInTimezone(dateString, userTimezone, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{event.event}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{event.event_type}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {event.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="relative h-80 rounded-xl overflow-hidden mb-8">
                             {event.image_url ? (
                 <EventImage 
                   imageUrl={event.image_url}
                   alt={event.event}
                   className="w-full h-full object-cover"
                                       onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                 />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-6xl">🎉</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h1 className="text-2xl font-bold mb-2">{event.event}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="font-semibold">{event.rating || 0}</span>
                    <span className="ml-1">({event.review_count || 0} reviews)</span>
                  </div>
                  {event.price !== null && (
                    <span className="text-sm bg-white/20 px-2 py-1 rounded">
                      {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="space-y-4">
                {event.scheduled_time && (
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-3 mt-1">📅</span>
                    <div>
                      <p className="text-gray-900 font-medium">{formatDate(event.scheduled_time)}</p>
                      <p className="text-gray-600">{formatTime(event.scheduled_time)}</p>
                    </div>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" style={{ color: 'currentColor', marginRight: '12px', marginTop: '4px' }}>
                      <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
                    </svg>
                    <div>
                      <p className="text-gray-900">{event.location || 'Location not specified'}</p>
                    </div>
                  </div>
                )}
                {event.description && (
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-3 mt-1">📝</span>
                    <div>
                      <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attendees */}
            {event.capacity && (
              <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Attendees</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-2">👥</span>
                    <span className="text-gray-900 font-medium">
                      {event.attendeeCount || 0} / {event.capacity} attendees
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((event.attendeeCount || 0) / event.capacity * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Type */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Event Type</h2>
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {event.event_type || 'General'}
              </span>
            </div>

            {/* Price */}
            {event.price !== null && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Price</h2>
                <span className="text-2xl font-bold text-gray-900">
                  {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                </span>
              </div>
            )}

            {/* Capacity */}
            {event.capacity && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Capacity</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Attendees</span>
                    <span className="font-semibold">{event.attendeeCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Maximum</span>
                    <span className="font-semibold">{event.capacity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available</span>
                    <span className="font-semibold text-green-600">
                      {Math.max(0, event.capacity - (event.attendeeCount || 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}

                         {/* Status */}
             <div className="bg-white rounded-xl p-6 shadow-sm">
               <h2 className="text-xl font-semibold mb-4">Status</h2>
               <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                 event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
               }`}>
                 {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
               </span>
             </div>

             {/* Action Buttons */}
             <div className="bg-white rounded-xl p-6 shadow-sm">
               <h2 className="text-xl font-semibold mb-4">Actions</h2>
               <div className="space-y-3">
                 <button
                   className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                   onClick={() => {
                     // TODO: Add sign up functionality
                     console.log('Sign up clicked');
                   }}
                 >
                   Sign Up for Event
                 </button>
                 <button
                   className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                   onClick={() => {
                     // TODO: Add message host functionality
                     console.log('Message host clicked');
                   }}
                 >
                   Message Host
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail; 