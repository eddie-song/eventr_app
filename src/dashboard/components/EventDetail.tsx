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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-8 text-lg">{error || 'The event you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard?page=events')}
                className="mr-6 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{event.event}</h1>
                <p className="text-gray-500 text-sm mt-1">{event.event_type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                event.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg">
              {event.image_url ? (
                <EventImage 
                  imageUrl={event.image_url}
                  alt={event.event}
                  className="w-full h-full object-cover"
                  onError={() => {}}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-8xl">🎉</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">{event.event}</h1>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-yellow-400 mr-2 text-lg">⭐</span>
                    <span className="font-bold text-lg">{event.rating || 0}</span>
                    <span className="ml-2 opacity-90">({event.review_count || 0} reviews)</span>
                  </div>
                  {event.price !== null && (
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="font-semibold">
                        {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>
              <div className="space-y-6">
                {event.scheduled_time && (
                  <div className="flex items-start p-4 bg-blue-50 rounded-xl">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 text-xl">📅</span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-lg">{formatDate(event.scheduled_time)}</p>
                      <p className="text-gray-600 text-base">{formatTime(event.scheduled_time)}</p>
                    </div>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-start p-4 bg-green-50 rounded-xl">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-lg">Location</p>
                      <p className="text-gray-600 text-base">{event.location}</p>
                    </div>
                  </div>
                )}
                {event.description && (
                  <div className="flex items-start p-4 bg-purple-50 rounded-xl">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-purple-600 text-xl">📝</span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-lg">Description</p>
                      <p className="text-gray-700 leading-relaxed text-base">{event.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attendees Card */}
            {event.capacity && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendees</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-600 text-xl">👥</span>
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold text-lg">
                          {event.attendeeCount || 0} / {event.capacity} attendees
                        </p>
                        <p className="text-gray-600 text-sm">
                          {Math.max(0, event.capacity - (event.attendeeCount || 0))} spots remaining
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-600">
                        {Math.round((event.attendeeCount || 0) / event.capacity * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((event.attendeeCount || 0) / event.capacity * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Tags Card */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tags</h2>
                <div className="flex flex-wrap gap-3">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm"
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
            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Info</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Event Type</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {event.event_type || 'General'}
                  </span>
                </div>
                {event.price !== null && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Price</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                    </span>
                  </div>
                )}
                {event.capacity && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Capacity</span>
                    <span className="text-xl font-bold text-gray-900">{event.capacity}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    event.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    console.log('Sign up clicked');
                  }}
                >
                  Sign Up for Event
                </button>
                <button
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    console.log('Message host clicked');
                  }}
                >
                  Message Host
                </button>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Share Event</h2>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Share on Social Media
                </button>
                <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Copy Event Link
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