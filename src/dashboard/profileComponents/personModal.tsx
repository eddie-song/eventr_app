import React from 'react';
import { getServiceTypeColor, formatPrice, formatRating, formatDate } from '../utils/personHelpers';

interface Person {
  uuid: string;
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

interface PersonModalProps {
  person: Person;
  onClose: () => void;
}

const PersonModal: React.FC<PersonModalProps> = ({ person, onClose }) => {
  const [copyStatus, setCopyStatus] = React.useState<'idle' | 'copying' | 'success' | 'error'>('idle');

  const handleCopyContact = async () => {
    if (!person.contact_info) return;
    
    setCopyStatus('copying');
    
    try {
      // Check if clipboard API is supported
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported');
      }
      
      await navigator.clipboard.writeText(person.contact_info);
      setCopyStatus('success');
      
      // Reset status after 2 seconds
      setTimeout(() => setCopyStatus('idle'), 2000);
      
    } catch (error) {
      console.error('Failed to copy contact info:', error);
      setCopyStatus('error');
      
      // Reset status after 3 seconds for errors
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-4">
               <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                                   {(person.service_type || 'S')[0]?.toUpperCase() || 'S'}
               </div>
               <div>
                                   <h2 className="text-2xl font-bold text-gray-900">{person.service_type || 'Service'}</h2>
                 <p className="text-gray-600">
                   by {person.profiles?.display_name || `@${person.profiles?.username}` || 'You'}
                 </p>
               </div>
             </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Service Type Badge */}
          <div className="mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getServiceTypeColor(person.service_type || 'general')}`}>
              {person.service_type || 'General'} Service
            </span>
          </div>

          {/* Description */}
          {person.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{person.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
              <div className="flex items-center text-gray-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" style={{ color: 'currentColor', marginRight: '8px' }}>
                <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
              </svg>
              <span>{person.location || 'Location not specified'}</span>
            </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Rate</h3>
              <div className="text-green-600 font-semibold text-lg">
                {formatPrice(person.hourly_rate)}
              </div>
            </div>

            {/* Contact Info */}
            {person.contact_info && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact</h3>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">📞</span>
                  <span>{person.contact_info}</span>
                </div>
              </div>
            )}

            {/* Rating */}
            {formatRating(person.rating) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rating</h3>
                <div className="flex items-center">
                  <span className="text-yellow-400 text-xl mr-2">★</span>
                  <span className="text-lg font-semibold text-gray-700">
                    {formatRating(person.rating)}
                  </span>
                  {person.review_count && person.review_count > 0 && (
                    <span className="text-gray-500 ml-2">
                      ({person.review_count} reviews)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Created Date */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500">
              Service created {formatDate(person.created_at)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {person.contact_info && (
              <button
                onClick={handleCopyContact}
                disabled={copyStatus === 'copying'}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  copyStatus === 'success' 
                    ? 'bg-green-600 text-white' 
                    : copyStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : copyStatus === 'copying'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copyStatus === 'copying' && 'Copying...'}
                {copyStatus === 'success' && '✓ Copied!'}
                {copyStatus === 'error' && '✗ Failed'}
                {copyStatus === 'idle' && 'Copy Contact'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonModal; 