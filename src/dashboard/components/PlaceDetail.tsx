import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessLocationService } from '../../services/businessLocationService';
import { getBusinessTypeLabel, getPriceRangeLabel } from '../../utils/businessUtils';

interface BusinessLocation {
  uuid: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  business_type: string;
  hours_of_operation: string;
  price_range: string;
  amenities: string[];
  image_url: string;
  rating: number;
  review_count: number;
  tags: string[];
  business_location_reviews?: Array<{
    rating: number;
    review_text: string;
    created_at: string;
    user_id: string;
  }>;
}

interface PlaceDetailProps {
  placeId?: string;
}

const PlaceDetail: React.FC<PlaceDetailProps> = ({ placeId }) => {
  const navigate = useNavigate();
  const [place, setPlace] = useState<BusinessLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!placeId) {
        setError('No place ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await businessLocationService.getBusinessLocationById(placeId);
        
        // Transform the data to match our interface
        const transformedData: BusinessLocation = {
          ...data,
          rating: (() => {
            if (!data.business_location_reviews?.length) return 0;
            
            // Filter out reviews with invalid or non-numeric ratings
            const validReviews = data.business_location_reviews.filter((review: any) => {
              const rating = review.rating;
              return rating !== null && 
                     rating !== undefined && 
                     !isNaN(Number(rating)) && 
                     Number(rating) >= 0 && 
                     Number(rating) <= 5;
            });
            
            if (validReviews.length === 0) return 0;
            
            // Calculate average rating from valid reviews only
            const totalRating = validReviews.reduce((sum: number, review: any) => sum + Number(review.rating), 0);
            const averageRating = totalRating / validReviews.length;
            
            return parseFloat(averageRating.toFixed(1));
          })(),
          review_count: data.business_location_reviews?.length || 0,
          tags: data.business_location_tags?.map((tagObj: any) => tagObj.tag) || []
        };
        
        setPlace(transformedData);
      } catch (err) {
        console.error('Error fetching place details:', err);
        setError('Failed to load place details');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [placeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Place Not Found</h2>
          <p className="text-gray-600 mb-8 text-lg">{error || 'The place you are looking for does not exist.'}</p>
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
                onClick={() => navigate('/dashboard?page=places')}
                className="mr-6 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{place.name}</h1>
                <p className="text-gray-500 text-sm mt-1">{getBusinessTypeLabel(place.business_type)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-yellow-100 px-4 py-2 rounded-full">
                <span className="text-yellow-600 mr-2">⭐</span>
                <span className="font-semibold text-yellow-800">{place.rating}</span>
                <span className="ml-2 text-yellow-700">({place.review_count})</span>
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
              <img
                src={place.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop'}
                alt={place.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">{place.name}</h1>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-yellow-400 mr-2 text-lg">⭐</span>
                    <span className="font-bold text-lg">{place.rating}</span>
                    <span className="ml-2 opacity-90">({place.review_count} reviews)</span>
                  </div>
                  {place.price_range && (
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="font-semibold">{getPriceRangeLabel(place.price_range)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {place.description || 'No description available for this place.'}
              </p>
            </div>

            {/* Reviews Card */}
            {place.business_location_reviews && place.business_location_reviews.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
                <div className="space-y-6">
                  {place.business_location_reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 mr-3">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-gray-600 font-medium">{review.rating}/5</span>
                        </div>
                        <span className="text-gray-500 text-sm">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Card */}
            {place.tags && place.tags.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tags</h2>
                <div className="flex flex-wrap gap-3">
                  {place.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm"
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
            {/* Contact Information Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                {place.address && (
                  <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">{place.address}</p>
                      {place.city && place.state && (
                        <p className="text-gray-600 text-sm">{place.city}, {place.state} {place.zip_code}</p>
                      )}
                    </div>
                  </div>
                )}
                {place.phone && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-lg">📞</span>
                    </div>
                    <a href={`tel:${place.phone}`} className="text-blue-600 hover:underline font-medium">
                      {place.phone}
                    </a>
                  </div>
                )}
                {place.email && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 text-lg">✉️</span>
                    </div>
                    <a href={`mailto:${place.email}`} className="text-blue-600 hover:underline font-medium">
                      {place.email}
                    </a>
                  </div>
                )}
                {place.website && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-orange-600 text-lg">🌐</span>
                    </div>
                    <a 
                      href={place.website.startsWith('http') ? place.website : `https://${place.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Hours of Operation Card */}
            {place.hours_of_operation && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Hours of Operation</h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line font-medium">{place.hours_of_operation}</p>
                </div>
              </div>
            )}

            {/* Amenities Card */}
            {place.amenities && place.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="space-y-3">
                  {place.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Business Information</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Business Type</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {getBusinessTypeLabel(place.business_type)}
                  </span>
                </div>
                {place.price_range && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Price Range</span>
                    <span className="text-lg font-bold text-gray-900">
                      {getPriceRangeLabel(place.price_range)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Rating</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="font-bold text-lg">{place.rating}</span>
                    <span className="ml-2 text-gray-600">({place.review_count})</span>
                  </div>
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
                    console.log('Visit place clicked');
                  }}
                >
                  Visit This Place
                </button>
                <button
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    console.log('Book appointment clicked');
                  }}
                >
                  Book Appointment
                </button>
                <button
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    console.log('Share place clicked');
                  }}
                >
                  Share This Place
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail; 