import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateInTimezone } from '../../../utils/timezoneUtils';

interface BusinessLocationTag {
  tag: string;
}

interface BusinessLocation {
  uuid: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  country?: string;
  longitude?: number;
  latitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  business_type: string;
  hours_of_operation?: string;
  price_range?: string;
  amenities?: string[];
  image_url?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  business_location_tags?: BusinessLocationTag[];
}

interface BusinessLocationCardProps {
  business: BusinessLocation;
  openEditBusinessModal: (business: BusinessLocation) => void;
  setDeleteBusinessModal: (modal: { open: boolean; businessUuid: string }) => void;
  setSelectedBusiness: (business: BusinessLocation | null) => void;
  setShowBusinessModal: (show: boolean) => void;
}

const BusinessLocationCard: React.FC<BusinessLocationCardProps> = ({ 
  business, 
  openEditBusinessModal, 
  setDeleteBusinessModal, 
  setSelectedBusiness, 
  setShowBusinessModal 
}) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    // Navigate to business location detail page
    navigate(`/dashboard/place/${business.uuid}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEditBusinessModal(business);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteBusinessModal({ open: true, businessUuid: business.uuid });
  };

  const getBusinessTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      'general': 'General',
      'restaurant': 'Restaurant',
      'retail': 'Retail',
      'service': 'Service',
      'entertainment': 'Entertainment',
      'healthcare': 'Healthcare',
      'fitness': 'Fitness',
      'beauty': 'Beauty & Spa',
      'professional': 'Professional Services',
      'other': 'Other'
    };
    return typeLabels[type] || type;
  };

  const getPriceRangeLabel = (range?: string): string => {
    if (!range) return 'Not specified';
    const rangeLabels: Record<string, string> = {
      '$': '$ (Inexpensive)',
      '$$': '$$ (Moderate)',
      '$$$': '$$$ (Expensive)',
      '$$$$': '$$$$ (Very Expensive)'
    };
    return rangeLabels[range] || range;
  };

  return (
    <div className="event-card" onClick={handleCardClick}>
      <div className="event-image-container">
        {business.image_url ? (
          <img
            src={business.image_url}
            alt={business.name}
            className="event-image"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="event-image-placeholder">
            <span>🏢</span>
          </div>
        )}
      </div>

      <div className="event-content">
        <div className="event-header">
          <h3 className="event-title">{business.name}</h3>
          <div className="event-type">{getBusinessTypeLabel(business.business_type)}</div>
        </div>

        <div className="event-details">
          <div className="business-location">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" style={{ color: 'currentColor', marginRight: '4px' }}>
              <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
            </svg>
            {business.address || 'Location not specified'}
          </div>

          {business.price_range && (
            <div className="event-price">
              <span className="price-icon">💰</span>
              <span>{getPriceRangeLabel(business.price_range)}</span>
            </div>
          )}

          {business.hours_of_operation && (
            <div className="event-time">
              <span className="time-icon">🕒</span>
              <span>{business.hours_of_operation}</span>
            </div>
          )}
        </div>

        {business.description && (
          <p className="event-description">
            {business.description.length > 100 
              ? `${business.description.substring(0, 100)}...` 
              : business.description}
          </p>
        )}

        {business.amenities && business.amenities.length > 0 && (
          <div className="event-tags">
            {business.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="tag">
                {amenity}
              </span>
            ))}
            {business.amenities.length > 3 && (
              <span className="tag">+{business.amenities.length - 3} more</span>
            )}
          </div>
        )}

        {business.business_location_tags && business.business_location_tags.length > 0 && (
          <div className="event-tags">
            {business.business_location_tags.slice(0, 3).map((tagItem, index) => (
              <span key={index} className="tag">
                #{tagItem.tag}
              </span>
            ))}
            {business.business_location_tags.length > 3 && (
              <span className="tag">+{business.business_location_tags.length - 3} more</span>
            )}
          </div>
        )}

        <div className="event-footer">
          <div className="event-date">
            Created {formatDateInTimezone(business.created_at, 'MMM d, yyyy')}
          </div>
        </div>

        {/* Action buttons - only at the bottom, never overlay */}
        <div className="event-actions" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button
            className="edit-btn"
            onClick={handleEditClick}
            style={{
              background: '#007AFF',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Edit
          </button>
          <button
            className="delete-btn"
            onClick={handleDeleteClick}
            style={{
              background: '#ff3b30',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessLocationCard;
