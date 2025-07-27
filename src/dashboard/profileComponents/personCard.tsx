import React from 'react';

interface Person {
  uuid: string;
  service: string;
  description?: string;
  location?: string;
  contact_info?: string;
  service_type?: string;
  hourly_rate?: number;
  review_count?: number;
  rating?: number;
  created_at?: string;
  profiles?: {
    uuid: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface PersonCardProps {
  person: Person;
  onEdit?: (person: Person) => void;
  onDelete?: (personUuid: string) => void;
  onView?: (person: Person) => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ 
  person, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  console.log('PersonCard received person data:', person);
  const getServiceTypeColor = (serviceType: string) => {
    const colors: { [key: string]: string } = {
      professional: 'bg-blue-100 text-blue-800',
      creative: 'bg-purple-100 text-purple-800',
      technical: 'bg-green-100 text-green-800',
      healthcare: 'bg-red-100 text-red-800',
      education: 'bg-yellow-100 text-yellow-800',
      consulting: 'bg-indigo-100 text-indigo-800',
      maintenance: 'bg-gray-100 text-gray-800',
      transportation: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[serviceType] || colors.general;
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Negotiable';
    return `$${price.toFixed(2)}/hr`;
  };

  const formatRating = (rating?: number) => {
    if (!rating || rating === 0) return null;
    return rating.toFixed(1);
  };

    return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col h-full"
      onClick={() => onView?.(person)}
    >
      {/* Header with avatar and service type */}
      <div className="p-4 pb-3 flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {person.service[0]?.toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {person.service}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {person.profiles?.display_name || `@${person.profiles?.username}` || 'Your Service'}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(person.service_type || 'general')}`}>
            {person.service_type || 'General'}
          </span>
        </div>

        {/* Description */}
        {person.description && (
          <p className="text-sm text-gray-600 mb-3 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.4em',
            maxHeight: '2.8em'
          }}>
            {person.description}
          </p>
        )}

        {/* Location and price */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <span className="mr-1">📍</span>
            <span className="truncate">
              {person.location || 'Location not specified'}
            </span>
          </div>
          <span className="font-medium text-green-600">
            {formatPrice(person.hourly_rate)}
          </span>
        </div>

        {/* Contact info preview */}
        {person.contact_info && (
          <div className="flex items-center text-gray-500 text-sm mt-2">
            <span className="mr-1">📞</span>
            <span className="truncate">
              {person.contact_info}
            </span>
          </div>
        )}
      </div>

      {/* Spacer to push footer to bottom */}
      <div className="flex-1"></div>

             {/* Footer with rating and metadata */}
       <div className="px-4 pb-3 flex-shrink-0">
         <div className="flex items-center justify-between">
           <div className="flex items-center space-x-4">
             {formatRating(person.rating) && (
               <div className="flex items-center space-x-1">
                 <span className="text-yellow-400">★</span>
                 <span className="text-sm font-medium text-gray-700">
                   {formatRating(person.rating)}
                 </span>
                 {person.review_count && person.review_count > 0 && (
                   <span className="text-xs text-gray-500">
                     ({person.review_count})
                   </span>
                 )}
               </div>
             )}
             <div className="text-xs text-gray-500">
               Created {person.created_at ? new Date(person.created_at).toLocaleDateString() : 'recently'}
             </div>
           </div>
         </div>
       </div>

       {/* Action buttons - matching other cards */}
       <div className="px-4 pb-4 flex-shrink-0">
         <div className="flex gap-2">
           {onEdit && (
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onEdit(person);
               }}
               className="flex-1 bg-blue-500 hover:bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200"
             >
               Edit
             </button>
           )}
           {onDelete && (
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onDelete(person.uuid);
               }}
               className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none py-2 px-4 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200"
             >
               Delete
             </button>
           )}
         </div>
       </div>
    </div>
  );
};

export default PersonCard;
