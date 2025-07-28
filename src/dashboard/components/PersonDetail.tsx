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
        setPerson(data);
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading person details...</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Person Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The person you are looking for does not exist.'}</p>
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
              <h1 className="text-xl font-semibold text-gray-900">{person.profiles?.display_name || person.profiles?.username || 'Service Provider'}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{person.service_type}</span>
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
                <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-6xl">👤</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h1 className="text-2xl font-bold mb-2">{person.profiles?.display_name || person.profiles?.username || 'Service Provider'}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="font-semibold">{person.rating || 0}</span>
                    <span className="ml-1">({person.review_count || 0} reviews)</span>
                  </div>
                  {person.hourly_rate && (
                    <span className="text-sm bg-white/20 px-2 py-1 rounded">
                      ${person.hourly_rate}/hour
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Service Details</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-gray-500 mr-3 mt-1">💼</span>
                  <div>
                    <p className="text-gray-900 font-medium">{person.service}</p>
                    <p className="text-gray-600 text-sm">Service Type: {person.service_type}</p>
                  </div>
                </div>
                {person.location && (
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" style={{ color: 'currentColor', marginRight: '12px', marginTop: '4px' }}>
                      <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
                    </svg>
                    <div>
                      <p className="text-gray-900">{person.location || 'Location not specified'}</p>
                    </div>
                  </div>
                )}
                {person.description && (
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-3 mt-1">📝</span>
                    <div>
                      <p className="text-gray-700 leading-relaxed">{person.description}</p>
                    </div>
                  </div>
                )}
                {person.profiles?.bio && (
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-3 mt-1">👤</span>
                    <div>
                      <p className="text-gray-700 leading-relaxed">{person.profiles.bio}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            {person.contact_info && (
              <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-3 mt-1">📞</span>
                    <div>
                      <p className="text-gray-700">{person.contact_info}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Type Tags */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Service Type</h2>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {person.service_type || 'General'}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Service Type */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Service Type</h2>
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {person.service_type || 'General'}
              </span>
            </div>

            {/* Hourly Rate */}
            {person.hourly_rate && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Hourly Rate</h2>
                <span className="text-2xl font-bold text-gray-900">
                  ${person.hourly_rate}/hour
                </span>
              </div>
            )}

            {/* Rating */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Rating</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-2">⭐</span>
                  <span className="text-2xl font-bold text-gray-900">{person.rating || 0}</span>
                </div>
                <p className="text-gray-600">({person.review_count || 0} reviews)</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Member Since</h2>
              <p className="text-gray-700">
                {new Date(person.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  onClick={() => {
                    // TODO: Add hire functionality
                    console.log('Hire clicked');
                  }}
                >
                  Hire This Person
                </button>
                <button
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  onClick={() => {
                    // TODO: Add message functionality
                    console.log('Message clicked');
                  }}
                >
                  Send Message
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