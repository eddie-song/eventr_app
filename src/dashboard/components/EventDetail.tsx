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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#2B0A50] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 mt-4 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Event Not Found</h2>
          <p className="text-slate-600 mb-8">{error || 'The event you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all duration-200 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="sticky top-0 z-50 bg-white/80 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard?page=events')}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              <div className="h-6 w-px bg-slate-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{event.event}</h1>
                <p className="text-slate-500 text-sm">{event.event_type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                event.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-700'
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
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl">
              {event.image_url ? (
                <EventImage 
                  imageUrl={event.image_url}
                  alt={event.event}
                  className="w-full h-full object-cover"
                  onError={() => {}}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h1 className="text-3xl font-bold mb-3 drop-shadow-lg">{event.event}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-white/20 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{event.rating || 0}</span>
                    <span className="ml-1 opacity-80 text-sm">({event.review_count || 0})</span>
                  </div>
                  {event.price !== null && (
                    <div className="bg-white/20 px-3 py-1.5 rounded-full">
                      <span className="font-semibold text-sm">
                        {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            <div className="bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Date & Time */}
                {event.scheduled_time && (
                  <div className="flex items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold text-sm">{formatDate(event.scheduled_time)}</p>
                      <p className="text-slate-600 text-xs">{formatTime(event.scheduled_time)}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {event.location && (
                  <div className="flex items-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold text-sm">Location</p>
                      <p className="text-slate-600 text-xs">{event.location}</p>
                    </div>
                  </div>
                )}

                {/* Price */}
                {event.price !== null && (
                  <div className="flex items-center p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold text-sm">Price</p>
                      <p className="text-slate-600 text-xs">
                        {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Capacity & Attendees */}
                {event.capacity && (
                  <div className="flex items-center p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold text-sm">Attendees</p>
                      <p className="text-slate-600 text-xs">
                        {event.attendeeCount || 0} / {event.capacity}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div className="mt-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold mb-2 text-sm">Description</p>
                      <p className="text-slate-700 leading-relaxed text-sm">{event.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mt-6">
                  <p className="text-slate-900 font-semibold mb-3 text-sm">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-slate-800 transition-colors duration-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white/70 rounded-3xl p-6 shadow-xl border border-white/20">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                  <span className="text-slate-600 font-medium text-sm">Event Type</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                    {event.event_type || 'General'}
                  </span>
                </div>
                {event.price !== null && (
                  <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                    <span className="text-slate-600 font-medium text-sm">Price</span>
                    <span className="text-lg font-bold text-slate-900">
                      {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                    </span>
                  </div>
                )}
                {event.capacity && (
                  <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                    <span className="text-slate-600 font-medium text-sm">Capacity</span>
                    <span className="text-lg font-bold text-slate-900">{event.capacity}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                  <span className="text-slate-600 font-medium text-sm">Status</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    event.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                {event.capacity && (
                  <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                    <span className="text-slate-600 font-medium text-sm">Available</span>
                    <span className="text-lg font-bold text-slate-900">
                      {Math.max(0, event.capacity - (event.attendeeCount || 0))}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Card */}
            <div className="bg-white/70 rounded-3xl p-6 shadow-xl border border-white/20">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    console.log('Sign up clicked');
                  }}
                >
                  Sign Up for Event
                </button>
                <button
                  className="w-full bg-slate-100 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                  onClick={() => {
                    console.log('Message host clicked');
                  }}
                >
                  Message Host
                </button>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-white/70 rounded-3xl p-6 shadow-xl border border-white/20">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Share Event</h2>
              <div className="space-y-3">
                <button className="w-full bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Share on Social Media
                </button>
                <button className="w-full bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
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