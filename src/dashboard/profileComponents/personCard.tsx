import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getServiceTypeColor, formatPrice, formatRating } from '../utils/personHelpers';

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
  const navigate = useNavigate();

    return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col h-full"
      onClick={() => {
        // Navigate to person detail page
        navigate(`/dashboard/person/${person.uuid}`);
      }}
    >
      {/* Image placeholder */}
      <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-3xl">👤</div>
      </div>

      {/* Content area */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Service Type - Main Title */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-lg">
            {person.service_type || 'Service'}
          </h3>
        </div>

        {/* Description */}
        {person.description && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 line-clamp-3">
              {person.description}
            </p>
          </div>
        )}

        {/* Hourly Rate - Prominent Display */}
        {person.hourly_rate && (
          <div className="mb-3">
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Hourly Rate:</span>
              <span className="font-bold text-green-600 text-lg">
                {formatPrice(person.hourly_rate)}
              </span>
            </div>
          </div>
        )}

        {/* Optional additional info */}
        {person.location && (
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 16 16" className="mr-1">
              <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
            </svg>
            <span className="truncate">
              {person.location}
            </span>
          </div>
        )}

        {person.rating && (
          <div className="flex items-center space-x-1 mb-2">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-sm text-gray-700">
              {formatRating(person.rating)}
            </span>
            {person.review_count && person.review_count > 0 && (
              <span className="text-xs text-gray-500">
                ({person.review_count})
              </span>
            )}
          </div>
        )}

        {person.contact_info && (
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <span className="mr-1">📞</span>
            <span className="truncate">
              {person.contact_info}
            </span>
          </div>
        )}

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1"></div>

        {/* Action buttons at bottom */}
        <div className="flex gap-2 pt-3">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(person);
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white border-none py-2 px-3 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200"
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
              className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none py-2 px-3 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200"
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
