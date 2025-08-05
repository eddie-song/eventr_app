import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen.js';
import { usePageCache } from '../context/PageCacheContext.js';
import { businessLocationService } from '../../services/businessLocationService';

interface Place {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  image: string;
  description: string;
  tags: string[];
  review_count: number;
  address: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  hours_of_operation: string;
  price_range: string;
  amenities: string[];
}

interface BusinessLocation {
  uuid: string;
  name: string;
  business_type?: string;
  rating?: number;
  image_url?: string;
  description?: string;
  tags?: string[];
  review_count?: number;
  address: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  hours_of_operation: string;
  price_range: string;
  amenities?: string[];
}

interface Category {
  id: string;
  name: string;
}

function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const { isPageLoaded, markPageAsLoaded } = usePageCache();
  const [places, setPlaces] = useState<BusinessLocation[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Recommended places section - service coming soon
  const recommendedPlaces: Place[] = [];

  const categories: Category[] = [
    { id: 'all', name: 'All Places' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'outdoor', name: 'Outdoor' },
    { id: 'culture', name: 'Arts & Culture' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'community', name: 'Community' }
  ];

  // Transform business location data to match the expected format
  const transformBusinessLocation = (location: BusinessLocation): Place => {
    return {
      id: location.uuid,
      name: location.name,
      category: location.business_type || 'general',
      rating: location.rating || 0.0,
      distance: 'Distance not available', // Could be calculated later with geolocation
      image: location.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      description: location.description || 'No description available.',
      tags: location.tags || [],
      review_count: location.review_count || 0,
      address: location.address,
      city: location.city,
      state: location.state,
      phone: location.phone,
      website: location.website,
      hours_of_operation: location.hours_of_operation,
      price_range: location.price_range,
      amenities: location.amenities || []
    };
  };

  const filteredPlaces = places
    .map(transformBusinessLocation)
    .filter(place => {
      const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (place.description && place.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  // Fetch business locations from database
  useEffect(() => {
    const fetchBusinessLocations = async () => {
      try {
        const businessLocations = await businessLocationService.getAllBusinessLocations();
        setPlaces(businessLocations || []);
      } catch (err) {
        console.error('Error fetching business locations:', err);
        setError('Failed to load business locations');
        setPlaces([]);
      }
    };

    if (isPageLoaded('explore')) {
      setIsLoading(false);
      fetchBusinessLocations();
    } else {
      // Simulate loading time
      const loadingTime = Math.random() * 1000 + 1000; // Random time between 1-2 seconds
      const timer = setTimeout(async () => {
        await fetchBusinessLocations();
        setIsLoading(false);
        markPageAsLoaded('explore');
      }, loadingTime);
      return () => clearTimeout(timer);
    }
  }, [isPageLoaded, markPageAsLoaded]);

  const PlaceCard = ({ place }: { place: Place }) => (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
      onClick={() => navigate(`/dashboard/place/${place.id}`)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={place.image} 
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2.5 py-1.5 rounded-full flex items-center gap-1 text-sm font-semibold">
          <span className="text-xs">⭐</span>
          <span className="font-semibold text-white">{place.rating}</span>
          <span className="text-xs opacity-90">({place.review_count})</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 m-0 leading-tight">{place.name}</h3>
          <span className="text-sm text-blue-500 font-medium whitespace-nowrap ml-3">{place.distance}</span>
        </div>
        <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 bg-gray-50 rounded-lg border-l-4 border-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" className="text-current mr-1">
            <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
          </svg>
          <span className="font-medium text-gray-900 text-sm">{place.city && place.state ? `${place.city}, ${place.state}` : place.address || 'Location not specified'}</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed m-0 mb-4 line-clamp-2">{place.description}</p>
        <div className="flex justify-between items-start gap-3">
          <div className="flex flex-wrap gap-1.5 flex-1 items-start">
            {place.tags && place.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-900 px-2 py-1 rounded-xl text-xs font-medium transition-colors duration-200 hover:bg-gray-200">{tag}</span>
            ))}
            {place.tags && place.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-xl text-xs font-medium italic">+{place.tags.length - 3}</span>
            )}
          </div>
          {place.price_range && (
            <div className="bg-gray-100 text-gray-900 px-2 py-1 rounded-xl text-xs font-medium whitespace-nowrap">
              <span className="text-gray-900 font-medium">{place.price_range}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const RecommendedPlaceCard = ({ place }: { place: Place }) => (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 transition-all duration-200 cursor-pointer relative hover:-translate-y-0.5 hover:shadow-lg"
      onClick={() => navigate(`/dashboard/place/${place.id}`)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={place.image} 
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2.5 py-1.5 rounded-full flex items-center gap-1 text-sm font-semibold">
          <span className="text-xs">⭐</span>
          <span className="font-semibold text-white">{place.rating}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 flex-row-reverse">
            <h3 className="text-lg font-semibold text-gray-900 m-0 leading-tight">{place.name}</h3>
            <div className="text-blue-500 text-sm mr-1 flex-shrink-0">
              <span>⭐</span>
            </div>
          </div>
          <span className="text-sm text-blue-500 font-medium whitespace-nowrap ml-3">{place.distance}</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed m-0 mb-3">{place.description}</p>
        <div className="my-3 px-3 py-2 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <span className="text-xs text-blue-500 font-medium italic">{(place as any).reason}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {place.tags.map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-900 px-2 py-1 rounded-xl text-xs font-medium transition-colors duration-200 hover:bg-gray-200">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen message="Loading Places For You . . ." />;
  }
  
  return (
    <div id="explore-page-container" className="w-full min-h-full p-0 bg-transparent">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 m-0 mb-2 tracking-tight">Explore Places</h1>
        <p className="text-lg text-gray-500 m-0 font-normal">Discover amazing places near you</p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-lg">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg text-gray-500 z-10">🔍</span>
          <input
            type="text"
            placeholder="Search places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 px-4 pl-12 border border-gray-200 rounded-xl text-base bg-white text-gray-900 transition-all duration-200 box-border focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="mb-8">
                 <div className="flex gap-3 overflow-x-auto py-1 scrollbar-hide">
           {categories.map(category => (
             <button
               key={category.id}
               className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
               onClick={() => setSelectedCategory(category.id)}
             >
               <span className="category-name">{category.name}</span>
             </button>
           ))}
         </div>
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 m-0">Recommended For You</h2>
          <span className="text-sm text-blue-500 font-medium">Service coming soon...</span>
        </div>
        
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
           <div className="bg-white rounded-2xl p-15 text-center shadow-sm border border-gray-200 col-span-full min-h-[300px] flex flex-col justify-center items-center">
             <div className="text-5xl mb-4 opacity-70">🚀</div>
             <h3 className="text-xl font-semibold text-gray-900 m-0 mb-2">Service Coming Soon...</h3>
             <p className="text-base text-gray-500 m-0 font-normal">We're working on personalized recommendations just for you!</p>
           </div>
         </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 m-0">{selectedCategory === 'all' ? 'All Places' : categories.find(c => c.id === selectedCategory)?.name}</h2>
          <span className="text-sm text-gray-500 font-medium">{filteredPlaces.length} places found</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredPlaces.map(place => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>

                 {filteredPlaces.length === 0 && (
           <div className="text-center py-15 px-5 text-gray-500">
             <div className="text-5xl mb-4 opacity-50">🔍</div>
             <h3 className="text-xl font-semibold text-gray-900 m-0 mb-2">No places found</h3>
             <p className="text-base m-0 text-gray-500">
               {places.length === 0 
                 ? "No business locations have been added yet. Be the first to create a business listing!" 
                 : "Try adjusting your search or category filter"
               }
             </p>
             {places.length === 0 && (
               <button 
                 onClick={() => navigate('/create')} 
                 style={{
                   background: '#007AFF',
                   color: 'white',
                   border: 'none',
                   padding: '12px 24px',
                   borderRadius: '8px',
                   cursor: 'pointer',
                   marginTop: '16px',
                   fontSize: '14px',
                   fontWeight: '500'
                 }}
               >
                 Add Your First Business
               </button>
             )}
           </div>
         )}
      </div>
    </div>
  );
}

export default Explore;
