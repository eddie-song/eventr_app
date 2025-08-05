import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { personService } from '../../services/personService';

interface Person {
  uuid: string;
  service: string;
  description: string;
  location: string;
  contact_info: string;
  service_type: string;
  hourly_rate: number;
  rating: number;
  review_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    uuid: string;
    username: string;
    display_name: string;
    avatar_url: string;
    bio: string;
  };
}

interface PersonDetailProps {
  personId?: string;
}

const PersonDetail: React.FC<PersonDetailProps> = ({ personId }) => {
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonDetails = async () => {
      if (!personId) {
        setError('No person ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await personService.getPerson(personId);
        
        // Check if person data is null or undefined
        if (!data) {
          setError('Person not found');
          setPerson(null);
        } else {
          setPerson(data);
        }
      } catch (err) {
        console.error('Error fetching person details:', err);
        setError('Failed to load person details');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonDetails();
  }, [personId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading person details...</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Person Not Found</h2>
          <p className="text-gray-600 mb-8 text-lg">{error || 'The person you are looking for does not exist.'}</p>
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
                onClick={() => navigate('/dashboard?page=people')}
                className="mr-6 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{person.profiles?.display_name || person.profiles?.username || 'Service Provider'}</h1>
                <p className="text-gray-500 text-sm mt-1">{person.service_type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-yellow-100 px-4 py-2 rounded-full">
                <span className="text-yellow-600 mr-2">⭐</span>
                <span className="font-semibold text-yellow-800">{person.rating || 0}</span>
                <span className="ml-2 text-yellow-700">({person.review_count || 0})</span>
              </div>
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
              {person.profiles?.avatar_url ? (
                <img 
                  src={person.profiles.avatar_url}
                  alt={person.profiles?.display_name || person.profiles?.username || 'Service Provider'}
                  className="w-full h-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-8xl">👤</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">{person.profiles?.display_name || person.profiles?.username || 'Service Provider'}</h1>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
                    <span className="text-yellow-400 mr-2 text-lg">⭐</span>
                    <span className="font-bold text-lg">{person.rating || 0}</span>
                    <span className="ml-2 opacity-90">({person.review_count || 0} reviews)</span>
                  </div>
                  {person.hourly_rate && (
                    <div className="bg-white/20 px-4 py-2 rounded-full">
                      <span className="font-semibold">${person.hourly_rate}/hour</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Service Details Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Details</h2>
              <div className="space-y-6">
                <div className="flex items-start p-4 bg-blue-50 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-xl">💼</span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-lg">Service Type</p>
                    <p className="text-gray-600 text-base">{person.service_type}</p>
                  </div>
                </div>
                {person.location && (
                  <div className="flex items-start p-4 bg-green-50 rounded-xl">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-lg">Location</p>
                      <p className="text-gray-600 text-base">{person.location}</p>
                    </div>
                  </div>
                )}
                {person.description && (
                  <div className="flex items-start p-4 bg-purple-50 rounded-xl">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-purple-600 text-xl">📝</span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-lg">Service Description</p>
                      <p className="text-gray-700 leading-relaxed text-base">{person.description}</p>
                    </div>
                  </div>
                )}
                {person.profiles?.bio && (
                  <div className="flex items-start p-4 bg-orange-50 rounded-xl">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-orange-600 text-xl">👤</span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-lg">About</p>
                      <p className="text-gray-700 leading-relaxed text-base">{person.profiles.bio}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Card */}
            {person.contact_info && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="flex items-start p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-xl">📞</span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-lg">Contact</p>
                    <p className="text-gray-700 text-base">{person.contact_info}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Service Type Tags Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Type</h2>
              <div className="flex flex-wrap gap-3">
                <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                  {person.service_type || 'General'}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Info</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Service Type</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {person.service_type || 'General'}
                  </span>
                </div>
                {person.hourly_rate && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Hourly Rate</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${person.hourly_rate}/hour
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Rating</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="font-bold text-lg">{person.rating || 0}</span>
                    <span className="ml-2 text-gray-600">({person.review_count || 0})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(person.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}
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
                    console.log('Hire clicked');
                  }}
                >
                  Hire This Person
                </button>
                <button
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    console.log('Message clicked');
                  }}
                >
                  Send Message
                </button>
                <button
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    console.log('Schedule consultation clicked');
                  }}
                >
                  Schedule Consultation
                </button>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Share Profile</h2>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Share on Social Media
                </button>
                <button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Copy Profile Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail; 