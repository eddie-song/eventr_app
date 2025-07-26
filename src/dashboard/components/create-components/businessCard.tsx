import React from 'react';
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
  const handleCardClick = () => {
    setSelectedBusiness(business);
    setShowBusinessModal(true);
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
          <div className="event-location">
            <span className="location-icon">📍</span>
            <span>{business.city}, {business.state}</span>
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
