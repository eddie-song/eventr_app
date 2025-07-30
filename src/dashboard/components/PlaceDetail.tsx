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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Place Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The place you are looking for does not exist.'}</p>
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
              <h1 className="text-xl font-semibold text-gray-900">{place.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{getBusinessTypeLabel(place.business_type)}</span>
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
              <img
                src={place.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop'}
                alt={place.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h1 className="text-2xl font-bold mb-2">{place.name}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="font-semibold">{place.rating}</span>
                    <span className="ml-1">({place.review_count} reviews)</span>
                  </div>
                  {place.price_range && (
                    <span className="text-sm bg-white/20 px-2 py-1 rounded">
                      {getPriceRangeLabel(place.price_range)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {place.description || 'No description available for this place.'}
              </p>
            </div>

            {/* Reviews */}
            {place.business_location_reviews && place.business_location_reviews.length > 0 && (
              <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                <div className="space-y-4">
                  {place.business_location_reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.review_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {place.tags && place.tags.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {place.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
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
            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                {place.address && (
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" style={{ color: 'currentColor', marginRight: '12px', marginTop: '4px' }}>
                      <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
                    </svg>
                    <div>
                      <p className="text-gray-900">{place.address}</p>
                      {place.city && place.state && (
                        <p className="text-gray-600">{place.city}, {place.state} {place.zip_code}</p>
                      )}
                    </div>
                  </div>
                )}
                {place.phone && (
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-3">📞</span>
                    <a href={`tel:${place.phone}`} className="text-blue-600 hover:underline">
                      {place.phone}
                    </a>
                  </div>
                )}
                {place.email && (
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-3">✉️</span>
                    <a href={`mailto:${place.email}`} className="text-blue-600 hover:underline">
                      {place.email}
                    </a>
                  </div>
                )}
                {place.website && (
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-3">🌐</span>
                    <a 
                      href={place.website.startsWith('http') ? place.website : `https://${place.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Hours of Operation */}
            {place.hours_of_operation && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Hours of Operation</h2>
                <p className="text-gray-700 whitespace-pre-line">{place.hours_of_operation}</p>
              </div>
            )}

            {/* Amenities */}
            {place.amenities && place.amenities.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="space-y-2">
                  {place.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Type */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Business Type</h2>
              <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {getBusinessTypeLabel(place.business_type)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail; 